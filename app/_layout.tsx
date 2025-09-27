import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { PermissionModal } from '@/components/PermissionModal';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(true); // Set to true to skip modal for now

  // Commented out to prevent crashes in Expo Go
  // useEffect(() => {
  //   // Show permission modal after a brief delay on first launch
  //   const timer = setTimeout(() => {
  //     if (!hasPermissions) {
  //       setShowPermissionModal(true);
  //     }
  //   }, 2000);

  //   return () => clearTimeout(timer);
  // }, [hasPermissions]);

  const handlePermissionsGranted = () => {
    setHasPermissions(true);
    setShowPermissionModal(false);
  };

  const handleCloseModal = () => {
    setShowPermissionModal(false);
  };

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
      
      <PermissionModal
        visible={showPermissionModal}
        onPermissionsGranted={handlePermissionsGranted}
        onClose={handleCloseModal}
      />
    </ThemeProvider>
  );
}
