// Streaming API Client for Real-time Legal Analysis
const API_BASE = 'https://legal-backend-api-sse.onrender.com';

export interface StreamingAnalysisCallbacks {
  onStart?: () => void;
  onData?: (data: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

// Test function to verify API accessibility
const testApiAccess = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE}/`, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors'
    });
    
    clearTimeout(timeoutId);
    console.log('API test response:', response.status, response.statusText);
    return response.ok || response.status === 404; // 404 is fine, means server is up
  } catch (error) {
    console.error('API access test failed:', error);
    return false;
  }
};

export class StreamingLegalAnalyzer {
  private eventSource: EventSource | null = null;
  private callbacks: StreamingAnalysisCallbacks = {};
  private accumulatedResponse: string = '';

  constructor(callbacks: StreamingAnalysisCallbacks) {
    this.callbacks = callbacks;
  }

  async startAnalysis(caseDescription: string): Promise<void> {
    try {
      // Close any existing connection
      this.close();
      this.accumulatedResponse = '';

      console.log('Starting legal analysis...');
      
      // First test API accessibility
      const apiAccessible = await testApiAccess();
      if (!apiAccessible) {
        throw new Error('Unable to connect to the legal analysis API. The service may be temporarily unavailable.');
      }

      // Create the streaming connection
      const encodedPrompt = encodeURIComponent(caseDescription.trim());
      const url = `${API_BASE}/stream?prompt=${encodedPrompt}`;
      
      console.log('Starting SSE connection to:', url);
      
      this.eventSource = new EventSource(url);
      let connectionEstablished = false;

      // Set up event listeners
      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened successfully', event);
        connectionEstablished = true;
        this.callbacks.onStart?.();
      };

      this.eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data);
        connectionEstablished = true;
        
        // Handle regular data messages
        if (event.data && event.data.trim() && event.data !== '[DONE]') {
          const chunk = event.data;
          this.accumulatedResponse += chunk + '\n';
          this.callbacks.onData?.(chunk + '\n');
        }
      };

      // Listen for the 'done' event that signals completion
      this.eventSource.addEventListener('done', (event) => {
        console.log('Stream completed with done event', event);
        this.callbacks.onComplete?.(this.accumulatedResponse);
        this.close();
      });

      // Handle connection errors with detailed diagnosis
      this.eventSource.onerror = (event) => {
        console.error('EventSource error occurred:', event);
        console.error('EventSource readyState:', this.eventSource?.readyState);
        
        let errorMessage = '';
        
        if (!connectionEstablished) {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            errorMessage = 'Failed to establish connection to the legal analysis API. This could be due to:\n• Network connectivity issues\n• API service temporarily unavailable\n• Browser security restrictions\n\nPlease try again in a few moments.';
          } else {
            errorMessage = 'Connection to the legal analysis service is taking longer than expected. Please check your internet connection and try again.';
          }
        } else {
          // Connection was established but then failed
          if (this.accumulatedResponse.trim()) {
            console.log('Connection lost but we have partial response, treating as complete');
            this.callbacks.onComplete?.(this.accumulatedResponse);
            return;
          } else {
            errorMessage = 'Connection to the legal analysis service was lost. Please try again.';
          }
        }
        
        this.callbacks.onError?.(errorMessage);
        this.close();
      };

      // Set a connection timeout
      setTimeout(() => {
        if (this.eventSource?.readyState === EventSource.CONNECTING) {
          console.error('EventSource connection timeout');
          this.callbacks.onError?.('Connection timeout: Unable to connect to the legal analysis service within 15 seconds. The service may be starting up or temporarily unavailable. Please try again in a moment.');
          this.close();
        }
      }, 15000);

    } catch (error) {
      console.error('Failed to start streaming analysis:', error);
      let errorMessage = 'Failed to start legal analysis';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.callbacks.onError?.(errorMessage);
    }
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

// Fallback function for non-streaming analysis using POST
export const analyzeCaseNonStreaming = async (caseDescription: string) => {
  try {
    const response = await fetch(`${API_BASE}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        case_facts: caseDescription
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis failed, please try again');
    }

    // For POST, we'd need to handle the stream response
    // This is a fallback, so we'll read the full response
    const reader = response.body?.getReader();
    let fullResponse = '';
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            fullResponse += line.slice(6) + '\n';
          }
        }
      }
    }
    
    return { analysis: fullResponse };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Analysis failed, please try again');
  }
};