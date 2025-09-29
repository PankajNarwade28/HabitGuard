import { usageStatsService } from '@/services/UsageStatsService';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProgressScreen() {
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setIsLoading(true);
      
      // Check permission first
      const permission = await usageStatsService.checkUsageAccessPermission();
      setHasPermission(permission);
      
      // Get weekly and daily usage data
      const weekly = await usageStatsService.getWeeklyUsageStats();
      const daily = await usageStatsService.getDailyUsageStats();
      
      setWeeklyData(weekly);
      setDailyData(daily);
      
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your digital wellness journey</Text>
      </View>

      {/* Streak & Stats */}
      <View style={styles.streakContainer}>
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={32} color="#ef4444" />
          <View style={styles.streakContent}>
            <Text style={styles.streakNumber}>{weeklyData?.streak || 0}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.streakCard}>
          <Ionicons name="trophy" size={32} color="#fbbf24" />
          <View style={styles.streakContent}>
            <Text style={styles.streakNumber}>{weeklyData?.daysWithData || 0}</Text>
            <Text style={styles.streakLabel}>Active Days</Text>
          </View>
        </View>
      </View>

      {/* Daily Goal Progress */}
      <View style={styles.goalCard}>
        <Text style={styles.cardTitle}>Daily Goal Progress</Text>
        {!hasPermission ? (
          <View style={styles.permissionWarning}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.permissionText}>
              Enable usage access to track your daily goals
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${Math.min((dailyData?.totalTime || 0) / (4 * 60 * 60 * 1000) * 100, 100)}%` 
              }]} />
            </View>
            <Text style={styles.goalText}>
              {dailyData?.totalTime ? usageStatsService.formatTime(dailyData.totalTime) : '0m'} / 4h goal
            </Text>
          </>
        )}
      </View>

      {/* Weekly Overview */}
      <View style={styles.weeklyCard}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.weekContainer}>
          {weeklyData?.dailyBreakdown?.length > 0 ? (
            weeklyData.dailyBreakdown.map((day: any, index: number) => {
              const maxTime = Math.max(...weeklyData.dailyBreakdown.map((d: any) => d.totalTime), 1);
              const heightPercentage = (day.totalTime / maxTime) * 60 + 20;
              return (
                <View key={index} style={styles.dayColumn}>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                  <View style={[styles.dayBar, { height: heightPercentage }]} />
                  <Text style={styles.dayTime}>
                    {day.totalTime > 0 ? usageStatsService.formatTime(day.totalTime) : '0m'}
                  </Text>
                </View>
              );
            })
          ) : (
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={styles.dayLabel}>{day}</Text>
                <View style={[styles.dayBar, { height: 20, backgroundColor: '#e2e8f0' }]} />
                <Text style={styles.dayTime}>--</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>Achievements</Text>
        <View style={styles.achievementItem}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <View style={styles.achievementDetails}>
            <Text style={styles.achievementName}>First Week</Text>
            <Text style={styles.achievementDesc}>Complete 7 days streak</Text>
          </View>
        </View>
        <View style={styles.achievementItem}>
          <Ionicons name="medal" size={24} color="#10b981" />
          <View style={styles.achievementDetails}>
            <Text style={styles.achievementName}>Goal Crusher</Text>
            <Text style={styles.achievementDesc}>Meet daily goal 5 times</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7ff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#a855f7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#f3e8ff',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  streakContent: {
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  streakLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  goalCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#581c87',
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: 12,
    width: '75%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  goalText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  weeklyCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  chartContainer: {
    marginTop: 12,
  },
  chart: {
    height: 120,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  chartLabel: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsCard: {
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
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  achievementDetails: {
    marginLeft: 16,
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#581c87',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
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
  streakContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  dayBar: {
    width: 16,
    backgroundColor: '#a855f7',
    borderRadius: 8,
    marginBottom: 8,
  },
  dayTime: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
});