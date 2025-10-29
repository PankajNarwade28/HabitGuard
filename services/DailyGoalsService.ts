import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_KEY = 'daily_goals';

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
}

export interface GoalsProgress {
  totalGoals: number;
  completedGoals: number;
  percentage: number;
  streakDays: number;
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
}

export const dailyGoalsService = new DailyGoalsService();
