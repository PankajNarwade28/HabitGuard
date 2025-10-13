import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  static async scheduleScreenTimeAlert(screenTimeHours: number, dailyLimit: number) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Screen Time Alert',
        body: `You've used your device for ${screenTimeHours}h today. Your daily goal is ${dailyLimit}h.`,
        data: { type: 'screen_time_alert', screenTime: screenTimeHours },
      },
      trigger: null, // Send immediately
    });
  }

  static async sendSetupCompleteNotification() {
    try {
      console.log('🔔 Preparing setup complete notification...');
      
      // Check if permission is already granted (don't request again)
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }
      
      console.log('📤 Scheduling setup complete notification...');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 HabitGuard Setup Complete!',
          body: 'All permissions granted! We\'re now tracking your screen time to help you build better digital habits.',
          data: { type: 'setup_complete' },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Setup complete notification scheduled successfully!');
    } catch (error) {
      console.error('❌ Error sending setup complete notification:', error);
    }
  }

  static async sendLoginReminderNotification() {
    try {
      console.log('🔔 Preparing login reminder notification...');
      
      // Check if permission is already granted
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }
      
      console.log('📤 Scheduling login reminder notification...');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔐 Login to HabitGuard',
          body: 'Login to unlock personalized insights, sync your data, and track your progress!',
          data: { type: 'login_reminder' },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Login reminder notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending login reminder notification:', error);
    }
  }

  static async sendLoginSuccessNotification(userName?: string) {
    try {
      console.log('🔔 Preparing login success notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }
      
      const welcomeMessage = userName 
        ? `Welcome back, ${userName}! Your data is now synced.` 
        : 'Welcome back! Your data is now synced.';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Login Successful',
          body: welcomeMessage,
          data: { type: 'login_success' },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Login success notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending login success notification:', error);
    }
  }

  static async sendSignupSuccessNotification(userName?: string) {
    try {
      console.log('🔔 Preparing signup success notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }
      
      const welcomeMessage = userName 
        ? `Welcome to HabitGuard, ${userName}! Your account has been created successfully.` 
        : 'Welcome to HabitGuard! Your account has been created successfully.';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Account Created',
          body: welcomeMessage,
          data: { type: 'signup_success' },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Signup success notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending signup success notification:', error);
    }
  }

  static async sendLogoutNotification() {
    try {
      console.log('🔔 Preparing logout notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👋 Logged Out',
          body: 'You have been logged out successfully. Your local data remains safe.',
          data: { type: 'logout' },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Logout notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending logout notification:', error);
    }
  }

  static async sendDailyWatchtimeNotification(
    totalMinutes: number,
    dailyGoalMinutes: number = 180, // 3 hours default
    isDismissable: boolean = true
  ) {
    try {
      console.log('🔔 Preparing daily watchtime notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      const timeString = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`;

      const goalHours = Math.floor(dailyGoalMinutes / 60);
      const goalMinutes = Math.round(dailyGoalMinutes % 60);
      const goalString = goalHours > 0 
        ? `${goalHours}h ${goalMinutes}m` 
        : `${goalMinutes}m`;

      // Determine status and message
      let title = '';
      let body = '';
      let emoji = '';
      
      const percentageOfGoal = (totalMinutes / dailyGoalMinutes) * 100;

      if (percentageOfGoal <= 50) {
        // Excellent - under 50% of goal
        emoji = '🌟';
        title = `${emoji} Excellent Digital Wellness!`;
        body = `Today's screen time: ${timeString}\nYou're doing amazing! Only ${percentageOfGoal.toFixed(0)}% of your ${goalString} daily goal.`;
      } else if (percentageOfGoal <= 80) {
        // Good - 50-80% of goal
        emoji = '✅';
        title = `${emoji} Great Job!`;
        body = `Today's screen time: ${timeString}\nYou're on track! ${percentageOfGoal.toFixed(0)}% of your ${goalString} goal used.`;
      } else if (percentageOfGoal <= 100) {
        // Approaching limit - 80-100% of goal
        emoji = '⚠️';
        title = `${emoji} Approaching Your Limit`;
        body = `Today's screen time: ${timeString}\nYou've used ${percentageOfGoal.toFixed(0)}% of your ${goalString} goal. Consider taking a break!`;
      } else if (percentageOfGoal <= 120) {
        // Over limit - 100-120% of goal
        emoji = '⏰';
        title = `${emoji} Goal Exceeded`;
        body = `Today's screen time: ${timeString}\nYou've exceeded your ${goalString} goal by ${(percentageOfGoal - 100).toFixed(0)}%. Time to unwind!`;
      } else {
        // Way over limit - >120% of goal
        emoji = '🚨';
        title = `${emoji} High Screen Time Alert`;
        body = `Today's screen time: ${timeString}\nYou've used ${percentageOfGoal.toFixed(0)}% of your ${goalString} goal. Take a longer break for your wellbeing!`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            type: 'daily_watchtime',
            totalMinutes,
            dailyGoalMinutes,
            percentageOfGoal,
            isDismissable,
          },
          sticky: !isDismissable, // Non-dismissable if specified
          priority: percentageOfGoal > 100 ? 'high' : 'default',
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Daily watchtime notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending daily watchtime notification:', error);
    }
  }

  static async sendDataSyncNotification(success: boolean, message?: string) {
    try {
      console.log('🔔 Preparing data sync notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }

      const title = success ? '☁️ Data Synced' : '⚠️ Sync Failed';
      const body = message || (success 
        ? 'Your usage data has been synced to the cloud successfully.' 
        : 'Failed to sync your data. Please check your internet connection.');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'data_sync', success },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Data sync notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending data sync notification:', error);
    }
  }

  static async sendMilestoneNotification(milestone: string, description: string) {
    try {
      console.log('🔔 Preparing milestone notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🏆 ${milestone}`,
          body: description,
          data: { type: 'milestone', milestone },
        },
        trigger: null, // Send immediately
      });
      
      console.log('✅ Milestone notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending milestone notification:', error);
    }
  }

  static async scheduleDailyWatchtimeSummary(hour: number = 20, minute: number = 0) {
    try {
      console.log('🔔 Scheduling daily watchtime summary notification...');
      
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('⚠️ Notification permission not granted.');
        return;
      }

      // Cancel any existing daily summary notifications
      await this.cancelNotificationsByType('daily_watchtime_scheduled');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Daily Summary Ready',
          body: 'Tap to see your screen time report for today and insights!',
          data: { type: 'daily_watchtime_scheduled' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        } as any,
      });
      
      console.log(`✅ Daily watchtime summary scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error('❌ Error scheduling daily watchtime summary:', error);
    }
  }

  static async sendStreakNotification(streakDays: number, streakType: 'screen_time' | 'app_limit' | 'goal_met') {
    try {
      console.log('🔔 Preparing streak notification...');
      
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Notification permission not granted. Cannot send notification.');
        return;
      }

      let title = '';
      let body = '';
      
      switch (streakType) {
        case 'screen_time':
          title = `🔥 ${streakDays} Day Streak!`;
          body = `Amazing! You've maintained healthy screen time for ${streakDays} days in a row. Keep it up!`;
          break;
        case 'app_limit':
          title = `🎯 ${streakDays} Day App Limit Streak!`;
          body = `Incredible! You've stayed within app limits for ${streakDays} consecutive days!`;
          break;
        case 'goal_met':
          title = `⭐ ${streakDays} Day Goal Streak!`;
          body = `Outstanding! You've met your daily goals for ${streakDays} days straight!`;
          break;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'streak', streakDays, streakType },
        },
        trigger: null,
      });
      
      console.log('✅ Streak notification sent successfully!');
    } catch (error) {
      console.error('❌ Error sending streak notification:', error);
    }
  }

  static async scheduleSleepReminder(bedtime: string) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Parse bedtime and calculate reminder time (30 minutes before)
    const [time, period] = bedtime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let reminderHours = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours;
    let reminderMinutes = minutes - 30;
    
    if (reminderMinutes < 0) {
      reminderMinutes += 60;
      reminderHours -= 1;
    }
    
    if (reminderHours < 0) {
      reminderHours += 24;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Wind Down Time',
        body: `It's almost bedtime! Consider putting your device away and preparing for sleep.`,
        data: { type: 'sleep_reminder', bedtime },
      },
      trigger: {
        type: 'daily' as const,
        hour: reminderHours,
        minute: reminderMinutes,
        repeats: true,
      } as any, // Type assertion needed for expo-notifications calendar trigger
    });
  }

  static async scheduleOveruseWarning(appName: string, usageMinutes: number, limitMinutes: number) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'App Usage Alert',
        body: `You've spent ${Math.round(usageMinutes / 60 * 10) / 10}h on ${appName} today. Consider taking a break!`,
        data: { type: 'overuse_warning', app: appName, usage: usageMinutes },
      },
      trigger: null,
    });
  }

  static async scheduleBreakReminder() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for a Break',
        body: 'You\'ve been using your device for a while. Take a 5-minute break to rest your eyes!',
        data: { type: 'break_reminder' },
      },
      trigger: null,
    });
  }

  static async scheduleWeeklyReport(screenTimeData: any) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const averageScreenTime = screenTimeData.weeklyUsage / 7;
    const improvement = screenTimeData.previousWeek - screenTimeData.weeklyUsage;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Digital Wellness Report',
        body: `This week: ${averageScreenTime.toFixed(1)}h/day average. ${
          improvement > 0 ? `Great job! Down ${improvement.toFixed(1)}h from last week.` : 
          `Up ${Math.abs(improvement).toFixed(1)}h from last week. Consider setting stricter limits.`
        }`,
        data: { type: 'weekly_report', data: screenTimeData },
      },
      trigger: {
        weekday: 2, // Monday (1-based, so 2 for Monday)
        hour: 9,
        minute: 0,
        repeats: true,
      } as any, // Type assertion needed for expo-notifications calendar trigger
    });
  }

  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async cancelNotificationsByType(type: string) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }
}

