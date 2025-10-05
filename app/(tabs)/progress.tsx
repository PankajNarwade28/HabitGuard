import { permissionService } from '@/services/PermissionService';
import { streakService } from '@/services/StreakService';
import { usageStatsService } from '@/services/UsageStatsService';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ProgressScreen() {
  const [streakData, setStreakData] = useState<any>(null);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [dailyGoal, setDailyGoal] = useState(4);
  const [hasPermission, setHasPermission] = useState(false);
  const [todayUsage, setTodayUsage] = useState(0);
  const [pressedDayIndex, setPressedDayIndex] = useState<number | null>(null);
  const isLoadingRef = useRef(false); // Prevent duplicate calls - using ref to avoid re-renders
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout ref

  useFocusEffect(
    useCallback(() => {
      if (!isLoadingRef.current) {
        loadProgressData();
      }
      return () => {
        // Cleanup: clear any pending timeout
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
      };
    }, []) // Empty dependency array - only run on focus
  );

  const loadProgressData = async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('⏳ Already loading, skipping duplicate call');
      return;
    }

    try {
      setIsLoading(true);
      isLoadingRef.current = true;
      console.log('📊 Loading progress data...');
      
      // Clear any existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      
      // Set a timeout to prevent infinite loading
      loadTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ Load timeout reached - forcing completion');
        setIsLoading(false);
        isLoadingRef.current = false;
        loadTimeoutRef.current = null;
      }, 15000); // 15 second timeout - longer for data fetching
      
      // Check permission first (with timeout)
      const permission = await Promise.race([
        usageStatsService.checkUsageAccessPermission(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Permission check timeout')), 3000))
      ]).catch(() => false);
      setHasPermission(!!permission);
      
      // Get user settings for daily goal (with timeout protection)
      console.log('📋 Step 1: Getting user settings...');
      try {
        const userSettings = await Promise.race([
          permissionService.getUserSettings(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Settings timeout')), 2000))
        ]);
        setDailyGoal((userSettings as any).dailyGoalHours || 4);
        console.log('✅ User settings loaded: ' + ((userSettings as any).dailyGoalHours || 4) + 'h goal');
      } catch (error) {
        console.log('⚠️ Settings timeout, using default 4h goal');
        setDailyGoal(4);
      }
      
      // Get streak data (cached, fast)
      console.log('📋 Step 2: Getting streak data...');
      try {
        const streak = await Promise.race([
          streakService.getStreakData(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Streak timeout')), 2000))
        ]);
        setStreakData(streak);
        console.log('✅ Streak data loaded: ' + ((streak as any)?.currentStreak || 0) + ' days');
      } catch (error) {
        console.log('⚠️ Streak timeout, using default data');
        setStreakData({ currentStreak: 0, bestStreak: 0 });
      }
      
      // Get achievements (cached, fast) - before week data for speed
      console.log('📋 Step 3: Getting achievements...');
      try {
        const achievementsList = await Promise.race([
          streakService.getAchievements(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Achievements timeout')), 2000))
        ]);
        setAchievements(achievementsList as any[]);
        console.log('✅ Achievements loaded: ' + (achievementsList as any[]).length + ' total');
      } catch (error) {
        console.log('⚠️ Achievements timeout, using empty list');
        setAchievements([]);
      }
      
      // Get this week's progress (may fetch real data)
      console.log('📋 Step 4: Getting week progress...');
      try {
        const week = await Promise.race([
          streakService.getThisWeekProgress(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Week timeout')), 8000))
        ]);
        setWeekData(week as any[]);
        console.log('✅ Week data loaded: ' + (week as any[]).length + ' days');
      } catch (error) {
        console.log('⚠️ Week data timeout, using empty array');
        // Create fallback week data with today's usage
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const currentDayOfWeek = (today.getDay() + 6) % 7; // Convert to Mon=0 system
        const fallbackWeek = dayNames.map((day, index) => ({
          day,
          dayName: day,
          usageHours: index === currentDayOfWeek ? todayUsage : 0,
          screenTimeHours: index === currentDayOfWeek ? todayUsage : 0,
          goalMet: index === currentDayOfWeek ? todayUsage <= dailyGoal : false,
          date: new Date(today.getTime() - (currentDayOfWeek - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        setWeekData(fallbackWeek);
      }
      
      // Get weekly stats (uses cached week data)
      console.log('📋 Step 5: Calculating weekly stats...');
      try {
        const stats = await Promise.race([
          streakService.getWeeklyStats(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Stats timeout')), 2000))
        ]);
        setWeeklyStats(stats);
        console.log('✅ Weekly stats loaded: ' + ((stats as any).goalsMet || 0) + '/' + ((stats as any).totalDays || 0) + ' goals met');
      } catch (error) {
        console.log('⚠️ Stats timeout, using default values');
        setWeeklyStats({ goalsMet: 0, totalDays: 7, averageUsage: 0, bestDay: 'N/A' });
      }
      
      // Clear loading state BEFORE fetching today's usage (which can be slow)
      // This allows the UI to show immediately with cached data
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setIsLoading(false);
      isLoadingRef.current = false;
      
      console.log('📋 Step 6: Fetching today\'s usage data (non-blocking)...');
      // Get today's usage data in background - don't block UI
      if (permission) {
        usageStatsService.getDailyUsageStats()
          .then(dailyUsage => {
            if (dailyUsage && dailyUsage.totalTime) {
              const todayUsageHours = dailyUsage.totalTime / (1000 * 60 * 60);
              setTodayUsage(todayUsageHours);
              console.log('✅ Today\'s usage loaded: ' + todayUsageHours.toFixed(2) + 'h');
              // Update streak in background
              streakService.updateDailyStreak(todayUsageHours).catch(err => 
                console.log('Streak update error:', err)
              );
            } else {
              console.log('📊 No usage data available');
              setTodayUsage(0);
            }
          })
          .catch(error => {
            console.log('⚠️ Could not get real usage data:', error);
            setTodayUsage(0);
          });
      } else {
        console.log('⚠️ No permission - skipping usage data fetch');
        setTodayUsage(0);
      }
      
      console.log('✅ Progress data loaded successfully (today\'s usage loading in background)');
      return; // Exit early - don't run finally block
      
    } catch (error) {
      console.error('❌ Error loading progress data:', error);
      // Clear timeout on error
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setIsLoading(false);
      isLoadingRef.current = false;
    }
    // Note: No finally block needed since we handle cleanup in try and catch
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return `${hours.toFixed(1)}h`;
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return 'flame';
    if (streak >= 7) return 'star';
    if (streak >= 3) return 'checkmark-circle';
    return 'radio-button-off';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#FF6B35';
    if (streak >= 7) return '#FFD700';
    if (streak >= 3) return '#10B981';
    return '#6B7280';
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
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your digital wellness journey</Text>
      </View>

      {/* Streak Card */}
      <View style={styles.streakCard}>
        <Ionicons 
          name={getStreakIcon(streakData?.currentStreak || 0)} 
          size={40} 
          color={getStreakColor(streakData?.currentStreak || 0)} 
        />
        <View style={styles.streakContent}>
          <Text style={styles.streakNumber}>{streakData?.currentStreak || 0}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
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
                width: `${Math.min((todayUsage / dailyGoal) * 100, 100)}%` 
              }]} />
            </View>
            <Text style={styles.goalText}>
              {formatTime(todayUsage)} / {dailyGoal}h goal
            </Text>
          </>
        )}
      </View>

      {/* This Week Overview with Chart */}
      <View style={styles.weeklyCard}>
        <Text style={styles.cardTitle}>Last 7 Days Usage</Text>
        {weekData.length > 0 ? (
          <>
            <Text style={styles.goalText}>
              {weeklyStats ? `${weeklyStats.goalsMet}/${weeklyStats.totalDays} days on track` : 'Loading stats...'}
            </Text>
            
            {/* Weekly Bar Chart with Usage-Based Colors */}
            <View style={styles.weeklyChartContainer}>
              {weekData.map((day: any, index: number) => {
                const maxTime = Math.max(...weekData.map(d => d.usageHours || d.screenTimeHours || 0), 1);
                const dayHours = day.usageHours || day.screenTimeHours || 0;
                const heightPercentage = (dayHours / maxTime) * 100;
                
                // Get usage status and color based on hours
                let usageStatus, usageColor;
                if (dayHours < 2) {
                  usageStatus = 'Healthy';
                  usageColor = '#10b981'; // Green
                } else if (dayHours < 4) {
                  usageStatus = 'Moderate';
                  usageColor = '#f59e0b'; // Amber
                } else {
                  usageStatus = 'High';
                  usageColor = '#ef4444'; // Red
                }
                
                const isPressed = pressedDayIndex === index;
                
                return (
                  <Pressable 
                    key={index} 
                    style={styles.weeklyBarColumn}
                    onPress={() => setPressedDayIndex(isPressed ? null : index)}
                  >
                    {isPressed && (
                      <View style={styles.weeklyTooltip}>
                        <Text style={[styles.weeklyTooltipText, { color: usageColor }]}>
                          {usageStatus}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.weeklyBarValue}>{formatTime(dayHours)}</Text>
                    <View style={styles.weeklyBarOuter}>
                      <View style={[styles.weeklyBarInner, { 
                        height: `${Math.max(heightPercentage, 5)}%`, 
                        backgroundColor: usageColor 
                      }]} />
                    </View>
                    <Text style={styles.weeklyBarLabel}>{day.day || day.dayName}</Text>
                  </Pressable>
                );
              })}
            </View>
            
            {weeklyStats && (
              <View style={styles.achievementItem}>
                <Ionicons name="calendar" size={24} color="#10b981" />
                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementName}>Week Average: {formatTime(weeklyStats.averageUsage)}</Text>
                  <Text style={styles.achievementDesc}>Best day: {weeklyStats.bestDay}</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.permissionWarning}>
            <Ionicons name="information-circle" size={20} color="#0ea5e9" />
            <Text style={styles.permissionText}>
              Loading weekly data... Please wait or pull to refresh
            </Text>
          </View>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.achievementsCard}>
        <Text style={styles.cardTitle}>Achievements</Text>
        
        {achievements.slice(0, 4).map((achievement: any, index: number) => (
          <TouchableOpacity
            key={achievement.id}
            style={styles.achievementItem}
            onPress={() => setSelectedAchievement(achievement)}
          >
            <Ionicons 
              name={achievement.icon} 
              size={24} 
              color={achievement.unlockedDate ? '#FFD700' : '#CBD5E1'} 
            />
            <View style={styles.achievementDetails}>
              <Text style={[
                styles.achievementName,
                achievement.unlockedDate && { color: '#92400e' }
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDesc}>
                {achievement.description} ({achievement.progress}%)
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Achievement Detail Modal */}
      <Modal
        visible={selectedAchievement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons 
              name={selectedAchievement?.icon || 'star'} 
              size={48} 
              color={selectedAchievement?.unlockedDate ? '#FFD700' : '#CBD5E1'} 
            />
            <Text style={styles.cardTitle}>{selectedAchievement?.title}</Text>
            <Text style={styles.goalText}>{selectedAchievement?.description}</Text>
            
            <Text style={styles.permissionText}>
              Progress: {selectedAchievement?.currentValue || 0} / {selectedAchievement?.target || 0}
            </Text>
            
            {selectedAchievement?.unlockedDate && (
              <Text style={styles.achievementDesc}>
                Unlocked on {new Date(selectedAchievement.unlockedDate).toLocaleDateString()}
              </Text>
            )}
            
            <TouchableOpacity
              style={styles.progressBar}
              onPress={() => setSelectedAchievement(null)}
            >
              <Text style={styles.goalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  weeklyChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    marginHorizontal: 4,
  },
  weeklyBarColumn: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 45,
  },
  weeklyBarValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
    textAlign: 'center',
  },
  weeklyBarOuter: {
    width: 32,
    height: 100,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weeklyBarInner: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  weeklyBarLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  weeklyTooltip: {
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
  weeklyTooltipText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});