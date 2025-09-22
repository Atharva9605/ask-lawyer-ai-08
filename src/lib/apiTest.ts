// Simple API test utility to verify the streaming endpoint
const API_BASE = 'https://legal-backend-api-sse.onrender.com';

export const testApiEndpoint = async (): Promise<boolean> => {
  try {
    console.log('Testing API endpoint:', API_BASE);
    
    // First test the root endpoint
    const rootResponse = await fetch(`${API_BASE}/`, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('Root endpoint test:', rootResponse);
    
    // Test the stream endpoint with a simple query
    const testPrompt = "Test case";
    const streamUrl = `${API_BASE}/stream?prompt=${encodeURIComponent(testPrompt)}`;
    console.log('Testing stream URL:', streamUrl);
    
    // Use a simple fetch test first
    const streamResponse = await fetch(streamUrl, { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('Stream endpoint test response:', streamResponse);
    
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
};

export const testEventSourceConnection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const testPrompt = "Simple test";
    const url = `${API_BASE}/stream?prompt=${encodeURIComponent(testPrompt)}`;
    
    console.log('Testing EventSource connection to:', url);
    
    const eventSource = new EventSource(url);
    let connected = false;
    
    const cleanup = () => {
      eventSource.close();
      clearTimeout(timeout);
    };
    
    eventSource.onopen = () => {
      console.log('EventSource connection successful!');
      connected = true;
      cleanup();
      resolve(true);
    };
    
    eventSource.onerror = (error) => {
      console.error('EventSource connection failed:', error);
      console.error('EventSource readyState:', eventSource.readyState);
      cleanup();
      resolve(false);
    };
    
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      console.error('EventSource connection timeout');
      cleanup();
      resolve(false);
    }, 10000);
  });
};