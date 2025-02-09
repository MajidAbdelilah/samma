import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { User, AuthContextType } from '@/types';
import { createApi } from '@/utils/api';

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  checkAuthStatus: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const showErrorToast = useCallback((message: string) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const api = createApi(showErrorToast);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const { data, error } = await api.get<User>('/accounts/profile/');

      if (error || !data) {
        console.log('Auth check failed:', error?.message);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      console.log('User data:', data);
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      
      const { data, error } = await api.post<User>('/accounts/login/', {
        email,
        password,
      });

      if (error || !data) {
        throw new Error(error?.message || 'Login failed');
      }

      console.log('Login successful:', data);
      await checkAuthStatus();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await api.post('/accounts/logout/');

      if (error) {
        throw new Error(error.message);
      }

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: error instanceof Error ? error.message : 'Failed to logout',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { data, error } = await api.post<User>('/accounts/register/', {
        email,
        password,
        username,
      });

      if (error || !data) {
        throw new Error(error?.message || 'Registration failed');
      }

      await checkAuthStatus();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to register',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
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