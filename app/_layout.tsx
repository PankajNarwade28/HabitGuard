import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import OnboardingScreen from '@/components/OnboardingScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { permissionService } from '@/services/PermissionService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      const permissionStatus = await permissionService.getPermissionStatus();
      
      // Always check for pending permissions on app start
      const notificationPermission = await permissionService.checkNotificationPermission();
      const usageAccessPermission = await permissionService.checkUsageAccessPermission();
      
      // Show onboarding if:
      // 1. First launch or onboarding not completed
      // 2. Any critical permissions are missing
      if (permissionStatus.isFirstLaunch || 
          !permissionStatus.hasCompletedOnboarding ||
          !notificationPermission ||
          !usageAccessPermission) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking app state:', error);
      // If error, show onboarding to be safe
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (showOnboarding) {
    return (
      <ThemeProvider value={DarkTheme}>
        <OnboardingScreen />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
