import { useState, useEffect } from 'react';
import { User } from '@shared/schema';
import { authUtils } from '@/lib/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // mark as loading on init
  const queryClient = useQueryClient();


  useEffect(() => {
    const checkAuth = () => {
      const token = authUtils.getToken();
      const storedUser = authUtils.getUser();

      const valid = Boolean(token && storedUser);
      setIsAuthenticated(valid);
      setUser(valid ? storedUser : null);
      setIsLoading(false);
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      authUtils.setToken(data.token);
      authUtils.setUser(data.user);

      setUser(data.user);
      setIsAuthenticated(true);
      setIsLoading(false);

      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });

      window.dispatchEvent(new Event("storage"));
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
