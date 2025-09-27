import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface PermissionStatusCardProps {
  hasPermission: boolean;
  onRequestPermission: () => void;
  onCheckPermission?: () => void;
  loading?: boolean;
}

export function PermissionStatusCard({ 
  hasPermission, 
  onRequestPermission, 
  onCheckPermission,
  loading = false 
}: PermissionStatusCardProps) {
  if (hasPermission) {
    return (
      <View style={[styles.card, styles.successCard]}>
        <View style={styles.statusHeader}>
          <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
          <ThemedText style={styles.successTitle}>Device Access Granted</ThemedText>
        </View>
        <ThemedText style={styles.statusDescription}>
          You're seeing real data from your device's digital wellbeing system.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.warningCard]}>
      <View style={styles.statusHeader}>
        <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FF9800" />
        <ThemedText style={styles.warningTitle}>Limited Access Mode</ThemedText>
      </View>
      <ThemedText style={styles.statusDescription}>
        Grant device access to see your actual screen time and app usage data.
      </ThemedText>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.permissionButton, loading && styles.disabledButton]} 
          onPress={onRequestPermission}
          disabled={loading}
          activeOpacity={0.8}
        >
          <IconSymbol name="gear" size={16} color="#FFFFFF" />
          <ThemedText style={styles.buttonText}>
            {loading ? 'Requesting...' : 'Grant Access'}
          </ThemedText>
        </TouchableOpacity>
        
        {Platform.OS === 'android' && onCheckPermission && (
          <TouchableOpacity 
            style={[styles.checkButton, loading && styles.disabledButton]} 
            onPress={onCheckPermission}
            disabled={loading}
            activeOpacity={0.8}
          >
            <IconSymbol name="checkmark.circle" size={16} color="#87CEEB" />
            <ThemedText style={styles.checkButtonText}>
              I granted it
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
  },
  successCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  warningCard: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF8E1',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F57C00',
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: '#87CEEB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  checkButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#87CEEB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    color: '#87CEEB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});