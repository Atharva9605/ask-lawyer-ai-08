// API Client for Legal Advisor AI Agent
const API_BASE = 'https://legal-backend-api-sse.onrender.com';

// Types matching the exact API response structure
export interface ThinkingStep {
  step_number: number;
  step_name: string;
  description: string;
  details: string;
  timestamp: string;
}

export interface LinkSummary {
  url: string;
  title: string;
  summary: string;
  status: 'success' | 'error';
}

export interface LegalAnalysis {
  case_name: string;
  analysis_date: string;
  thinking_steps: ThinkingStep[];
  final_answer: string;
  formatted_analysis?: string;
  references: string[];
  link_summaries: LinkSummary[];
  total_steps: number;
  processing_time: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Health check endpoint
export const healthCheck = async (): Promise<HealthResponse> => {
  try {
    const response = await fetch(`${API_BASE}/`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Unable to connect to AI service');
    }
    
    // Return a mock health response since the API root returns HTML
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('Unable to connect to AI service');
  }
};

// Main analysis endpoint
export const analyzeCase = async (caseDescription: string): Promise<LegalAnalysis> => {
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

// Formatted analysis endpoint for separate page display
export const analyzeCaseFormatted = async (caseDescription: string): Promise<LegalAnalysis> => {
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

// Test endpoint for debugging
export const testAnalysis = async (): Promise<LegalAnalysis> => {
  try {
    const response = await fetch(`${API_BASE}/analyze-case?case_description=Test case`);
    if (!response.ok) {
      throw new Error('Test analysis failed');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Test analysis failed');
  }
};