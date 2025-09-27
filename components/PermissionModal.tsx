import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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

  const handleAccessibilityPermission = async () => {
    // For now, we'll simulate the permission grant
    // In a real app, this would open device settings
    setAccessibilityGranted(true);
    Alert.alert(
      'Usage Access Required',
      'Please grant usage access in your device settings to monitor screen time.',
      [
        {
          text: 'Grant Permission',
          onPress: () => setAccessibilityGranted(true),
        },
      ]
    );
  };

  const handleNotificationPermission = async () => {
    // Simulate notification permission grant for demo
    setNotificationGranted(true);
    Alert.alert(
      'Notification Permission',
      'Notifications enabled for wellness reminders.'
    );
  };

  const handleContinue = () => {
    if (accessibilityGranted && notificationGranted) {
      onPermissionsGranted();
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
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </View>
            <Text style={styles.headerText}>HabitGuard Permissions</Text>
          </View>
          
          <Text style={styles.title}>
            Grant permissions for HabitGuard to work properly!
          </Text>
        </View>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {/* Accessibility Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionLabel}>
                  Accessibility Permission:
                </Text>
                <TouchableOpacity>
                  <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
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
                  {accessibilityGranted ? 'Granted' : 'Enable'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification Permission */}
          <View style={styles.permissionCard}>
            <View style={styles.permissionRow}>
              <View style={styles.permissionInfo}>
                <Text style={styles.permissionLabel}>
                  Notification Permission:
                </Text>
                <TouchableOpacity>
                  <Ionicons name="information-circle-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
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
                  {notificationGranted ? 'Granted' : 'Enable'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.continueContainer}>
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
              Continue to App
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
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  permissionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  permissionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
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
    paddingVertical: 8,
    borderRadius: 20,
  },
  grantedButton: {
    backgroundColor: '#10b981',
  },
  enableButton: {
    backgroundColor: '#fbbf24',
  },
  buttonText: {
    fontWeight: '600',
  },
  grantedText: {
    color: '#ffffff',
  },
  enableText: {
    color: '#0f172a',
  },
  continueContainer: {
    paddingHorizontal: 24,
    marginTop: 'auto',
    marginBottom: 32,
  },
  continueButton: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  continueEnabled: {
    backgroundColor: '#7c3aed',
  },
  continueDisabled: {
    backgroundColor: '#374151',
  },
  continueText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueTextEnabled: {
    color: '#ffffff',
  },
  continueTextDisabled: {
    color: '#6b7280',
  },
});