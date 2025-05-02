import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthResponse {
  isAuthenticated: boolean;
  userId?: number;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Check if user is authenticated
  const { isLoading, data: authData } = useQuery<AuthResponse>({ 
    queryKey: ['/api/auth/me']
  });

  useEffect(() => {
    if (authData) {
      if (authData.isAuthenticated && authData.userId && authData.username) {
        setIsAuthenticated(true);
        setUser({
          id: authData.userId,
          username: authData.username,
          role: 'user' // Default role
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    }
  }, [authData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return await response.json() as User;
    },
    onSuccess: (userData) => {
      setIsAuthenticated(true);
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Login successful',
        description: `Welcome back, ${userData.username}!`,
      });
      navigate('/'); // Redirect to dashboard
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return await response.json() as User;
    },
    onSuccess: (userData) => {
      setIsAuthenticated(true);
      setUser(userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Registration successful',
        description: `Welcome to Dubai to the Stars, ${userData.username}!`,
      });
      navigate('/'); // Redirect to dashboard
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Could not create account',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout', {});
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
      navigate('/ai-advisor'); // Redirect to home/landing page
    },
    onError: () => {
      toast({
        title: 'Logout failed',
        description: 'Could not log out. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};