// Usage patterns analyzer
export class UsageAnalyzer {
  static analyzeScreenTimePattern(weeklyData: Array<{ day: string; usage: number }>) {
    const avgUsage = weeklyData.reduce((sum, day) => sum + day.usage, 0) / weeklyData.length;
    const maxUsage = Math.max(...weeklyData.map(d => d.usage));
    const minUsage = Math.min(...weeklyData.map(d => d.usage));
    
    const pattern = {
      average: avgUsage,
      peak: maxUsage,
      lowest: minUsage,
      consistency: 1 - ((maxUsage - minUsage) / avgUsage), // Higher is more consistent
      trend: this.calculateTrend(weeklyData),
      peakDays: weeklyData.filter(d => d.usage > avgUsage * 1.2).map(d => d.day),
    };

    return pattern;
  }

  static calculateTrend(data: Array<{ usage: number }>) {
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.usage, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.usage, 0) / secondHalf.length;
    
    return secondAvg - firstAvg; // Positive = increasing, Negative = decreasing
  }

  static generateSleepRecommendation(screenTimeData: any, currentBedtime: string) {
    const avgScreenTime = screenTimeData.weeklyUsage / 7;
    const [time, period] = currentBedtime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let bedtimeHours = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours;
    
    let recommendation = '';
    let suggestedBedtime = currentBedtime;
    
    if (avgScreenTime > 8) {
      // High screen time - suggest earlier bedtime
      bedtimeHours -= 1;
      if (bedtimeHours < 0) bedtimeHours += 24;
      
      const newPeriod = bedtimeHours >= 12 ? 'PM' : 'AM';
      const displayHours = bedtimeHours > 12 ? bedtimeHours - 12 : bedtimeHours === 0 ? 12 : bedtimeHours;
      suggestedBedtime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
      
      recommendation = `High screen time detected. Consider sleeping earlier at ${suggestedBedtime} to ensure better rest and reduced late-night device usage.`;
    } else if (avgScreenTime < 4) {
      recommendation = 'Great job on maintaining low screen time! Your current sleep schedule supports good digital wellness.';
    } else {
      recommendation = 'Your screen time is moderate. Stick to your current bedtime and consider using wind-down mode 30 minutes before sleep.';
    }
    
    return {
      recommendation,
      suggestedBedtime,
      confidence: avgScreenTime > 8 ? 'high' : avgScreenTime < 4 ? 'high' : 'medium',
    };
  }

  static detectUsageAnomalies(recentData: Array<{ timestamp: Date; usage: number; app: string }>) {
    // Group by app
    const appUsage = recentData.reduce((acc, record) => {
      if (!acc[record.app]) acc[record.app] = [];
      acc[record.app].push(record.usage);
      return acc;
    }, {} as Record<string, number[]>);
    
    const anomalies = [];
    
    for (const [app, usages] of Object.entries(appUsage)) {
      const avgUsage = usages.reduce((sum, usage) => sum + usage, 0) / usages.length;
      const latestUsage = usages[usages.length - 1];
      
      // Detect significant increases (>50% above average)
      if (latestUsage > avgUsage * 1.5 && latestUsage > 60) { // More than 1 hour and 50% above average
        anomalies.push({
          type: 'spike',
          app,
          currentUsage: latestUsage,
          averageUsage: avgUsage,
          severity: latestUsage > avgUsage * 2 ? 'high' : 'medium',
        });
      }
      
      // Detect late night usage
      const lateNightUsage = recentData.filter(d => {
        const hour = d.timestamp.getHours();
        return hour >= 22 || hour <= 6;
      });
      
      if (lateNightUsage.length > 0) {
        const totalLateUsage = lateNightUsage.reduce((sum, d) => sum + d.usage, 0);
        if (totalLateUsage > 60) { // More than 1 hour late at night
          anomalies.push({
            type: 'late_night',
            totalUsage: totalLateUsage,
            sessions: lateNightUsage.length,
            severity: totalLateUsage > 120 ? 'high' : 'medium',
          });
        }
      }
    }
    
    return anomalies;
  }
}