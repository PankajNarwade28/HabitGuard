import { authService } from '@/services/AuthService';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Hook to ensure authentication on a screen
 * Automatically redirects to login if not authenticated
 */
export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('⚠️ Not authenticated, redirecting to login');
        router.replace('/login' as any);
        return;
      }

      // Optionally validate token
      const isValid = await authService.validateToken();
      
      if (!isValid) {
        console.log('⚠️ Token expired, logging out');
        await authService.logout();
        router.replace('/login' as any);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/login' as any);
    }
  };

  return {
    checkAuth,
  };
}
