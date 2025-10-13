import { NotificationService } from '@/services/NotificationService';
import { usageStatsService } from '@/services/UsageStatsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';

const DAILY_GOAL_KEY = '@habitguard_daily_goal_minutes';
const LAST_STATUS_KEY = '@habitguard_last_watchtime_status';
const LAST_CHECK_TIME_KEY = '@habitguard_last_check_time';

type WatchtimeStatus = 'excellent' | 'good' | 'approaching' | 'exceeded' | 'critical';

interface StatusInfo {
  status: WatchtimeStatus;
  percentageOfGoal: number;
  totalMinutes: number;
}

export function useWatchtimeMonitor() {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start monitoring
    startMonitoring();

    // Cleanup on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const startMonitoring = () => {
    // Check immediately
    checkWatchtimeStatus();

    // Then check every 15 minutes
    checkIntervalRef.current = setInterval(() => {
      checkWatchtimeStatus();
    }, 15 * 60 * 1000); // 15 minutes
  };

  const checkWatchtimeStatus = async () => {
    try {
      // Get daily goal
      const storedGoal = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      const dailyGoalMinutes = storedGoal ? parseInt(storedGoal, 10) : 180; // 3 hours default

      // Get today's usage
      const dailyStats = await usageStatsService.getDailyUsageStats();
      const totalMinutes = (dailyStats.totalScreenTime || 0) / (1000 * 60);

      // Only check if there's meaningful usage (more than 10 minutes)
      if (totalMinutes < 10) {
        return;
      }

      // Calculate current status
      const currentStatus = calculateStatus(totalMinutes, dailyGoalMinutes);

      // Get last status
      const lastStatusData = await AsyncStorage.getItem(LAST_STATUS_KEY);
      const lastStatus: StatusInfo | null = lastStatusData ? JSON.parse(lastStatusData) : null;

      // Get last check time
      const lastCheckTime = await AsyncStorage.getItem(LAST_CHECK_TIME_KEY);
      const now = Date.now();
      const timeSinceLastCheck = lastCheckTime ? now - parseInt(lastCheckTime, 10) : Infinity;

      // Check if status has changed or it's been more than 2 hours since last notification
      const statusChanged = !lastStatus || lastStatus.status !== currentStatus.status;
      const enoughTimePassed = timeSinceLastCheck > 2 * 60 * 60 * 1000; // 2 hours

      if (statusChanged || enoughTimePassed) {
        // Send notification for status change
        await sendStatusNotification(currentStatus, dailyGoalMinutes, statusChanged);

        // Update stored status
        await AsyncStorage.setItem(LAST_STATUS_KEY, JSON.stringify(currentStatus));
        await AsyncStorage.setItem(LAST_CHECK_TIME_KEY, now.toString());

        console.log(`📊 Watchtime status ${statusChanged ? 'changed' : 'reminder'}: ${currentStatus.status} (${currentStatus.percentageOfGoal.toFixed(0)}%)`);
      }
    } catch (error) {
      console.error('Error checking watchtime status:', error);
    }
  };

  const calculateStatus = (totalMinutes: number, dailyGoalMinutes: number): StatusInfo => {
    const percentageOfGoal = (totalMinutes / dailyGoalMinutes) * 100;

    let status: WatchtimeStatus;
    if (percentageOfGoal <= 50) {
      status = 'excellent';
    } else if (percentageOfGoal <= 80) {
      status = 'good';
    } else if (percentageOfGoal <= 100) {
      status = 'approaching';
    } else if (percentageOfGoal <= 120) {
      status = 'exceeded';
    } else {
      status = 'critical';
    }

    return {
      status,
      percentageOfGoal,
      totalMinutes,
    };
  };

  const sendStatusNotification = async (
    statusInfo: StatusInfo,
    dailyGoalMinutes: number,
    isStatusChange: boolean
  ) => {
    try {
      const { totalMinutes, percentageOfGoal } = statusInfo;

      // Format time strings
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      const goalHours = Math.floor(dailyGoalMinutes / 60);
      const goalMinutes = Math.round(dailyGoalMinutes % 60);
      const goalString = goalHours > 0 ? `${goalHours}h ${goalMinutes}m` : `${goalMinutes}m`;

      // Send notification using NotificationService
      await NotificationService.sendDailyWatchtimeNotification(
        totalMinutes,
        dailyGoalMinutes,
        true
      );

      // Log for debugging
      if (isStatusChange) {
        console.log(`🔔 Status changed notification sent: ${timeString} / ${goalString} (${percentageOfGoal.toFixed(0)}%)`);
      } else {
        console.log(`🔔 Reminder notification sent: ${timeString} / ${goalString} (${percentageOfGoal.toFixed(0)}%)`);
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  };

  const forceCheck = async () => {
    // Clear last status to force a notification
    await AsyncStorage.removeItem(LAST_STATUS_KEY);
    await AsyncStorage.removeItem(LAST_CHECK_TIME_KEY);
    await checkWatchtimeStatus();
  };

  return {
    forceCheck,
    checkWatchtimeStatus,
  };
}
