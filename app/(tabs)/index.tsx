import AppIcon from '@/components/AppIcon';
import { UsageDebugPanel } from '@/components/UsageDebugPanel';
import { usageStatsService } from '@/services/UsageStatsService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [usageData, setUsageData] = useState<any>(null);
  const [usageStatus, setUsageStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastPermissionCheck, setLastPermissionCheck] = useState<number>(0);
  const appState = useRef(AppState.currentState);

  // Refresh data when screen comes into focus (e.g., after granting permission)
  useFocusEffect(
    useCallback(() => {
      loadUsageData();
    }, [])
  );

  // Also load data on initial mount
  useEffect(() => {
    loadUsageData();
  }, []);

  // Listen for app state changes (when user returns from settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      console.log('📱 App state changed from', appState.current, 'to', nextAppState);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('🔄 App became active - checking for permission changes');
        // App came back to foreground, check if permission status changed
        const now = Date.now();
        if (now - lastPermissionCheck > 2000) { // Only check if it's been more than 2 seconds
          console.log('⏳ Delaying permission check to allow system to update...');
          setTimeout(() => {
            loadUsageData(true);
          }, 1000);
          setLastPermissionCheck(now);
        }
      }
      
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => subscription?.remove();
  }, [lastPermissionCheck]);

  const loadUsageData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      console.log('🔄 Loading usage data...', forceRefresh ? '(forced refresh)' : '');
      
      // Check permission first
      const permission = await usageStatsService.checkUsageAccessPermission();
      console.log('📋 Permission status:', permission);
      setHasPermission(permission);
      
      // Force real data mode if permissions are available
      if (permission) {
        console.log('🎯 Real data mode active - no mock data available');
        usageStatsService.forceRealDataMode();
        
        // Debug the API to find out why we're getting empty data
        console.log('🔧 Running API diagnostics...');
        await usageStatsService.debugUsageStatsAPI();
      }
      
      // If permission just granted, wait a moment for the system to update
      if (permission && forceRefresh) {
        console.log('⏳ Permission granted, waiting for system update...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Get daily usage data
      const dailyStats = await usageStatsService.getDailyUsageStats();
      console.log('📊 Daily stats loaded:', dailyStats);
      setUsageData(dailyStats);
      
      // Get ML-based usage status
      const status = await usageStatsService.getUsageStatus();
      console.log('🤖 Usage status:', status);
      setUsageStatus(status);
      
    } catch (error) {
      console.error('❌ Error loading usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh function for debug panel
  const refreshData = () => {
    console.log('🔄 Manual refresh triggered');
    loadUsageData(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your wellness data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Your digital wellness dashboard</Text>
      </View>

      {/* ML-Based Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={usageStatus?.icon || "leaf"} 
            size={32} 
            color={usageStatus?.color || "#10b981"} 
          />
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: usageStatus?.color || '#10b981' }]}>
              {usageStatus?.status || 'Loading...'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {usageStatus?.message || 'Analyzing your usage patterns...'}
            </Text>
          </View>
        </View>
        {!hasPermission && (
          <View style={styles.permissionWarning}>
            <Ionicons name="warning" size={16} color="#f59e0b" />
            <Text style={styles.permissionText}>
              Enable usage access for real-time data
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {usageData?.status === 'no_data' || usageData?.status === 'error' || usageData?.status === 'no_permission' 
              ? 'N/A' 
              : usageData?.totalTime ? usageStatsService.formatTime(usageData.totalTime) : '--'
            }
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {usageData?.status === 'no_data' || usageData?.status === 'error' || usageData?.status === 'no_permission' 
              ? 'N/A' 
              : usageData?.appCount || 0
            }
          </Text>
          <Text style={styles.statLabel}>Apps Used</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {usageData?.status === 'no_data' || usageData?.status === 'error' || usageData?.status === 'no_permission' 
              ? 'N/A' 
              : usageData?.unlocks || 0
            }
          </Text>
          <Text style={styles.statLabel}>Unlocks</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.cardTitle}>Top Apps Today</Text>
        {usageData?.status === 'no_data' || usageData?.status === 'error' || usageData?.status === 'no_permission' ? (
          <View style={styles.activityItem}>
            <Ionicons name="alert-circle" size={20} color="#f59e0b" />
            <View style={styles.appInfo}>
              <Text style={styles.appName}>No Real Data Available</Text>
              <Text style={styles.activityText}>
                {usageData?.message || 'Unable to retrieve usage statistics'}
              </Text>
            </View>
          </View>
        ) : usageData?.topApps?.length > 0 ? (
          usageData.topApps.slice(0, 3).map((app: any, index: number) => (
            <View key={index} style={styles.activityItem}>
              <View style={{marginRight: 12, width: 24, alignItems: 'center'}}>
                <AppIcon iconData={app.icon} size={20} />
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name || app.appName || app.packageName}</Text>
                <Text style={styles.appTime}>{usageStatsService.formatTime(app.timeSpent || app.totalTimeInForeground || 0)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.activityItem}>
            <Ionicons name="information-circle" size={20} color="#64748b" />
            <Text style={styles.activityText}>
              {hasPermission ? 'Loading usage data...' : 'Enable usage access to see app data'}
            </Text>
          </View>
        )}
      </View>

      {/* Debug Panel - Remove this in production */}
      <UsageDebugPanel onRefresh={refreshData} hasPermission={hasPermission} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContent: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
  },
  appInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  appTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});
