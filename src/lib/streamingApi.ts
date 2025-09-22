// Streaming API Client for Real-time Legal Analysis
const API_BASE = 'https://legal-backend-api-sse.onrender.com';

export interface StreamingAnalysisCallbacks {
  onStart?: () => void;
  onData?: (data: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
}

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

      // Create the streaming connection using the new SSE API
      // Use proper URL encoding for the case description
      const encodedPrompt = encodeURIComponent(caseDescription.trim());
      const url = `${API_BASE}/stream?prompt=${encodedPrompt}`;
      
      console.log('Starting SSE connection to:', url);
      this.eventSource = new EventSource(url);

      // Set up event listeners
      this.eventSource.onopen = (event) => {
        console.log('SSE connection opened successfully', event);
        this.callbacks.onStart?.();
      };

      this.eventSource.onmessage = (event) => {
        console.log('SSE message received:', event.data);
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

      // Handle connection errors
      this.eventSource.onerror = (event) => {
        console.error('EventSource error occurred:', event);
        console.error('EventSource readyState:', this.eventSource?.readyState);
        
        // Check if we have any accumulated response
        if (this.accumulatedResponse.trim()) {
          console.log('Error occurred but we have accumulated response, treating as complete');
          this.callbacks.onComplete?.(this.accumulatedResponse);
        } else {
          this.callbacks.onError?.('Connection error occurred. Please check your internet connection and try again.');
        }
        
        this.close();
      };

    } catch (error) {
      console.error('Failed to start streaming analysis:', error);
      this.callbacks.onError?.('Failed to start analysis: ' + (error instanceof Error ? error.message : 'Unknown error'));
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