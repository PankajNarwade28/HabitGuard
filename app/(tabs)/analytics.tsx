import AppIcon from '@/components/AppIcon';
import { usageStatsService } from '@/services/UsageStatsService';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AnalyticsScreen() {
  const [dailyData, setDailyData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [pressedBarIndex, setPressedBarIndex] = useState<number | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const getUsageStatus = (timeSpent: number) => {
    const hours = timeSpent / (1000 * 60 * 60);
    if (hours < 1) return { status: 'Healthy', color: '#10b981' };
    if (hours < 2) return { status: 'Moderate', color: '#f59e0b' };
    return { status: 'High', color: '#ef4444' };
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Check permission first
      const permission = await usageStatsService.checkUsageAccessPermission();
      setHasPermission(permission);
      
      // Get daily and weekly usage data
      const daily = await usageStatsService.getDailyUsageStats();
      const weekly = await usageStatsService.getWeeklyUsageStats();
      
      setDailyData(daily);
      setWeeklyData(weekly);
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Detailed usage insights</Text>
      </View>

      {/* Today's Top 5 Apps - Vertical Bar Chart */}
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Today's Top 5 Apps</Text>
        {dailyData?.topApps && dailyData.topApps.length > 0 ? (
          <View style={styles.verticalChartContainer}>
            {dailyData.topApps.slice(0, 5).map((app: any, index: number) => {
              // Calculate max time for scaling bars
              const maxTime = Math.max(...dailyData.topApps.slice(0, 5).map((a: any) => a.timeSpent));
              const heightPercentage = (app.timeSpent / maxTime) * 100;
              
              // Get usage status and color based on time spent
              const usageInfo = getUsageStatus(app.timeSpent);
              const isPressed = pressedBarIndex === index;
              
              return (
                <Pressable 
                  key={index} 
                  style={styles.verticalBarColumn}
                  onPress={() => setPressedBarIndex(isPressed ? null : index)}
                >
                  {isPressed && (
                    <View style={styles.tooltipContainer}>
                      <Text style={[styles.tooltipText, { color: usageInfo.color }]}>
                        {usageInfo.status}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.verticalBarValue}>{usageStatsService.formatTime(app.timeSpent)}</Text>
                  <View style={styles.verticalBarOuter}>
                    <View style={[styles.verticalBarInner, { 
                      height: `${heightPercentage}%`, 
                      backgroundColor: usageInfo.color 
                    }]} />
                  </View>
                  <View style={styles.verticalBarLabel}>
                    <AppIcon iconData={app.icon} size={20} />
                    <Text style={styles.verticalBarText} numberOfLines={1}>{app.appName || app.name}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={32} color="#6366f1" />
            <Text style={styles.chartLabel}>No data for today yet</Text>
          </View>
        )}
      </View>

      {/* App Usage Breakdown - ALL USER APPS */}
      <View style={styles.breakdownCard}>
        <Text style={styles.cardTitle}>All Apps Today ({dailyData?.topApps?.length || 0} apps)</Text>
        {!hasPermission ? (
          <View style={styles.permissionWarning}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.permissionText}>
              Enable usage access to see detailed app breakdown
            </Text>
          </View>
        ) : dailyData?.topApps?.length > 0 ? (
          dailyData.topApps.map((app: any, index: number) => {
            const getBadgeStyle = (timeSpent: number) => {
              if (timeSpent > 7200000) return { style: styles.badgeHigh, text: 'High' }; // > 2 hours
              if (timeSpent > 3600000) return { style: styles.badgeMedium, text: 'Medium' }; // > 1 hour
              return { style: styles.badgeLow, text: 'Healthy' };
            };
            const badge = getBadgeStyle(app.timeSpent);
            
            return (
              <View key={index} style={styles.appItem}>
                <View style={styles.appInfo}>
                  <View style={{marginRight: 12, width: 28, alignItems: 'center'}}>
                    <AppIcon iconData={app.icon} size={24} />
                  </View>
                  <View style={styles.appDetails}>
                    <Text style={styles.appName}>{app.name}</Text>
                    <Text style={styles.appTime}>{usageStatsService.formatTime(app.timeSpent)} today</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, badge.style]}>
                  <Text style={styles.badgeText}>{badge.text}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="analytics" size={48} color="#cbd5e1" />
            <Text style={styles.noDataText}>No app usage data available</Text>
          </View>
        )}
      </View>

      {/* Insights */}
      <View style={styles.insightsCard}>
        <Text style={styles.cardTitle}>Weekly Insights</Text>
        <View style={styles.insightItem}>
          <Ionicons name="analytics" size={20} color="#6366f1" />
          <Text style={styles.insightText}>
            Total weekly time: {weeklyData?.totalTime ? usageStatsService.formatTime(weeklyData.totalTime) : 'Loading...'}
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="calendar" size={20} color="#10b981" />
          <Text style={styles.insightText}>
            Days with data: {weeklyData?.daysWithData || 0} out of 7
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="phone-portrait" size={20} color="#f59e0b" />
          <Text style={styles.insightText}>
            Most used app: {weeklyData?.topApp || 'N/A'}
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="time" size={20} color="#0ea5e9" />
          <Text style={styles.insightText}>
            Daily average: {weeklyData?.averageTime ? usageStatsService.formatTime(weeklyData.averageTime) : 'N/A'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#0ea5e9',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2fe',
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  chartLabel: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  breakdownCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appDetails: {
    marginLeft: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  appTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHigh: {
    backgroundColor: '#fef2f2',
  },
  badgeMedium: {
    backgroundColor: '#fffbeb',
  },
  badgeLow: {
    backgroundColor: '#f0fdf4',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  insightsCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  // Vertical Bar Chart styles for today's top 5 apps
  verticalChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    marginHorizontal: 4,
  },
  verticalBarColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  verticalBarValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textAlign: 'center',
  },
  verticalBarOuter: {
    width: 40,
    height: 150,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  verticalBarInner: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 8,
  },
  verticalBarLabel: {
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  verticalBarText: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});