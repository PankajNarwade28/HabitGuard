import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import OnboardingScreen from '@/components/OnboardingScreen';
import { UserProvider } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/AuthService';
import { permissionService } from '@/services/PermissionService';
import { useRouter } from 'expo-router';
import { AppState } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAppState();
    
    // Listen for app state changes to re-check auth
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Re-check auth state when app becomes active
        checkAppState();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const checkAppState = async () => {
    try {
      console.log('🚀 App starting - checking state...');
      
      // First check permissions (usage access is critical for app to work)
      const permissionStatus = await permissionService.getPermissionStatus();
      console.log('📋 Permission status:', permissionStatus);
      
      const notificationPermission = await permissionService.checkNotificationPermission();
      console.log('🔔 Notification permission:', notificationPermission);
      
      const usageAccessPermission = await permissionService.checkUsageAccessPermission();
      console.log('📊 Usage access permission:', usageAccessPermission);
      
      // If permissions are missing or onboarding not completed, show onboarding first
      if (permissionStatus.isFirstLaunch || 
          !permissionStatus.hasCompletedOnboarding ||
          !notificationPermission ||
          !usageAccessPermission) {
        console.log('⚠️ Permissions missing or onboarding incomplete - showing onboarding');
        console.log('  - First launch:', permissionStatus.isFirstLaunch);
        console.log('  - Onboarding complete:', permissionStatus.hasCompletedOnboarding);
        console.log('  - Notifications:', notificationPermission);
        console.log('  - Usage access:', usageAccessPermission);
        setShowOnboarding(true);
        setIsLoading(false);
        return;
      }

      console.log('✅ All permissions granted, checking authentication...');
      
      // After permissions are granted, check authentication
      const authenticated = await authService.isAuthenticated();
      console.log('🔐 Authentication status:', authenticated);
      setIsAuthenticated(authenticated);

      // If not authenticated, show login
      if (!authenticated) {
        console.log('⚠️ Not authenticated - will show login screen');
        setIsLoading(false);
        return;
      }

      console.log('✅ Authenticated - will show main app');
      // If both permissions granted and authenticated, proceed to main app
    } catch (error) {
      console.error('❌ Error checking app state:', error);
      // If error, show onboarding to be safe (permissions are critical)
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  // Priority 1: Show onboarding if permissions are missing
  if (showOnboarding) {
    return (
      <UserProvider>
        <ThemeProvider value={DarkTheme}>
          <OnboardingScreen />
          <StatusBar style="auto" />
        </ThemeProvider>
      </UserProvider>
    );
  }

  // Priority 2: If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <UserProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </UserProvider>
    );
  }

  // Priority 3: If both permissions granted and authenticated, show main app
  return (
    <UserProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </UserProvider>
  );
}
