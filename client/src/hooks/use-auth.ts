import { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { authUtils } from '@/lib/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Initialize auth state on mount
  useEffect(() => {
    const token = authUtils.getToken();
    const storedUser = authUtils.getUser();
    
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      // Store in localStorage first
      authUtils.setToken(data.token);
      authUtils.setUser(data.user);
      
      // Then update React state immediately
      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Force re-render by clearing and setting state again
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 0);
    },
    onError: () => {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
    },
    onMutate: () => {
      setIsLoading(true);
    },
  });

  const logout = () => {
    authUtils.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
    
    // Force immediate re-render by updating state
    setTimeout(() => {
      setIsAuthenticated(false);
      setUser(null);
    }, 0);
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
