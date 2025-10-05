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