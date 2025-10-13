import { usageStatsService } from '@/services/UsageStatsService';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PermissionModalProps {
  visible: boolean;
  onPermissionsGranted: () => void;
  onClose: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  onPermissionsGranted,
  onClose,
}) => {
  const [accessibilityGranted, setAccessibilityGranted] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(false);

  // Check permissions when modal becomes visible
  useEffect(() => {
    if (visible) {
      checkUsageAccess();
    }
  }, [visible]);

  const checkUsageAccess = async () => {
    try {
      setCheckingPermissions(true);
      const hasAccess = await usageStatsService.checkUsageAccessPermission();
      setAccessibilityGranted(hasAccess);
    } catch (error) {
      console.log('Error checking usage access:', error);
    } finally {
      setCheckingPermissions(false);
    }
  };

  const handleAccessibilityPermission = async () => {
    Alert.alert(
      'Enable Usage Access',
      'To monitor your app usage and screen time, HabitGuard needs access to your device\'s usage statistics.\n\nSteps:\n1. Tap "Open Settings" below\n2. Look for "Usage Access" or "Apps with usage access"\n3. Find "HabitGuard" in the list\n4. Toggle it ON\n5. Return to the app',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: async () => {
            try {
              // Open usage access settings
              await usageStatsService.requestUsageAccessPermission();
              
              // Check permission after user returns (give them time)
              setTimeout(checkUsageAccess, 2000);
            } catch (error) {
              console.log('Error opening settings:', error);
              Alert.alert(
                'Settings Error',
                'Could not open settings automatically. Please go to Settings > Apps > Special access > Usage access and enable HabitGuard.'
              );
            }
          },
        },
      ]
    );
  };

  const handleNotificationPermission = async () => {
    try {
      const Notifications = require('expo-notifications');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setNotificationGranted(true);
        return;
      }
      
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        setNotificationGranted(true);
      } else {
        // Don't allow skipping - show alert
        Alert.alert(
          'Permission Required',
          'Notifications are required to keep you informed about your screen time goals and send helpful reminders. Please grant permission to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Try Again', onPress: handleNotificationPermission }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleContinue = async () => {
    if (accessibilityGranted && notificationGranted) {
      // Send acknowledgment notification
      await sendSetupCompleteNotification();
      onPermissionsGranted();
    }
  };

  const sendSetupCompleteNotification = async () => {
    try {
      console.log('🔔 Sending setup complete notification from modal...');
      const Notifications = require('expo-notifications');
      
      // Check permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted, skipping notification');
        return;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 HabitGuard Setup Complete!',
          body: 'All permissions granted! We\'re now tracking your screen time to help you build better digital habits.',
          data: { type: 'setup_complete' },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Setup complete notification sent from modal!');
    } catch (error) {
      console.error('❌ Failed to send setup notification:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={32} color="white" />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerText}>Welcome to HabitGuard</Text>
              <Text style={styles.headerSubtext}>Digital Wellness Companion</Text>
            </View>
          </View>
          
          <Text style={styles.title}>
            Let's set up your digital wellness monitoring
          </Text>
          <Text style={styles.description}>
            We need these permissions to track your app usage and send helpful reminders.
          </Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {/* Usage Access Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Ionicons name="phone-portrait" size={24} color="#6366f1" />
              <Text style={styles.permissionTitle}>Usage Access</Text>
            </View>
            <Text style={styles.permissionDescription}>
              Monitor your app usage and screen time to provide personalized insights and recommendations.
            </Text>
            <TouchableOpacity
              onPress={handleAccessibilityPermission}
              style={[
                styles.permissionButton,
                accessibilityGranted ? styles.grantedButton : styles.enableButton
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  accessibilityGranted ? styles.grantedText : styles.enableText
                ]}
              >
                {checkingPermissions ? 'Checking...' : accessibilityGranted ? '✓ Granted' : 'Grant Access'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notification Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionHeader}>
              <Ionicons name="notifications" size={24} color="#10b981" />
              <Text style={styles.permissionTitle}>Notifications</Text>
            </View>
            <Text style={styles.permissionDescription}>
              Receive gentle reminders and wellness tips to maintain healthy digital habits.
            </Text>
            <TouchableOpacity
              onPress={handleNotificationPermission}
              style={[
                styles.permissionButton,
                notificationGranted ? styles.grantedButton : styles.enableButton
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  notificationGranted ? styles.grantedText : styles.enableText
                ]}
              >
                {notificationGranted ? '✓ Granted' : 'Allow Notifications'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Refresh Button */}
        <View style={styles.refreshContainer}>
          <TouchableOpacity
            onPress={checkUsageAccess}
            style={styles.refreshButton}
            disabled={checkingPermissions}
          >
            <Ionicons name="refresh" size={16} color="#6366f1" />
            <Text style={styles.refreshText}>
              {checkingPermissions ? 'Checking permissions...' : 'Refresh permissions'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <View style={styles.continueContainer}>
          <Text style={styles.privacyNote}>
            🔒 Your data stays private and secure on your device
          </Text>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!accessibilityGranted || !notificationGranted}
            style={[
              styles.continueButton,
              (accessibilityGranted && notificationGranted) ? styles.continueEnabled : styles.continueDisabled
            ]}
          >
            <Text
              style={[
                styles.continueText,
                (accessibilityGranted && notificationGranted) ? styles.continueTextEnabled : styles.continueTextDisabled
              ]}
            >
              {(accessibilityGranted && notificationGranted) ? 'Start My Wellness Journey' : 'Grant Permissions to Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
    backgroundColor: '#6366f1',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtext: {
    color: '#e0e7ff',
    fontSize: 14,
    marginTop: 2,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#e0e7ff',
    fontSize: 16,
    lineHeight: 24,
  },
  permissionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  permissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  permissionDescription: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  grantedButton: {
    backgroundColor: '#10b981',
  },
  enableButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  grantedText: {
    color: '#ffffff',
  },
  enableText: {
    color: '#ffffff',
  },
  continueContainer: {
    paddingHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 32,
  },
  privacyNote: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  continueEnabled: {
    backgroundColor: '#10b981',
  },
  continueDisabled: {
    backgroundColor: '#d1d5db',
  },
  continueText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueTextEnabled: {
    color: '#ffffff',
  },
  continueTextDisabled: {
    color: '#9ca3af',
  },
  refreshContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
});