import NotificationCard from '@/components/NotificationCard';
import { NotificationService } from '@/services/NotificationService';
import { usageStatsService } from '@/services/UsageStatsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, View } from 'react-native';

const LAST_IN_APP_NOTIFICATION_KEY = '@habitguard_last_in_app_watchtime';
const DAILY_GOAL_KEY = '@habitguard_daily_goal_minutes';

interface WatchtimeStatus {
  emoji: string;
  title: string;
  message: string;
  color: string;
  gradientColors: [string, string];
  percentageOfGoal: number;
}

export function WatchtimeNotificationModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<WatchtimeStatus | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [goalMinutes, setGoalMinutes] = useState(180);

  useEffect(() => {
    checkAndShowNotification();
  }, []);

  const checkAndShowNotification = async () => {
    try {
      // Check if we've already shown notification today
      const lastNotificationDate = await AsyncStorage.getItem(LAST_IN_APP_NOTIFICATION_KEY);
      const today = new Date().toDateString();
      
      if (lastNotificationDate === today) {
        console.log('⏭️ In-app watchtime notification already shown today');
        return;
      }

      // Load daily goal
      const storedGoal = await AsyncStorage.getItem(DAILY_GOAL_KEY);
      const dailyGoal = storedGoal ? parseInt(storedGoal, 10) : 180;
      setGoalMinutes(dailyGoal);

      // Get today's usage stats
      const dailyStats = await usageStatsService.getDailyUsageStats();
      const minutes = (dailyStats.totalScreenTime || 0) / (1000 * 60);
      setTotalMinutes(minutes);

      // Only show if there's meaningful data (more than 30 minutes)
      if (minutes > 30) {
        const watchtimeStatus = calculateStatus(minutes, dailyGoal);
        setStatus(watchtimeStatus);
        setIsVisible(true);

        // Mark notification as shown
        await AsyncStorage.setItem(LAST_IN_APP_NOTIFICATION_KEY, today);
        console.log('✅ In-app watchtime notification shown');
      }
    } catch (error) {
      console.error('Error checking/showing in-app watchtime notification:', error);
    }
  };

  const calculateStatus = (totalMinutes: number, goalMinutes: number): WatchtimeStatus => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const goalHours = Math.floor(goalMinutes / 60);
    const goalMins = Math.round(goalMinutes % 60);
    const goalString = goalHours > 0 ? `${goalHours}h ${goalMins}m` : `${goalMins}m`;

    const percentageOfGoal = (totalMinutes / goalMinutes) * 100;

    if (percentageOfGoal <= 50) {
      // Excellent
      return {
        emoji: '🌟',
        title: 'Excellent Digital Wellness!',
        message: `Today's screen time: ${timeString}\n\nYou're doing amazing! Only ${percentageOfGoal.toFixed(0)}% of your ${goalString} daily goal used.\n\nKeep up the great work maintaining healthy digital habits!`,
        color: '#10b981',
        gradientColors: ['#10b981', '#059669'],
        percentageOfGoal,
      };
    } else if (percentageOfGoal <= 80) {
      // Good
      return {
        emoji: '✅',
        title: 'Great Job!',
        message: `Today's screen time: ${timeString}\n\nYou're on track! ${percentageOfGoal.toFixed(0)}% of your ${goalString} goal used.\n\nStay focused and maintain your progress throughout the day.`,
        color: '#3b82f6',
        gradientColors: ['#3b82f6', '#2563eb'],
        percentageOfGoal,
      };
    } else if (percentageOfGoal <= 100) {
      // Approaching limit
      return {
        emoji: '⚠️',
        title: 'Approaching Your Limit',
        message: `Today's screen time: ${timeString}\n\nYou've used ${percentageOfGoal.toFixed(0)}% of your ${goalString} goal.\n\nConsider taking a break soon to stay within your healthy usage target.`,
        color: '#f59e0b',
        gradientColors: ['#f59e0b', '#d97706'],
        percentageOfGoal,
      };
    } else if (percentageOfGoal <= 120) {
      // Over limit
      return {
        emoji: '⏰',
        title: 'Goal Exceeded',
        message: `Today's screen time: ${timeString}\n\nYou've exceeded your ${goalString} goal by ${(percentageOfGoal - 100).toFixed(0)}%.\n\nTime to unwind and give your eyes a rest!`,
        color: '#ef4444',
        gradientColors: ['#ef4444', '#dc2626'],
        percentageOfGoal,
      };
    } else {
      // Way over limit
      return {
        emoji: '🚨',
        title: 'High Screen Time Alert',
        message: `Today's screen time: ${timeString}\n\nYou've used ${percentageOfGoal.toFixed(0)}% of your ${goalString} goal.\n\nPlease take a longer break for your wellbeing. Your health is important!`,
        color: '#dc2626',
        gradientColors: ['#dc2626', '#991b1b'],
        percentageOfGoal,
      };
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleViewDetails = () => {
    setIsVisible(false);
    // Navigate to analytics screen
    // You can add navigation logic here if needed
  };

  const handleSendPushNotification = async () => {
    try {
      await NotificationService.sendDailyWatchtimeNotification(
        totalMinutes,
        goalMinutes,
        true
      );
      Alert.alert(
        'Notification Sent',
        'A summary notification has been sent to your notification tray.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send notification. Please check notification permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  if (!status) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleDismiss}
    >
      <View className="flex-1 justify-end bg-black/50">
        <NotificationCard
          emoji={status.emoji}
          title={status.title}
          message={status.message}
          color={status.color}
          gradientColors={status.gradientColors}
          percentage={status.percentageOfGoal}
          primaryLabel="📊 View Detailed Analytics"
          onPrimary={handleViewDetails}
          secondaryLabel="� Send as Push Notification"
          onSecondary={handleSendPushNotification}
          dismissLabel="Dismiss"
          onDismiss={handleDismiss}
        />
      </View>
    </Modal>
  );
}
