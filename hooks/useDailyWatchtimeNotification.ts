import { NotificationService } from '@/services/NotificationService';
import { usageStatsService } from '@/services/UsageStatsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const LAST_NOTIFICATION_KEY = '@habitguard_last_watchtime_notification';
const DAILY_GOAL_KEY = '@habitguard_daily_goal_minutes';

export function useDailyWatchtimeNotification() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState({ hour: 20, minute: 0 }); // 8 PM default
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(180); // 3 hours default

  useEffect(() => {
    loadSettings();
    checkAndSendNotification();
    
    // Schedule daily notification
    scheduleDailyNotification();
  }, []);

  const loadSettings = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      if (storedGoal) {
        setDailyGoalMinutes(parseInt(storedGoal, 10));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkAndSendNotification = async () => {
    try {
      if (!isEnabled) return;

      // Check if we've already sent notification today
      const lastNotificationDate = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);
      const today = new Date().toDateString();
      
      if (lastNotificationDate === today) {
        console.log('⏭️ Watchtime notification already sent today');
        return;
      }

      // Get today's usage stats
      const dailyStats = await usageStatsService.getDailyUsageStats();
      const totalMinutes = (dailyStats.totalScreenTime || 0) / (1000 * 60);

      // Only send if there's meaningful data (more than 5 minutes)
      if (totalMinutes > 5) {
        await NotificationService.sendDailyWatchtimeNotification(
          totalMinutes,
          dailyGoalMinutes,
          true // dismissable
        );

        // Mark notification as sent
        await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, today);
        console.log('✅ Daily watchtime notification sent');
      }
    } catch (error) {
      console.error('Error checking/sending watchtime notification:', error);
    }
  };

  const scheduleDailyNotification = async () => {
    try {
      await NotificationService.scheduleDailyWatchtimeSummary(
        notificationTime.hour,
        notificationTime.minute
      );
    } catch (error) {
      console.error('Error scheduling daily notification:', error);
    }
  };

  const sendManualNotification = async () => {
    try {
      const dailyStats = await usageStatsService.getDailyUsageStats();
      const totalMinutes = (dailyStats.totalScreenTime || 0) / (1000 * 60);

      await NotificationService.sendDailyWatchtimeNotification(
        totalMinutes,
        dailyGoalMinutes,
        true
      );

      console.log('✅ Manual watchtime notification sent');
    } catch (error) {
      console.error('Error sending manual notification:', error);
      throw error;
    }
  };

  const updateDailyGoal = async (minutes: number) => {
    try {
      setDailyGoalMinutes(minutes);
      await AsyncStorage.setItem(DAILY_GOAL_KEY, minutes.toString());
      console.log(`✅ Daily goal updated to ${minutes} minutes`);
    } catch (error) {
      console.error('Error updating daily goal:', error);
    }
  };

  const updateNotificationTime = async (hour: number, minute: number) => {
    try {
      setNotificationTime({ hour, minute });
      await scheduleDailyNotification();
      console.log(`✅ Notification time updated to ${hour}:${minute.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error('Error updating notification time:', error);
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      setIsEnabled(enabled);
      
      if (!enabled) {
        // Cancel scheduled notifications
        await NotificationService.cancelNotificationsByType('daily_watchtime_scheduled');
        console.log('🔕 Daily watchtime notifications disabled');
      } else {
        // Re-schedule notifications
        await scheduleDailyNotification();
        console.log('🔔 Daily watchtime notifications enabled');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  return {
    isEnabled,
    notificationTime,
    dailyGoalMinutes,
    sendManualNotification,
    updateDailyGoal,
    updateNotificationTime,
    toggleNotifications,
    checkAndSendNotification,
  };
}
