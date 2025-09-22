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
      const encodedPrompt = encodeURIComponent(caseDescription);
      const url = `${API_BASE}/stream?prompt=${encodedPrompt}`;
      
      this.eventSource = new EventSource(url);

      // Set up event listeners
      this.eventSource.onopen = () => {
        console.log('SSE connection opened');
        this.callbacks.onStart?.();
      };

      this.eventSource.onmessage = (event) => {
        // Handle regular data messages
        if (event.data && event.data.trim()) {
          this.accumulatedResponse += event.data;
          this.callbacks.onData?.(event.data);
        }
      };

      // Listen for the 'done' event that signals completion
      this.eventSource.addEventListener('done', () => {
        console.log('Stream completed');
        this.callbacks.onComplete?.(this.accumulatedResponse);
        this.close();
      });

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        this.callbacks.onError?.('Connection error occurred');
        this.close();
        
        // Attempt to reconnect after a delay if there's accumulated data
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED && !this.accumulatedResponse) {
            console.log('Attempting to reconnect...');
            this.startAnalysis(caseDescription);
          }
        }, 3000);
      };

    } catch (error) {
      console.error('Failed to start streaming analysis:', error);
      this.callbacks.onError?.('Failed to start analysis');
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

// Fallback function for non-streaming analysis
export const analyzeCaseNonStreaming = async (caseDescription: string) => {
  try {
    const response = await fetch(`${API_BASE}/analyze-case`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        case_description: caseDescription
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis failed, please try again');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Analysis failed, please try again');
  }
};