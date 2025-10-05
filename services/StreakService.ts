import AsyncStorage from '@react-native-async-storage/async-storage';
import { permissionService } from './PermissionService';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastUpdateDate: string;
  totalDaysUnderGoal: number;
  weeklyGoalsMet: number;
  monthlyGoalsMet: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'goal' | 'reduction' | 'milestone';
  unlockedDate?: string;
  progress: number; // 0-100
  target: number;
  currentValue: number;
}

export interface WeekData {
  date: string;
  screenTimeHours: number;
  goalMet: boolean;
  dayName: string;
}

class StreakService {
  private static readonly STORAGE_KEYS = {
    STREAK_DATA: 'habitguard_streak_data',
    ACHIEVEMENTS: 'habitguard_achievements',
    WEEKLY_PROGRESS: 'habitguard_weekly_progress'
  };

  /**
   * Get current streak data
   */
  async getStreakData(): Promise<StreakData> {
    try {
      const stored = await AsyncStorage.getItem(StreakService.STORAGE_KEYS.STREAK_DATA);
      
      const defaultData: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastUpdateDate: '',
        totalDaysUnderGoal: 0,
        weeklyGoalsMet: 0,
        monthlyGoalsMet: 0
      };

      if (!stored) {
        await this.saveStreakData(defaultData);
        return defaultData;
      }

      return { ...defaultData, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error getting streak data:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastUpdateDate: '',
        totalDaysUnderGoal: 0,
        weeklyGoalsMet: 0,
        monthlyGoalsMet: 0
      };
    }
  }

  /**
   * Save streak data
   */
  async saveStreakData(data: StreakData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StreakService.STORAGE_KEYS.STREAK_DATA,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  /**
   * Update streak based on daily usage
   */
  async updateDailyStreak(dailyUsageHours: number): Promise<StreakData> {
    try {
      const userSettings = await permissionService.getUserSettings();
      const streakData = await this.getStreakData();
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already updated today
      if (streakData.lastUpdateDate === today) {
        return streakData;
      }

      const goalMet = dailyUsageHours <= userSettings.dailyGoalHours;
      
      if (goalMet) {
        // Goal met - continue or start streak
        streakData.currentStreak += 1;
        streakData.totalDaysUnderGoal += 1;
        
        // Update longest streak if current is higher
        if (streakData.currentStreak > streakData.longestStreak) {
          streakData.longestStreak = streakData.currentStreak;
        }
        
        // Update weekly goals met counter
        const currentDayOfWeek = new Date().getDay();
        // Reset weekly counter on Monday (day 1)
        if (currentDayOfWeek === 1) {
          streakData.weeklyGoalsMet = 1;
        } else {
          streakData.weeklyGoalsMet = (streakData.weeklyGoalsMet || 0) + 1;
        }
      } else {
        // Goal not met - reset streak but don't reset weekly goals counter
        streakData.currentStreak = 0;
      }
      
      streakData.lastUpdateDate = today;
      await this.saveStreakData(streakData);
      
      // Check for achievements (now safe from circular dependency)
      await this.checkAndUnlockAchievements(streakData, dailyUsageHours, goalMet);
      
      console.log('✅ Streak updated:', streakData);
      return streakData;
    } catch (error) {
      console.error('Error updating streak:', error);
      return await this.getStreakData();
    }
  }

  /**
   * Get this week's progress data
   */
  async getThisWeekProgress(): Promise<WeekData[]> {
    try {
      const userSettings = await permissionService.getUserSettings();
      const today = new Date();
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Get Monday of current week
      const currentDayOfWeek = today.getDay();
      const daysSinceMonday = (currentDayOfWeek + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - daysSinceMonday);
      
      console.log('📅 Getting weekly progress data...');
      
      // Try to get real usage stats
      let weeklyUsageData: any = null;
      
      try {
        const { usageStatsService: uss } = await import('./UsageStatsService');
        weeklyUsageData = await uss.getWeeklyUsageStats();
        console.log('✅ Got weekly usage stats:', weeklyUsageData);
      } catch (error) {
        console.log('⚠️ Could not load usage stats:', error);
      }
      
      const weekData: WeekData[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        // For future days, show empty data
        if (date > today) {
          weekData.push({
            date: dateString,
            screenTimeHours: 0,
            goalMet: false,
            dayName: dayNames[i]
          });
          continue;
        }
        
        // Try to find real usage data for this day
        let screenTimeHours = 0;
        
        if (weeklyUsageData && weeklyUsageData.dailyBreakdown) {
          // Match by date string
          const realDayData = weeklyUsageData.dailyBreakdown.find((d: any) => {
            // Try multiple date formats
            const dayDate = d.date || d.dateString || '';
            return dayDate === dateString || dayDate.startsWith(dateString);
          });
          
          if (realDayData) {
            screenTimeHours = (realDayData.totalTime || 0) / (1000 * 60 * 60);
            console.log(`  ${dayNames[i]}: ${screenTimeHours.toFixed(2)}h from real data`);
          } else {
            console.log(`  ${dayNames[i]}: No data found for ${dateString}`);
          }
        }
        
        const goalMet = screenTimeHours > 0 && screenTimeHours <= userSettings.dailyGoalHours;
        
        weekData.push({
          date: dateString,
          screenTimeHours,
          goalMet,
          dayName: dayNames[i]
        });
      }
      
      console.log('✅ Weekly progress calculated:', weekData.map(d => `${d.dayName}: ${d.screenTimeHours.toFixed(2)}h`));
      return weekData;
    } catch (error) {
      console.error('Error getting week progress:', error);
      return [];
    }
  }

  /**
   * Get achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    try {
      const stored = await AsyncStorage.getItem(StreakService.STORAGE_KEYS.ACHIEVEMENTS);
      
      if (!stored) {
        const defaultAchievements = this.createDefaultAchievements();
        await this.saveAchievements(defaultAchievements);
        return defaultAchievements;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting achievements:', error);
      return this.createDefaultAchievements();
    }
  }

  /**
   * Save achievements
   */
  async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StreakService.STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(achievements)
      );
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  /**
   * Create default achievements
   */
  private createDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_day',
        title: 'First Step',
        description: 'Complete your first day under the goal',
        icon: 'medal',
        type: 'goal',
        progress: 0,
        target: 1,
        currentValue: 0
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: 'trophy',
        type: 'streak',
        progress: 0,
        target: 7,
        currentValue: 0
      },
      {
        id: 'month_streak',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: 'star',
        type: 'streak',
        progress: 0,
        target: 30,
        currentValue: 0
      },
      {
        id: 'reduction_50',
        title: 'Screen Time Saver',
        description: 'Reduce daily usage by 50% from baseline',
        icon: 'trending-down',
        type: 'reduction',
        progress: 0,
        target: 50,
        currentValue: 0
      },
      {
        id: 'consistency_king',
        title: 'Consistency King',
        description: 'Meet goal 5 days in a week',
        icon: 'checkmark-circle',
        type: 'goal',
        progress: 0,
        target: 5,
        currentValue: 0
      },
      {
        id: 'digital_detox',
        title: 'Digital Detox',
        description: 'Use phone for less than 2 hours in a day',
        icon: 'leaf',
        type: 'milestone',
        progress: 0,
        target: 1,
        currentValue: 0
      }
    ];
  }

  /**
   * Check and unlock achievements
   */
  async checkAndUnlockAchievements(streakData: StreakData, dailyUsageHours: number, goalMet: boolean): Promise<void> {
    try {
      const achievements = await this.getAchievements();
      let achievementsUpdated = false;

      for (const achievement of achievements) {
        let newProgress = achievement.progress;
        let newCurrentValue = achievement.currentValue;

        switch (achievement.id) {
          case 'first_day':
            if (goalMet && !achievement.unlockedDate) {
              newCurrentValue = 1;
              newProgress = 100;
              achievement.unlockedDate = new Date().toISOString();
              achievementsUpdated = true;
            }
            break;

          case 'week_streak':
            newCurrentValue = streakData.currentStreak;
            newProgress = Math.min((streakData.currentStreak / 7) * 100, 100);
            if (streakData.currentStreak >= 7 && !achievement.unlockedDate) {
              achievement.unlockedDate = new Date().toISOString();
              achievementsUpdated = true;
            }
            break;

          case 'month_streak':
            newCurrentValue = streakData.currentStreak;
            newProgress = Math.min((streakData.currentStreak / 30) * 100, 100);
            if (streakData.currentStreak >= 30 && !achievement.unlockedDate) {
              achievement.unlockedDate = new Date().toISOString();
              achievementsUpdated = true;
            }
            break;

          case 'digital_detox':
            if (dailyUsageHours < 2 && !achievement.unlockedDate) {
              newCurrentValue = 1;
              newProgress = 100;
              achievement.unlockedDate = new Date().toISOString();
              achievementsUpdated = true;
            }
            break;

          case 'consistency_king':
            // Use streakData instead of calling getThisWeekProgress to avoid circular dependency
            // We'll update this achievement later when the weekly data is refreshed
            newCurrentValue = streakData.weeklyGoalsMet;
            newProgress = Math.min((streakData.weeklyGoalsMet / 5) * 100, 100);
            if (streakData.weeklyGoalsMet >= 5 && !achievement.unlockedDate) {
              achievement.unlockedDate = new Date().toISOString();
              achievementsUpdated = true;
            }
            break;
        }

        achievement.currentValue = newCurrentValue;
        achievement.progress = newProgress;
      }

      if (achievementsUpdated) {
        await this.saveAchievements(achievements);
        console.log('🏆 Achievements updated!');
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }

  /**
   * Get weekly stats summary
   */
  async getWeeklyStats(): Promise<{
    totalDays: number;
    goalsMet: number;
    averageUsage: number;
    bestDay: string;
    improvement: number;
  }> {
    try {
      const weekData = await this.getThisWeekProgress();
      const validDays = weekData.filter(day => day.screenTimeHours > 0);
      
      const totalDays = validDays.length;
      const goalsMet = validDays.filter(day => day.goalMet).length;
      const averageUsage = validDays.reduce((sum, day) => sum + day.screenTimeHours, 0) / totalDays;
      
      const bestDay = validDays.reduce((best, day) => 
        day.screenTimeHours < best.screenTimeHours ? day : best
      );
      
      // Calculate improvement (placeholder - would compare to previous week)
      const improvement = Math.random() * 20 - 10; // -10% to +10%
      
      return {
        totalDays,
        goalsMet,
        averageUsage: averageUsage || 0,
        bestDay: bestDay?.dayName || 'None',
        improvement
      };
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return {
        totalDays: 0,
        goalsMet: 0,
        averageUsage: 0,
        bestDay: 'None',
        improvement: 0
      };
    }
  }

  /**
   * Reset all streak data (for testing or fresh start)
   */
  async resetStreakData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        StreakService.STORAGE_KEYS.STREAK_DATA,
        StreakService.STORAGE_KEYS.ACHIEVEMENTS,
        StreakService.STORAGE_KEYS.WEEKLY_PROGRESS
      ]);
      console.log('✅ Streak data reset');
    } catch (error) {
      console.error('Error resetting streak data:', error);
    }
  }
}

export const streakService = new StreakService();