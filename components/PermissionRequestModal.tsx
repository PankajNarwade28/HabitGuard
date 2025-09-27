import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width, height } = Dimensions.get('window');

interface PermissionRequestModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onSkip: () => void;
  loading?: boolean;
}

export function PermissionRequestModal({ 
  visible, 
  onRequestPermission, 
  onSkip, 
  loading = false 
}: PermissionRequestModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.iconContainer}>
          <IconSymbol name="chart.bar.fill" size={64} color="#87CEEB" />
        </View>
        
        <ThemedText style={styles.title}>
          Welcome to HabitGuard
        </ThemedText>
        
        <ThemedText style={styles.subtitle}>
          Your Digital Wellness Companion
        </ThemedText>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <IconSymbol name="clock.fill" size={24} color="#87CEEB" />
            <ThemedText style={styles.featureText}>
              Track your daily screen time
            </ThemedText>
          </View>
          
          <View style={styles.feature}>
            <IconSymbol name="chart.pie.fill" size={24} color="#87CEEB" />
            <ThemedText style={styles.featureText}>
              See your most used apps
            </ThemedText>
          </View>
          
          <View style={styles.feature}>
            <IconSymbol name="moon.fill" size={24} color="#87CEEB" />
            <ThemedText style={styles.featureText}>
              Get sleep recommendations
            </ThemedText>
          </View>
          
          <View style={styles.feature}>
            <IconSymbol name="bell.fill" size={24} color="#87CEEB" />
            <ThemedText style={styles.featureText}>
              Receive healthy usage alerts
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.permissionText}>
          To provide personalized insights, HabitGuard needs access to your device's usage data. This information stays private and secure on your device.
        </ThemedText>
        
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          onPress={onRequestPermission}
          disabled={loading}
          activeOpacity={0.8}
        >
          <IconSymbol name="lock.shield.fill" size={20} color="#FFFFFF" />
          <ThemedText style={styles.primaryButtonText}>
            {loading ? 'Requesting Access...' : 'Grant Permission'}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={onSkip}
          disabled={loading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.secondaryButtonText}>
            Continue with Limited Features
          </ThemedText>
        </TouchableOpacity>
        
        <ThemedText style={styles.privacyNote}>
          🔒 Your data is processed locally and never shared with third parties
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    maxWidth: width > 600 ? 500 : width - 40,
    width: '100%',
    maxHeight: height * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    backgroundColor: '#E6F3FF',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A365D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 16,
    flex: 1,
  },
  permissionText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#87CEEB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});