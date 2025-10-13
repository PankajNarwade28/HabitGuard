import { authService } from '@/services/AuthService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Higher-Order Component to protect routes
 * Ensures user is authenticated before showing the component
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      checkAuth();
    }, []);

    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        
        if (!authenticated) {
          // Not authenticated, redirect to login
          console.log('⚠️ User not authenticated, redirecting to login');
          router.replace('/login' as any);
          return;
        }

        // Validate token by making a profile request
        const isValid = await authService.validateToken();
        
        if (!isValid) {
          // Token expired or invalid
          console.log('⚠️ Token invalid, logging out');
          await authService.logout();
          router.replace('/login' as any);
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login' as any);
      } finally {
        setIsChecking(false);
      }
    };

    if (isChecking) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
});
