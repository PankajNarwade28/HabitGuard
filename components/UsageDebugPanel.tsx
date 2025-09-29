/**
 * Usage Access Debug and Test Utility
 * Add this to your Home screen or any component to test real usage data
 */

import { usageStatsService } from '@/services/UsageStatsService';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UsageDebugPanelProps {
  onRefresh?: () => void;
  hasPermission?: boolean;
}

export const UsageDebugPanel: React.FC<UsageDebugPanelProps> = ({ onRefresh, hasPermission }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugTest = async () => {
    setIsLoading(true);
    setDebugInfo(null);
    
    try {
      console.log('🧪 Starting Usage Access Debug Test...');
      
      // Test 1: Permission check
      const hasPermission = await usageStatsService.checkUsageAccessPermission();
      
      // Test 2: Get daily stats
      const dailyStats = await usageStatsService.getDailyUsageStats();
      
      // Test 3: Get weekly stats
      const weeklyStats = await usageStatsService.getWeeklyUsageStats();
      
      // Test 4: Get usage status
      const usageStatus = await usageStatsService.getUsageStatus();
      
      const debugResult = {
        timestamp: new Date().toISOString(),
        hasPermission,
        dailyStats: {
          totalTime: usageStatsService.formatTime(dailyStats.totalTime || 0),
          appCount: dailyStats.appCount || 0,
          topApps: (dailyStats.topApps || []).slice(0, 3).map((app: any) => ({
            name: app.name,
            time: usageStatsService.formatTime(app.timeSpent || 0)
          }))
        },
        weeklyStats: {
          totalTime: usageStatsService.formatTime(weeklyStats.totalTime || 0),
          averageTime: usageStatsService.formatTime(weeklyStats.averageTime || 0),
          daysWithData: weeklyStats.daysWithData || 0,
          topApp: weeklyStats.topApp || 'N/A'
        },
        usageStatus,
        isRealData: (dailyStats.topApps || []).some((app: any) => 
          !['Instagram', 'YouTube', 'WhatsApp'].includes(app.name)
        )
      };
      
      setDebugInfo(debugResult);
      console.log('🎉 Debug test completed:', debugResult);
      
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshService = async () => {
    setIsLoading(true);
    try {
      await usageStatsService.refreshService();
      console.log('✅ Service refreshed');
    } catch (error) {
      console.error('❌ Service refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Usage Access Debug Panel</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={runDebugTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '🔄 Testing...' : '🧪 Run Debug Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.refreshButton]} 
          onPress={refreshService}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Refresh Service</Text>
        </TouchableOpacity>
        
        {onRefresh && (
          <TouchableOpacity 
            style={[styles.button, styles.homeRefreshButton]} 
            onPress={onRefresh}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🏠 Refresh Home</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.permissionButton]} 
          onPress={async () => {
            setIsLoading(true);
            try {
              await usageStatsService.requestUsageAccessPermission();
            } catch (error) {
              console.error('Permission request failed:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>⚙️ Open Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.debugButton]} 
          onPress={async () => {
            setIsLoading(true);
            try {
              // @ts-ignore - debug method
              await usageStatsService.debugQueryTimeRanges();
            } catch (error) {
              console.error('Debug query failed:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔍 Debug Query</Text>
        </TouchableOpacity>
      </View>
      
      {hasPermission !== undefined && (
        <View style={[styles.statusContainer, hasPermission ? styles.permissionGranted : styles.permissionDenied]}>
          <Text style={styles.statusText}>
            📱 Permission Status: {hasPermission ? '✅ GRANTED' : '❌ DENIED'}
          </Text>
        </View>
      )}

      {debugInfo && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Debug Results:</Text>
          <Text style={styles.debugText}>
            {JSON.stringify(debugInfo, null, 2)}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#3b82f6',
  },
  refreshButton: {
    backgroundColor: '#10b981',
  },
  homeRefreshButton: {
    backgroundColor: '#8b5cf6',
  },
  permissionButton: {
    backgroundColor: '#f59e0b',
  },
  debugButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsContainer: {
    maxHeight: 300,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
  statusContainer: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  permissionGranted: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
  },
  permissionDenied: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});