// Streaming API Client for Real-time Legal Analysis
const API_BASE = 'https://legal-advisor-api.onrender.com';

export interface StreamingEvent {
  type: 'start' | 'step_start' | 'thinking_update' | 'step' | 'complete' | 'error';
  data?: any;
  step_number?: number;
  timestamp?: string;
}

export interface StreamingAnalysisCallbacks {
  onStart?: () => void;
  onStepStart?: (stepNumber: number, stepName: string) => void;
  onThinkingUpdate?: (stepNumber: number, content: string) => void;
  onStepComplete?: (step: any) => void;
  onComplete?: (analysis: any) => void;
  onError?: (error: string) => void;
}

export class StreamingLegalAnalyzer {
  private eventSource: EventSource | null = null;
  private callbacks: StreamingAnalysisCallbacks = {};

  constructor(callbacks: StreamingAnalysisCallbacks) {
    this.callbacks = callbacks;
  }

  async startAnalysis(caseDescription: string): Promise<void> {
    try {
      // Close any existing connection
      this.close();

      // Create the streaming connection
      const url = `${API_BASE}/analyze-case-stream`;
      const encodedDescription = encodeURIComponent(caseDescription);
      
      this.eventSource = new EventSource(`${url}?case_description=${encodedDescription}`);

      // Set up event listeners
      this.eventSource.onopen = () => {
        console.log('Streaming connection opened');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const streamEvent: StreamingEvent = JSON.parse(event.data);
          this.handleStreamEvent(streamEvent);
        } catch (error) {
          console.error('Error parsing stream event:', error);
          this.callbacks.onError?.('Failed to parse stream data');
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        this.callbacks.onError?.('Connection error occurred');
        this.close();
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
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

  private handleStreamEvent(event: StreamingEvent): void {
    switch (event.type) {
      case 'start':
        this.callbacks.onStart?.();
        break;
        
      case 'step_start':
        if (event.step_number && event.data?.step_name) {
          this.callbacks.onStepStart?.(event.step_number, event.data.step_name);
        }
        break;
        
      case 'thinking_update':
        if (event.step_number && event.data?.content) {
          this.callbacks.onThinkingUpdate?.(event.step_number, event.data.content);
        }
        break;
        
      case 'step':
        if (event.data) {
          this.callbacks.onStepComplete?.(event.data);
        }
        break;
        
      case 'complete':
        if (event.data) {
          this.callbacks.onComplete?.(event.data);
        }
        this.close();
        break;
        
      case 'error':
        this.callbacks.onError?.(event.data?.message || 'Unknown error occurred');
        this.close();
        break;
        
      default:
        console.warn('Unknown stream event type:', event.type);
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