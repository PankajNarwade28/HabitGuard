import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const GOALS_KEY = 'daily_goals';
const USAGE_DATA_KEY = 'daily_usage_data';

export interface DailyGoal {
  id: string;
  type: 'screen_time' | 'app_usage' | 'break_time' | 'productive_time';
  title: string;
  targetValue: number; // in minutes
  currentValue: number;
  unit: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appPackageName?: string; // For app_usage goals
  notifyOnComplete?: boolean;
  notifyOnExceed?: boolean;
}

export interface GoalsProgress {
  totalGoals: number;
  completedGoals: number;
  percentage: number;
  streakDays: number;
}

export interface DailyUsageData {
  totalScreenTime: number; // minutes
  productiveTime: number; // minutes from study sessions
  breaksToday: number; // count
  appUsage: { [packageName: string]: number }; // minutes per app
  lastUpdated: string;
}

class DailyGoalsService {
  /**
   * Get default goals template
   */
  private getDefaultGoals(): DailyGoal[] {
    return [
      {
        id: 'screen_time_limit',
        type: 'screen_time',
        title: 'Daily Screen Time',
        targetValue: 180, // 3 hours
        currentValue: 0,
        unit: 'minutes',
        icon: '📱',
        color: '#3b82f6',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'social_media_limit',
        type: 'app_usage',
        title: 'Social Media Limit',
        targetValue: 60, // 1 hour
        currentValue: 0,
        unit: 'minutes',
        icon: '📲',
        color: '#ec4899',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'break_reminder',
        type: 'break_time',
        title: 'Take Breaks',
        targetValue: 5, // 5 breaks per day
        currentValue: 0,
        unit: 'times',
        icon: '☕',
        color: '#10b981',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'productive_hours',
        type: 'productive_time',
        title: 'Productive Hours',
        targetValue: 120, // 2 hours
        currentValue: 0,
        unit: 'minutes',
        icon: '💼',
        color: '#f59e0b',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get all daily goals
   */
  async getGoals(): Promise<DailyGoal[]> {
    try {
      const goalsJson = await AsyncStorage.getItem(GOALS_KEY);
      
      if (!goalsJson) {
        // First time - return default goals
        const defaultGoals = this.getDefaultGoals();
        await this.saveGoals(defaultGoals);
        return defaultGoals;
      }

      return JSON.parse(goalsJson);
    } catch (error) {
      console.error('Error getting goals:', error);
      return this.getDefaultGoals();
    }
  }

  /**
   * Save goals to storage
   */
  async saveGoals(goals: DailyGoal[]): Promise<void> {
    try {
      await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  }

  /**
   * Add a new goal
   */
  async addGoal(goal: Omit<DailyGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyGoal> {
    try {
      const goals = await this.getGoals();
      
      const newGoal: DailyGoal = {
        ...goal,
        id: `goal_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      goals.push(newGoal);
      await this.saveGoals(goals);
      
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  }

  /**
   * Update goal
   */
  async updateGoal(goalId: string, updates: Partial<DailyGoal>): Promise<void> {
    try {
      const goals = await this.getGoals();
      const index = goals.findIndex(g => g.id === goalId);
      
      if (index !== -1) {
        goals[index] = {
          ...goals[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await this.saveGoals(goals);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(goalId: string, currentValue: number): Promise<void> {
    try {
      await this.updateGoal(goalId, { currentValue });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  /**
   * Delete goal
   */
  async deleteGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const filteredGoals = goals.filter(g => g.id !== goalId);
      await this.saveGoals(filteredGoals);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  /**
   * Toggle goal active status
   */
  async toggleGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const goal = goals.find(g => g.id === goalId);
      
      if (goal) {
        await this.updateGoal(goalId, { isActive: !goal.isActive });
      }
    } catch (error) {
      console.error('Error toggling goal:', error);
      throw error;
    }
  }

  /**
   * Get goals progress summary
   */
  async getGoalsProgress(): Promise<GoalsProgress> {
    try {
      const goals = await this.getGoals();
      const activeGoals = goals.filter(g => g.isActive);
      
      const completedGoals = activeGoals.filter(
        g => g.currentValue >= g.targetValue
      ).length;

      const percentage = activeGoals.length > 0 
        ? Math.round((completedGoals / activeGoals.length) * 100)
        : 0;

      // Get streak from storage
      const streakData = await AsyncStorage.getItem('goals_streak');
      const streakDays = streakData ? JSON.parse(streakData).days : 0;

      return {
        totalGoals: activeGoals.length,
        completedGoals,
        percentage,
        streakDays,
      };
    } catch (error) {
      console.error('Error getting goals progress:', error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        percentage: 0,
        streakDays: 0,
      };
    }
  }

  /**
   * Reset daily goals (call this at midnight)
   */
  async resetDailyGoals(): Promise<void> {
    try {
      const goals = await this.getGoals();
      
      // Check if all goals were completed before reset
      const allCompleted = goals
        .filter(g => g.isActive)
        .every(g => g.currentValue >= g.targetValue);

      // Update streak
      if (allCompleted) {
        const streakData = await AsyncStorage.getItem('goals_streak');
        const currentStreak = streakData ? JSON.parse(streakData).days : 0;
        await AsyncStorage.setItem(
          'goals_streak',
          JSON.stringify({ days: currentStreak + 1, lastUpdate: new Date().toISOString() })
        );
      } else {
        // Reset streak if not all completed
        await AsyncStorage.setItem(
          'goals_streak',
          JSON.stringify({ days: 0, lastUpdate: new Date().toISOString() })
        );
      }

      // Reset current values
      const resetGoals = goals.map(g => ({
        ...g,
        currentValue: 0,
        updatedAt: new Date().toISOString(),
      }));

      await this.saveGoals(resetGoals);
    } catch (error) {
      console.error('Error resetting daily goals:', error);
      throw error;
    }
  }

  /**
   * Get goal by ID
   */
  async getGoalById(goalId: string): Promise<DailyGoal | null> {
    try {
      const goals = await this.getGoals();
      return goals.find(g => g.id === goalId) || null;
    } catch (error) {
      console.error('Error getting goal by ID:', error);
      return null;
    }
  }

  /**
   * Get today's usage data
   */
  async getTodayUsageData(): Promise<DailyUsageData> {
    try {
      const usageJson = await AsyncStorage.getItem(USAGE_DATA_KEY);
      if (!usageJson) {
        return {
          totalScreenTime: 0,
          productiveTime: 0,
          breaksToday: 0,
          appUsage: {},
          lastUpdated: new Date().toISOString(),
        };
      }

      const data: DailyUsageData = JSON.parse(usageJson);
      
      // Check if data is from today
      const lastUpdate = new Date(data.lastUpdated);
      const today = new Date();
      if (lastUpdate.toDateString() !== today.toDateString()) {
        // Reset if it's a new day
        return {
          totalScreenTime: 0,
          productiveTime: 0,
          breaksToday: 0,
          appUsage: {},
          lastUpdated: new Date().toISOString(),
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting usage data:', error);
      return {
        totalScreenTime: 0,
        productiveTime: 0,
        breaksToday: 0,
        appUsage: {},
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Update usage data from app usage statistics
   */
  async updateUsageData(appUsageData: any[]): Promise<void> {
    try {
      const currentData = await this.getTodayUsageData();
      
      // Calculate total screen time
      let totalScreenTime = 0;
      const appUsage: { [key: string]: number } = {};

      appUsageData.forEach((app) => {
        const usageMinutes = Math.round(app.usageTime / (1000 * 60));
        totalScreenTime += usageMinutes;
        appUsage[app.packageName] = usageMinutes;
      });

      // Get productive time from study sessions
      const studySessionsJson = await AsyncStorage.getItem('active_study_session');
      let productiveTime = currentData.productiveTime;
      
      if (studySessionsJson) {
        const session = JSON.parse(studySessionsJson);
        if (session.totalDuration) {
          productiveTime = Math.round(session.totalDuration / 60); // Convert to minutes
        }
      }

      const updatedData: DailyUsageData = {
        totalScreenTime,
        productiveTime,
        breaksToday: currentData.breaksToday,
        appUsage,
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USAGE_DATA_KEY, JSON.stringify(updatedData));
      
      // Update goals with new data
      await this.syncGoalsWithUsage(updatedData);
    } catch (error) {
      console.error('Error updating usage data:', error);
    }
  }

  /**
   * Sync goals current values with actual usage data
   */
  async syncGoalsWithUsage(usageData: DailyUsageData): Promise<void> {
    try {
      const goals = await this.getGoals();
      let notificationsToSend: Array<{ goal: DailyGoal; type: 'complete' | 'exceed' }> = [];

      const updatedGoals = goals.map((goal) => {
        let newCurrentValue = goal.currentValue;
        const oldCurrentValue = goal.currentValue;

        switch (goal.type) {
          case 'screen_time':
            newCurrentValue = usageData.totalScreenTime;
            break;
          
          case 'productive_time':
            newCurrentValue = usageData.productiveTime;
            break;
          
          case 'break_time':
            newCurrentValue = usageData.breaksToday;
            break;
          
          case 'app_usage':
            if (goal.appPackageName) {
              newCurrentValue = usageData.appUsage[goal.appPackageName] || 0;
            }
            break;
        }

        // Check for notifications
        if (goal.isActive && newCurrentValue !== oldCurrentValue) {
          // Goal just completed
          if (oldCurrentValue < goal.targetValue && newCurrentValue >= goal.targetValue) {
            if (goal.notifyOnComplete !== false) {
              notificationsToSend.push({ goal, type: 'complete' });
            }
          }
          
          // Goal exceeded by 20%
          if (newCurrentValue > goal.targetValue * 1.2 && oldCurrentValue <= goal.targetValue * 1.2) {
            if (goal.notifyOnExceed !== false) {
              notificationsToSend.push({ goal, type: 'exceed' });
            }
          }
        }

        return {
          ...goal,
          currentValue: newCurrentValue,
          updatedAt: new Date().toISOString(),
        };
      });

      await this.saveGoals(updatedGoals);

      // Send notifications
      for (const notif of notificationsToSend) {
        await this.sendGoalNotification(notif.goal, notif.type);
      }
    } catch (error) {
      console.error('Error syncing goals with usage:', error);
    }
  }

  /**
   * Record a break taken
   */
  async recordBreak(): Promise<void> {
    try {
      const usageData = await this.getTodayUsageData();
      usageData.breaksToday += 1;
      usageData.lastUpdated = new Date().toISOString();
      
      await AsyncStorage.setItem(USAGE_DATA_KEY, JSON.stringify(usageData));
      await this.syncGoalsWithUsage(usageData);
    } catch (error) {
      console.error('Error recording break:', error);
    }
  }

  /**
   * Send goal notification
   */
  async sendGoalNotification(goal: DailyGoal, type: 'complete' | 'exceed'): Promise<void> {
    try {
      let title = '';
      let body = '';

      if (type === 'complete') {
        title = '🎯 Goal Achieved!';
        body = `Great job! You've reached your "${goal.title}" goal of ${goal.targetValue} ${goal.unit}`;
      } else if (type === 'exceed') {
        title = '⚠️ Goal Limit Exceeded';
        body = `You've exceeded your "${goal.title}" goal. Current: ${goal.currentValue} ${goal.unit}`;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Setup daily reminder notification
   */
  async setupDailyReminder(): Promise<void> {
    try {
      // Cancel existing reminders
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.title?.includes('Daily Goals')) {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      // Schedule daily reminder at 9 PM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Daily Goals Check',
          body: 'How are your goals today? Check your progress!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
          repeats: true,
        } as any,
      });
    } catch (error) {
      console.error('Error setting up daily reminder:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
}

export const dailyGoalsService = new DailyGoalsService();
