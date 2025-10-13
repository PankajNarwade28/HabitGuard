/**
 * Debug Test Component
 * Add this temporarily to test the app flow
 * 
 * Usage: Import and render in app/_layout.tsx if needed
 */

import { authService } from '@/services/AuthService';
import { permissionService } from '@/services/PermissionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DebugPanel() {
  const [status, setStatus] = useState<any>({});
  const [storageData, setStorageData] = useState<any>({});

  const checkStatus = async () => {
    try {
      console.log('🔍 Starting debug check...');
      
      // Check permissions
      const permStatus = await permissionService.getPermissionStatus();
      const notif = await permissionService.checkNotificationPermission();
      const usage = await permissionService.checkUsageAccessPermission();
      
      // Check auth
      const auth = await authService.isAuthenticated();
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      
      // Get all storage keys
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      const storage = Object.fromEntries(values);
      
      const newStatus = {
        permissions: {
          isFirstLaunch: permStatus.isFirstLaunch,
          hasCompletedOnboarding: permStatus.hasCompletedOnboarding,
          notifications: notif,
          usageAccess: usage
        },
        authentication: {
          isAuthenticated: auth,
          hasToken: !!token,
          userData: userData
        },
        storage: storage
      };
      
      setStatus(newStatus);
      setStorageData(storage);
      
      console.log('📊 Debug Status:', newStatus);
    } catch (error) {
      console.error('❌ Debug check error:', error);
    }
  };

  const clearOnboarding = async () => {
    await AsyncStorage.removeItem('habitguard_onboarding_complete');
    await AsyncStorage.removeItem('habitguard_first_launch');
    console.log('✅ Cleared onboarding data');
    alert('Cleared! Reload app to see onboarding.');
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    console.log('✅ Cleared auth data');
    alert('Cleared! Reload app to see login.');
  };

  const clearAll = async () => {
    await AsyncStorage.clear();
    console.log('✅ Cleared all data');
    alert('Cleared! Reload app to start fresh.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Debug Panel</Text>
      
      <View style={styles.section}>
        <Button title="Check Current Status" onPress={checkStatus} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions:</Text>
        <View style={styles.buttonGroup}>
          <Button title="Clear Onboarding" onPress={clearOnboarding} color="#ff9800" />
          <Button title="Clear Auth" onPress={clearAuth} color="#f44336" />
          <Button title="Clear All Data" onPress={clearAll} color="#9c27b0" />
        </View>
      </View>

      {Object.keys(status).length > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permissions:</Text>
            <Text style={styles.text}>First Launch: {status.permissions?.isFirstLaunch ? '✅ YES' : '❌ NO'}</Text>
            <Text style={styles.text}>Onboarding Complete: {status.permissions?.hasCompletedOnboarding ? '✅ YES' : '❌ NO'}</Text>
            <Text style={styles.text}>Notifications: {status.permissions?.notifications ? '✅ Granted' : '❌ Not granted'}</Text>
            <Text style={styles.text}>Usage Access: {status.permissions?.usageAccess ? '✅ Granted' : '❌ Not granted'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication:</Text>
            <Text style={styles.text}>Is Authenticated: {status.authentication?.isAuthenticated ? '✅ YES' : '❌ NO'}</Text>
            <Text style={styles.text}>Has Token: {status.authentication?.hasToken ? '✅ YES' : '❌ NO'}</Text>
            {status.authentication?.userData && (
              <Text style={styles.text}>User: {status.authentication.userData.name || 'Unknown'}</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expected Screen:</Text>
            {(status.permissions?.isFirstLaunch || !status.permissions?.hasCompletedOnboarding || 
              !status.permissions?.notifications || !status.permissions?.usageAccess) ? (
              <Text style={styles.highlight}>📱 ONBOARDING SCREEN</Text>
            ) : !status.authentication?.isAuthenticated ? (
              <Text style={styles.highlight}>🔐 LOGIN SCREEN</Text>
            ) : (
              <Text style={styles.highlight}>🏠 MAIN APP</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Storage Keys:</Text>
            {Object.keys(storageData).map((key) => (
              <Text key={key} style={styles.storageText}>
                {key}: {String(storageData[key]).substring(0, 50)}...
              </Text>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  storageText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  highlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    textAlign: 'center',
    padding: 10,
  },
  buttonGroup: {
    gap: 10,
  },
});
