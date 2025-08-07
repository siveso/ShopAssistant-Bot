import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AdminUser } from "@shared/schema";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Initialize session token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    console.log('Initializing auth with token:', token);
    setSessionToken(token);
    setIsInitialized(true);
  }, []);

  // Verify session with server
  const { data: admin, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!sessionToken) return null;
      
      try {
        const response = await apiRequest("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        return response as AdminUser;
      } catch (error: any) {
        // If unauthorized, clear stored data
        if (error.message?.includes('401') || error.message?.includes('Yaroqsiz')) {
          console.log('Auth error, clearing localStorage:', error.message);
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('admin');
          setSessionToken(null);
        }
        throw error;
      }
    },
    enabled: isInitialized && !!sessionToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('admin');
    setSessionToken(null);
    
    // Call logout endpoint
    if (sessionToken) {
      apiRequest("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }).catch(console.error);
    }
  };

  return {
    admin,
    isLoading: !isInitialized || (isInitialized && sessionToken && isLoading),
    isAuthenticated: !!(sessionToken && admin && !error),
    logout,
    sessionToken,
  };
}