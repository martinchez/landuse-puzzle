const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  console.log('Handling response:', response.status, response.statusText);
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  console.log('Content type:', contentType, 'Is JSON:', isJson);
  
  if (!response.ok) {
    const errorData = isJson ? await response.json() : { message: response.statusText };
    console.error('Response not OK:', errorData);
    throw new ApiError(response.status, errorData.message || 'Network error');
  }
  
  const data = isJson ? await response.json() : null;
  console.log('Response data:', data);
  return { success: true, data };
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log('Making GET request to:', `${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Only add auth header if we have a token
          ...(this.getAuthToken() ? { 'Authorization': `Bearer ${this.getAuthToken()}` } : {})
        },
        mode: 'cors',
        credentials: 'same-origin'
      });
      console.log('Response status:', response.status, response.statusText);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('Fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      console.log('Making POST request to:', `${API_BASE_URL}${endpoint}`);
      console.log('Request data:', data);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Only add auth header for admin endpoints or if we have a token
      const authToken = this.getAuthToken();
      if (authToken && (endpoint.includes('/admin') || endpoint.includes('/auth'))) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      console.log('POST response status:', response.status, response.statusText);
      return handleResponse<T>(response);
    } catch (error) {
      console.error('POST fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });
      return handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  getAuthToken(): string {
    return localStorage.getItem('admin-token') || localStorage.getItem('auth-token') || '';
  }
};
