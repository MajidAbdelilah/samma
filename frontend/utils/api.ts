import { useToast } from '@chakra-ui/react';

interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

// Get CSRF token
const getCSRFToken = async (): Promise<string> => {
  try {
    // First try to get from cookies
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];

    if (csrfToken) {
      return csrfToken;
    }

    // If not in cookies, fetch from API
    const response = await fetch(`${API_BASE}/core/csrf/`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get CSRF token');
    }

    // Get the token from the response
    const data = await response.json();
    if (!data.csrfToken) {
      throw new Error('CSRF token not found in response');
    }

    return data.csrfToken;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
};

// Generic API request function with CSRF token handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  showErrorToast?: (message: string) => void
): Promise<ApiResponse<T>> {
  try {
    const csrfToken = await getCSRFToken();
    
    const isFormData = options.body instanceof FormData;
    
    const headers = {
      'Accept': 'application/json',
      'X-CSRFToken': csrfToken,
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    console.log('Making API request:', {
      endpoint,
      method: options.method,
      headers,
      isFormData,
      url: `${API_BASE}${endpoint}`,
      csrfToken,
    });

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    console.log('Response headers:', {
      'content-type': response.headers.get('content-type'),
      'x-csrftoken': response.headers.get('x-csrftoken'),
      'allow': response.headers.get('allow'),
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
      console.log('Non-JSON response:', data);
    }

    if (!response.ok) {
      console.error('API error response:', {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const error: ApiError = {
        message: data.detail || data.message || 'An error occurred',
        code: response.status,
        details: data,
      };

      if (response.status !== 401 && response.status !== 403 && showErrorToast) {
        showErrorToast(error.message);
      }

      return { error };
    }

    return { data: data as T };
  } catch (error) {
    console.error('API request error:', error);
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return { error: apiError };
  }
}

// Common API request methods
export const createApi = (showErrorToast?: (message: string) => void) => ({
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }, showErrorToast),
    
  post: <T>(endpoint: string, data?: any, options?: RequestInit) => {
    const isFormData = data instanceof FormData;
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'POST',
        body: isFormData ? data : JSON.stringify(data),
      },
      showErrorToast
    );
  },
    
  put: <T>(endpoint: string, data?: any, options?: RequestInit) => {
    const isFormData = data instanceof FormData;
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'PUT',
        body: isFormData ? data : JSON.stringify(data),
      },
      showErrorToast
    );
  },
    
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) => {
    const isFormData = data instanceof FormData;
    return apiRequest<T>(
      endpoint,
      {
        ...options,
        method: 'PATCH',
        body: isFormData ? data : JSON.stringify(data),
      },
      showErrorToast
    );
  },
    
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }, showErrorToast),
}); 