import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

export interface PermissionStatus {
  usageAccess: boolean;
  notifications: boolean;
  isFirstLaunch: boolean;
  hasCompletedOnboarding: boolean;
}

export interface UserSettings {
  name: string;
  email: string;
  dailyGoalHours: number;
  notificationsEnabled: boolean;
  weeklyReportsEnabled: boolean;
  reminderTime: string; // HH:MM format
}

class PermissionService {
  private static readonly STORAGE_KEYS = {
    PERMISSIONS: 'habitguard_permissions',
    USER_SETTINGS: 'habitguard_user_settings',
    FIRST_LAUNCH: 'habitguard_first_launch',
    ONBOARDING: 'habitguard_onboarding_complete'
  };

  /**
   * Check if this is the first app launch
   */
  async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunch = await AsyncStorage.getItem(PermissionService.STORAGE_KEYS.FIRST_LAUNCH);
      return firstLaunch === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true;
    }
  }

  /**
   * Mark app as launched (no longer first time)
   */
  async markAppAsLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(PermissionService.STORAGE_KEYS.FIRST_LAUNCH, 'false');
    } catch (error) {
      console.error('Error marking app as launched:', error);
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const onboarding = await AsyncStorage.getItem(PermissionService.STORAGE_KEYS.ONBOARDING);
      return onboarding === 'true';
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(PermissionService.STORAGE_KEYS.ONBOARDING, 'true');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }

  /**
   * Get current permission status
   */
  async getPermissionStatus(): Promise<PermissionStatus> {
    try {
      const stored = await AsyncStorage.getItem(PermissionService.STORAGE_KEYS.PERMISSIONS);
      const isFirst = await this.isFirstLaunch();
      const hasOnboarding = await this.hasCompletedOnboarding();
      
      const defaultStatus: PermissionStatus = {
        usageAccess: false,
        notifications: false,
        isFirstLaunch: isFirst,
        hasCompletedOnboarding: hasOnboarding
      };

      if (!stored) {
        return defaultStatus;
      }

      const parsed = JSON.parse(stored);
      return {
        ...defaultStatus,
        ...parsed,
        isFirstLaunch: isFirst,
        hasCompletedOnboarding: hasOnboarding
      };
    } catch (error) {
      console.error('Error getting permission status:', error);
      return {
        usageAccess: false,
        notifications: false,
        isFirstLaunch: true,
        hasCompletedOnboarding: false
      };
    }
  }

  /**
   * Update permission status
   */
  async updatePermissionStatus(permissions: Partial<PermissionStatus>): Promise<void> {
    try {
      const current = await this.getPermissionStatus();
      const updated = { ...current, ...permissions };
      
      await AsyncStorage.setItem(
        PermissionService.STORAGE_KEYS.PERMISSIONS,
        JSON.stringify(updated)
      );
      
      console.log('✅ Permission status updated:', updated);
    } catch (error) {
      console.error('❌ Error updating permission status:', error);
    }
  }

  /**
   * Check current notification permission status
   */
  async checkNotificationPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const granted = status === 'granted';
      
      // Update stored status
      await this.updatePermissionStatus({ notifications: granted });
      
      return granted;
    } catch (error) {
      console.error('❌ Error checking notification permission:', error);
      return false;
    }
  }

  /**
   * Check current usage access permission status
   */
  async checkUsageAccessPermission(): Promise<boolean> {
    try {
      // Import here to avoid circular dependency
      const { usageStatsService } = require('./UsageStatsService');
      const hasAccess = await usageStatsService.checkUsageAccessPermission();
      
      // Update stored status
      await this.updatePermissionStatus({ usageAccess: hasAccess });
      
      return hasAccess;
    } catch (error) {
      console.error('❌ Error checking usage access permission:', error);
      return false;
    }
  }

  /**
   * Check for pending permissions that need to be granted
   */
  async getPendingPermissions(): Promise<string[]> {
    const pending: string[] = [];
    
    try {
      // Check notification permission
      const hasNotifications = await this.checkNotificationPermission();
      if (!hasNotifications) {
        pending.push('notifications');
      }
      
      // Check usage access permission
      const hasUsageAccess = await this.checkUsageAccessPermission();
      if (!hasUsageAccess) {
        pending.push('usageAccess');
      }
      
      console.log('📋 Pending permissions:', pending);
      return pending;
    } catch (error) {
      console.error('❌ Error checking pending permissions:', error);
      return ['notifications', 'usageAccess']; // Assume both need to be checked
    }
  }

  /**
   * Check if all critical permissions are granted
   */
  async areAllPermissionsGranted(): Promise<boolean> {
    const pending = await this.getPendingPermissions();
    return pending.length === 0;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    try {
      console.log('🔔 Requesting notification permission...');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      const granted = finalStatus === 'granted';
      console.log('📱 Notification permission result:', granted);
      
      // Update stored status
      await this.updatePermissionStatus({ notifications: granted });
      
      return granted;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Open Usage Access Settings (Android) - Opens app-specific usage access page
   * Directly opens: Settings > Apps > Special app access > Usage access > HabitGuard
   */
  async openUsageAccessSettings(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        console.log('📱 Opening HabitGuard-specific Usage Access Settings...');
        
        const packageName = await this.getPackageName();
        console.log('📦 Package name:', packageName);
        
        // Try multiple methods in order of directness (app-specific first)
        const methods = [
          // Method 1: Direct app-specific intent (opens HabitGuard's toggle directly)
          async () => {
            console.log('🔄 Method 1: Direct app-specific usage access');
            await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS', [
              { key: 'package', value: packageName }
            ]);
          },
          // Method 2: App-specific with APP_PACKAGE extra
          async () => {
            console.log('🔄 Method 2: App-specific with package extra');
            await Linking.sendIntent('android.settings.ACTION_USAGE_ACCESS_SETTINGS', [
              { key: 'android.provider.extra.APP_PACKAGE', value: packageName }
            ]);
          },
          // Method 3: Package-specific URI
          async () => {
            console.log('🔄 Method 3: Package-specific URI');
            const uri = `package:${packageName}`;
            await Linking.openURL(uri);
            // Try to auto-navigate after opening app details
            setTimeout(async () => {
              try {
                await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
              } catch (e) {
                console.log('Auto-navigation not supported');
              }
            }, 300);
          },
          // Method 4: General usage access list (fallback)
          async () => {
            console.log('🔄 Method 4: General usage access list');
            await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
          },
          // Method 5: Application details URI
          async () => {
            console.log('🔄 Method 5: Application details URI');
            await Linking.openURL(`android.settings.APPLICATION_DETAILS_SETTINGS://package:${packageName}`);
          },
          // Method 6: Open app settings (Linking.openSettings)
          async () => {
            console.log('🔄 Method 4: App settings');
            await Linking.openSettings();
          },
          // Method 5: Intent URL scheme
          async () => {
            console.log('🔄 Method 5: Intent URL for usage access');
            await Linking.openURL('intent:#Intent;action=android.settings.USAGE_ACCESS_SETTINGS;end');
          }
        ];
        
        let intentWorked = false;
        
        for (const method of methods) {
          try {
            await method();
            console.log('✅ Successfully opened settings');
            intentWorked = true;
            break;
          } catch (error) {
            console.log('❌ Method failed, trying next...');
          }
        }
        
        if (!intentWorked) {
          console.log('🔄 All methods failed, trying final fallback...');
          
          try {
            // Final fallback to general settings
            await Linking.openSettings();
            
            Alert.alert(
              'Enable Usage Access',
              'In the settings screen that opened:\n\n1. Look for "Usage Access" or "Apps with usage access"\n2. Find "HabitGuard" in the list\n3. Toggle it ON\n4. Return to this app',
              [{ text: 'Got it' }]
            );
          } catch (settingsError) {
            console.log('❌ Settings fallback failed:', settingsError);
            
            Alert.alert(
              'Manual Setup Required',
              'Please open Android Settings manually and:\n\n1. Go to Settings > Apps\n2. Find "Special Access" or "Advanced"\n3. Tap "Usage Access"\n4. Enable "HabitGuard"',
              [{ text: 'OK' }]
            );
          }
        }
        
      } else {
        Alert.alert(
          'Not Available',
          'Usage access settings are only available on Android devices.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error opening usage access settings:', error);
      Alert.alert(
        'Error',
        'Could not open usage access settings. Please open Settings manually and look for "Apps with usage access" or "Special access".',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Get app package name
   */
  private async getPackageName(): Promise<string> {
    try {
      // Try to get from react-native-device-info if available
      const DeviceInfo = require('react-native-device-info');
      if (DeviceInfo && DeviceInfo.default && DeviceInfo.default.getBundleId) {
        return await DeviceInfo.default.getBundleId();
      }
    } catch (error) {
      console.log('DeviceInfo not available, using default package name');
    }
    
    // Fallback to hardcoded package name from app.json
    return 'com.habitguard.wellbeing';
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem(PermissionService.STORAGE_KEYS.USER_SETTINGS);
      
      const defaultSettings: UserSettings = {
        name: 'User',
        email: '',
        dailyGoalHours: 4,
        notificationsEnabled: true,
        weeklyReportsEnabled: false,
        reminderTime: '21:00'
      };

      if (!stored) {
        // Save default settings
        await this.updateUserSettings(defaultSettings);
        return defaultSettings;
      }

      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        name: 'User',
        email: '',
        dailyGoalHours: 4,
        notificationsEnabled: true,
        weeklyReportsEnabled: false,
        reminderTime: '21:00'
      };
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      const current = await this.getUserSettings();
      const updated = { ...current, ...settings };
      
      await AsyncStorage.setItem(
        PermissionService.STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(updated)
      );
      
      console.log('✅ User settings updated:', updated);
    } catch (error) {
      console.error('❌ Error updating user settings:', error);
    }
  }

  /**
   * Generate and send weekly report (placeholder for now)
   */
  async generateWeeklyReport(): Promise<boolean> {
    try {
      const userSettings = await this.getUserSettings();
      
      if (!userSettings.email) {
        Alert.alert(
          'Email Required',
          'Please set your email address in settings to receive weekly reports.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // For now, we'll just show a success message
      // In production, this would integrate with an email service
      Alert.alert(
        'Report Generated',
        `Weekly report will be sent to ${userSettings.email}. This feature is coming soon!`,
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      console.error('❌ Error generating weekly report:', error);
      return false;
    }
  }

  /**
   * Clear all app data (for sign out)
   */
  async clearAppData(): Promise<void> {
    try {
      const keys = [
        PermissionService.STORAGE_KEYS.PERMISSIONS,
        PermissionService.STORAGE_KEYS.USER_SETTINGS,
        PermissionService.STORAGE_KEYS.ONBOARDING,
        'usage_csv_data' // Clear CSV data too
      ];
      
      await AsyncStorage.multiRemove(keys);
      console.log('✅ App data cleared');
    } catch (error) {
      console.error('❌ Error clearing app data:', error);
    }
  }

  /**
   * Open contact email
   */
  async openContactEmail(): Promise<void> {
    try {
      const emailUrl = 'mailto:contact@habitguard.gmail.com?subject=HabitGuard Support';
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          'Email Not Available',
          'Please send your questions to: contact@habitguard.gmail.com',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error opening contact email:', error);
    }
  }
}

export const permissionService = new PermissionService();