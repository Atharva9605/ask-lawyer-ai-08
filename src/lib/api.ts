// API client for Legal AI Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://legal-backend-api-n41w.onrender.com';

// Types for API requests and responses
export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  timestamp: string;
}

export interface ReviseRequest {
  message: string;
  session_id?: string;
}

export interface ReviseResponse {
  response: string;
  original: string;
  critique: string;
  timestamp: string;
}

export interface ExportChatRequest {
  session_id: string;
}

export interface ExportChatResponse {
  transcript: string;
  session_id: string;
  message_count: number;
}

export interface SessionsResponse {
  sessions: Record<string, {
    message_count: number;
    created_at: string;
  }>;
}

export interface SessionMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  iteration?: number;
}

export interface SessionResponse {
  session_id: string;
  messages: SessionMessage[];
  created_at: string;
}

// API client class
class LegalAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          errorData.error || 
          `API request failed with status ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.makeRequest('/');
  }

  // Send chat message
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Request revision
  async reviseResponse(request: ReviseRequest): Promise<ReviseResponse> {
    return this.makeRequest<ReviseResponse>('/revise', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get all sessions
  async getSessions(): Promise<SessionsResponse> {
    return this.makeRequest<SessionsResponse>('/sessions');
  }

  // Get specific session
  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.makeRequest<SessionResponse>(`/sessions/${sessionId}`);
  }

  // Export chat transcript
  async exportChat(request: ExportChatRequest): Promise<ExportChatResponse> {
    return this.makeRequest<ExportChatResponse>('/export-chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Create and export API client instance
export const apiClient = new LegalAPIClient();

// Helper functions for common operations
export const chatAPI = {
  sendMessage: (message: string, sessionId?: string) =>
    apiClient.sendMessage({ message, session_id: sessionId }),

  reviseResponse: (message: string, sessionId?: string) =>
    apiClient.reviseResponse({ message, session_id: sessionId }),

  exportChat: (sessionId: string) =>
    apiClient.exportChat({ session_id: sessionId }),

  getSessions: () => apiClient.getSessions(),

  getSession: (sessionId: string) => apiClient.getSession(sessionId),

  healthCheck: () => apiClient.healthCheck(),
};