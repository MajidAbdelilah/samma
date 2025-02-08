import React, { createContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  date_joined?: string;
  total_games?: number;
  total_sales?: number;
  average_rating?: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  checkAuthStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/profile/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Auth status response:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('Auth check failed:', await response.text());
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      
      // First, get a fresh CSRF token
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/core/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!csrfResponse.ok) {
        const csrfError = await csrfResponse.json();
        throw new Error(csrfError.detail || 'Failed to get CSRF token');
      }

      // Get the CSRF token from the response
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;
      
      if (!csrfToken) {
        throw new Error('CSRF token not found in response');
      }

      console.log('Got CSRF token:', csrfToken);

      // Now make the login request with the CSRF token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Login failed:', error);
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Immediately check auth status after successful login
      await checkAuthStatus();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First, get a fresh CSRF token
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/core/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      // Get the CSRF token from the response
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;
      
      if (!csrfToken) {
        throw new Error('CSRF token not found in response');
      }

      // Now make the logout request with the CSRF token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Logout failed');
      }

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      // First, get a fresh CSRF token
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/core/csrf/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!csrfResponse.ok) {
        const csrfError = await csrfResponse.json();
        throw new Error(csrfError.detail || 'Failed to get CSRF token');
      }

      // Get the CSRF token from the response
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;
      
      if (!csrfToken) {
        throw new Error('CSRF token not found in response');
      }

      console.log('Got CSRF token:', csrfToken);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/accounts/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      await checkAuthStatus(); // Fetch the user data after successful registration
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 