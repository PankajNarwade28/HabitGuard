import { NotificationService } from '@/services/NotificationService';
import { usageStatsService } from '@/services/UsageStatsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

const LAST_STATUS_KEY = '@habitguard_last_watchtime_status';
const DAILY_GOAL_KEY = '@habitguard_daily_goal_minutes';
const STATUS_CHECK_INTERVAL = 60000; // Check every 1 minute

type WatchtimeStatus = 'excellent' | 'good' | 'moderate' | 'high' | 'critical';

export function useWatchtimeStatusMonitor() {
  const [currentStatus, setCurrentStatus] = useState<WatchtimeStatus | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(180); // 3 hours default
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSettings();
    startMonitoring();
    setupMidnightReset();

    return () => {
      stopMonitoring();
    };
  }, []);

  const setupMidnightReset = () => {
    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Schedule reset at midnight
    setTimeout(() => {
      resetDailyStatus();
      // Set up recurring midnight reset
      setInterval(() => {
        resetDailyStatus();
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeUntilMidnight);
    
    console.log(`🌙 Midnight reset scheduled in ${Math.round(timeUntilMidnight / 1000 / 60)} minutes`);
  };

  const loadSettings = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      if (storedGoal) {
        setDailyGoalMinutes(parseInt(storedGoal, 10));
      }
    } catch (error) {
      console.error('Error loading watchtime monitor settings:', error);
    }
  };

  const calculateStatus = (totalMinutes: number, goalMinutes: number): WatchtimeStatus => {
    const percentage = (totalMinutes / goalMinutes) * 100;

    if (percentage <= 50) return 'excellent';
    if (percentage <= 80) return 'good';
    if (percentage <= 100) return 'moderate';
    if (percentage <= 120) return 'high';
    return 'critical';
  };

  const checkStatusAndNotify = async () => {
    try {
      if (!isMonitoring) return;

      // Get today's usage stats
      const dailyStats = await usageStatsService.getDailyUsageStats();
      const totalMinutes = (dailyStats.totalScreenTime || 0) / (1000 * 60);

      // Only check if there's meaningful data (more than 10 minutes)
      if (totalMinutes < 10) {
        return;
      }

      const newStatus = calculateStatus(totalMinutes, dailyGoalMinutes);
      
      // Get the last known status
      const lastStatusData = await AsyncStorage.getItem(LAST_STATUS_KEY);
      const lastStatus: WatchtimeStatus | null = lastStatusData ? JSON.parse(lastStatusData) : null;

      // Check if status has changed
      if (lastStatus && lastStatus !== newStatus) {
        console.log(`📊 Watchtime status changed: ${lastStatus} → ${newStatus}`);
        
        // Send notification about status change
        await NotificationService.sendWatchtimeStatusChangeNotification(
          lastStatus,
          newStatus,
          totalMinutes,
          dailyGoalMinutes
        );
      }

      // Update current status
      setCurrentStatus(newStatus);
      
      // Save the new status
      await AsyncStorage.setItem(LAST_STATUS_KEY, JSON.stringify(newStatus));
      
    } catch (error) {
      console.error('Error checking watchtime status:', error);
    }
  };

  const startMonitoring = () => {
    console.log('🔍 Starting watchtime status monitoring...');
    
    // Check immediately
    checkStatusAndNotify();
    
    // Set up interval for continuous monitoring
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      checkStatusAndNotify();
    }, STATUS_CHECK_INTERVAL);
    
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    console.log('🛑 Stopping watchtime status monitoring...');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsMonitoring(false);
  };

  const resetDailyStatus = async () => {
    try {
      await AsyncStorage.removeItem(LAST_STATUS_KEY);
      setCurrentStatus(null);
      console.log('🔄 Daily watchtime status reset');
    } catch (error) {
      console.error('Error resetting daily status:', error);
    }
  };

  const updateGoal = async (minutes: number) => {
    try {
      setDailyGoalMinutes(minutes);
      await AsyncStorage.setItem(DAILY_GOAL_KEY, minutes.toString());
      console.log(`✅ Monitoring goal updated to ${minutes} minutes`);
      
      // Re-check status with new goal
      await checkStatusAndNotify();
    } catch (error) {
      console.error('Error updating monitoring goal:', error);
    }
  };

  const forceCheck = async () => {
    console.log('🔍 Forcing watchtime status check...');
    await checkStatusAndNotify();
  };

  return {
    currentStatus,
    isMonitoring,
    dailyGoalMinutes,
    startMonitoring,
    stopMonitoring,
    resetDailyStatus,
    updateGoal,
    forceCheck,
  };
}
