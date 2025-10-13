import { authService } from '@/services/AuthService';
import { NotificationService } from '@/services/NotificationService';
import { permissionService } from '@/services/PermissionService';
import { usageStatsService } from '@/services/UsageStatsService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingStep {
  title: string;
  description: string;
  icon: any;
  action?: () => Promise<void>;
  buttonText: string;
}

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    notifications: false,
    usageAccess: false
  });

  const steps: OnboardingStep[] = [
    {
      title: 'Welcome to HabitGuard',
      description: 'Your personal digital wellness companion. Track, analyze, and improve your mobile usage habits with AI-powered insights.',
      icon: 'shield-checkmark',
      buttonText: 'Get Started',
    },
    {
      title: 'Enable Notifications',
      description: 'Get gentle reminders and daily insights to help you maintain healthy digital habits.',
      icon: 'notifications',
      action: handleNotificationPermission,
      buttonText: permissions.notifications ? 'Continue' : 'Enable Notifications',
    },
    {
      title: 'Grant Usage Access',
      description: 'Allow HabitGuard to access your app usage data to provide personalized analytics and recommendations. This permission is required for the app to function.',
      icon: 'analytics',
      action: handleUsageAccessPermission,
      buttonText: permissions.usageAccess ? 'Complete Setup' : 'Grant Usage Access',
    }
  ];

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  async function checkInitialPermissions() {
    // Check real-time permission status
    const notificationPermission = await permissionService.checkNotificationPermission();
    const usageAccessPermission = await permissionService.checkUsageAccessPermission();
    
    setPermissions({
      notifications: notificationPermission,
      usageAccess: usageAccessPermission
    });

    // Determine which step to start from based on missing permissions
    if (!notificationPermission) {
      setCurrentStep(1); // Start from notification permission step
    } else if (!usageAccessPermission) {
      setCurrentStep(2); // Start from usage access permission step
    } else {
      // All permissions granted, check if we should redirect
      const status = await permissionService.getPermissionStatus();
      if (status.hasCompletedOnboarding) {
        // Check authentication status
        const isAuthenticated = await authService.isAuthenticated();
        
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login' as any);
        }
      }
    }
  }

  async function handleNotificationPermission() {
    setIsLoading(true);
    try {
      const granted = await permissionService.requestNotificationPermission();
      setPermissions(prev => ({ ...prev, notifications: granted }));
      
      if (granted) {
        nextStep();
      } else {
        // Don't allow skipping - notification permission is required
        Alert.alert(
          'Permission Required',
          'Notifications are required to keep you informed about your screen time goals. Please grant permission to continue.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsLoading(false) },
            { text: 'Try Again', onPress: handleNotificationPermission }
          ]
        );
        return; // Don't proceed without permission
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUsageAccessPermission() {
    setIsLoading(true);
    try {
      // Check current status first
      const hasPermission = await usageStatsService.checkUsageAccessPermission();
      
      if (hasPermission) {
        setPermissions(prev => ({ ...prev, usageAccess: true }));
        await completeOnboarding();
      } else {
        // Open settings and show instructions
        await permissionService.openUsageAccessSettings();
        
        Alert.alert(
          'Enable Usage Access',
          'Please find \"HabitGuard\" in the list and enable usage access. Then return to the app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Done', onPress: checkUsagePermissionAfterSettings }
          ]
        );
      }
    } catch (error) {
      console.error('Error handling usage access:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkUsagePermissionAfterSettings() {
    setIsLoading(true);
    
    // Give user time to return from settings
    setTimeout(async () => {
      const hasPermission = await usageStatsService.checkUsageAccessPermission();
      setPermissions(prev => ({ ...prev, usageAccess: hasPermission }));
      
      if (hasPermission) {
        await completeOnboarding();
      } else {
        Alert.alert(
          'Usage Access Required',
          'HabitGuard needs usage access to track your app usage. Please enable it to continue.',
          [
            { text: 'Try Again', onPress: handleUsageAccessPermission }
          ]
        );
      }
      setIsLoading(false);
    }, 1000);
  }

  async function completeOnboarding() {
    try {
      // Check if usage access is granted before completing
      const hasUsageAccess = await permissionService.checkUsageAccessPermission();
      
      if (!hasUsageAccess) {
        Alert.alert(
          'Permission Required',
          'Usage access permission is required to use HabitGuard. Please grant the permission to continue.',
          [
            { text: 'Grant Permission', onPress: handleUsageAccessPermission }
          ]
        );
        return;
      }
      
      await permissionService.completeOnboarding();
      await permissionService.markAppAsLaunched();
      
      // Send setup complete notification
      console.log('🔔 Sending setup complete notification...');
      await NotificationService.sendSetupCompleteNotification();
      console.log('✅ Setup complete notification sent!');
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
    }
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  async function handleContinue() {
    const step = steps[currentStep];
    
    if (step.action) {
      await step.action();
    } else if (currentStep === steps.length - 1) {
      // On the last step, ensure usage access is granted before proceeding
      if (currentStep === 2 && !permissions.usageAccess) {
        await handleUsageAccessPermission();
      } else {
        await completeOnboarding();
      }
    } else {
      nextStep();
    }
  }

  const currentStepData = steps[currentStep];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep ? styles.progressDotActive : styles.progressDotInactive
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.stepContainer}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={currentStepData.icon} 
            size={80} 
            color="#6366f1" 
          />
        </View>

        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>

        {/* Permission Status Indicators */}
        {currentStep > 0 && (
          <View style={styles.permissionStatus}>
            <View style={styles.permissionItem}>
              <Ionicons 
                name={permissions.notifications ? 'checkmark-circle' : 'ellipse-outline'} 
                size={24} 
                color={permissions.notifications ? '#10b981' : '#6b7280'} 
              />
              <Text style={[
                styles.permissionText,
                permissions.notifications && styles.permissionTextActive
              ]}>
                Notifications {permissions.notifications ? 'Enabled' : 'Pending'}
              </Text>
            </View>
            
            {currentStep > 1 && (
              <View style={styles.permissionItem}>
                <Ionicons 
                  name={permissions.usageAccess ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={24} 
                  color={permissions.usageAccess ? '#10b981' : '#6b7280'} 
                />
                <Text style={[
                  styles.permissionText,
                  permissions.usageAccess && styles.permissionTextActive
                ]}>
                  Usage Access {permissions.usageAccess ? 'Enabled' : 'Pending'}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {currentStepData.buttonText}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </>
          )}
        </Pressable>

        {currentStep > 0 && currentStep < 2 && (
          <Pressable
            style={styles.skipButton}
            onPress={completeOnboarding}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        )}
        
        {currentStep === 2 && !permissions.usageAccess && (
          <View style={styles.requiredNotice}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text style={styles.requiredText}>
              Usage access is required for HabitGuard to function properly
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: '#6366f1',
  },
  progressDotInactive: {
    backgroundColor: '#d1d5db',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionStatus: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 12,
  },
  permissionTextActive: {
    color: '#10b981',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 40,
  },
  continueButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  requiredNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  requiredText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
});