import { Platform } from 'react-native';
import { androidUsageStatsManager } from './AndroidUsageStatsManager';

// Type definitions for usage data
export interface AppUsageData {
  packageName: string;
  appName: string;
  totalTimeInForeground: number; // in milliseconds
  lastTimeUsed: number; // timestamp
  icon?: string;
}

export interface DailyUsageStats {
  totalScreenTime: number; // in milliseconds
  appUsage: AppUsageData[];
  date: string;
}

export interface WeeklyUsageStats {
  weeklyTotal: number;
  dailyBreakdown: DailyUsageStats[];
  topApps: AppUsageData[];
}

/**
 * Enhanced Usage Stats Service using proper Android Usage Access
 * This service uses the new AndroidUsageStatsManager for proper native access
 */
class UsageStatsService {
  private isInitialized = false;
  
  constructor() {
    console.log('🛡️ Initializing Enhanced UsageStatsService with Android Usage Stats Manager');
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing Usage Stats Service...');
      this.isInitialized = true;
      console.log('✅ Usage Stats Service initialized - using Android Usage Stats Manager');
    } catch (error) {
      console.log('❌ Failed to initialize Usage Stats Service:', error);
    }
  }

  /**
   * Check if usage access permission is granted
   */
  async checkUsageAccessPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('📱 Usage Stats only available on Android');
      return false;
    }

    try {
      console.log('🔍 Checking Usage Access permission...');
      const hasPermission = await androidUsageStatsManager.checkPermission();
      console.log('📊 Permission status:', hasPermission);
      return hasPermission;
    } catch (error) {
      console.log('❌ Error checking usage access permission:', error);
      return false;
    }
  }

  /**
   * Request usage access permission
   */
  async requestUsageAccessPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('📱 Usage Stats only available on Android');
      return false;
    }

    try {
      console.log('📝 Requesting Usage Access permission...');
      const granted = await androidUsageStatsManager.requestPermission();
      
      if (granted) {
        console.log('✅ Usage Access permission granted');
      } else {
        console.log('⚠️ Usage Access permission not granted - user must enable manually');
        console.log('📱 Please go to: Settings → Apps → Special access → Usage access → HabitGuard → Enable');
      }
      
      return granted;
    } catch (error) {
      console.log('❌ Error requesting usage access permission:', error);
      return false;
    }
  }

  /**
   * Get daily usage statistics - Enhanced with proper Android access
   */
  async getDailyUsageStats(date?: Date): Promise<any> {
    const targetDate = date || new Date();
    const dateString = targetDate.toISOString().split('T')[0];

    console.log('📊 FETCHING ENHANCED ANDROID USAGE DATA for', dateString);
    console.log('🚫 No mock data - using proper Android Usage Stats Manager');

    try {
      // Use the Android Usage Stats Manager
      const result = await androidUsageStatsManager.getDailyUsageStats(targetDate);
      
      if (result.status === 'success') {
        console.log('✅ Enhanced usage data retrieved successfully:', {
          totalTime: this.formatTime(result.totalTime),
          appCount: result.appCount,
          topApp: result.topApps[0]?.appName || 'None'
        });
        
        return {
          totalTime: result.totalTime,
          appCount: result.appCount,
          topApps: result.topApps.map(app => ({
            name: app.appName,
            icon: app.icon,
            timeSpent: app.totalTimeInForeground,
            packageName: app.packageName,
            lastTimeUsed: app.lastTimeUsed
          })),
          unlocks: result.unlocks,
          notifications: result.notifications,
          status: result.status
        };
      } else {
        console.log('⚠️ Usage data not available:', result.message);
        return {
          totalTime: 0,
          appCount: 0,
          topApps: [],
          unlocks: 0,
          notifications: 0,
          status: result.status,
          message: result.message
        };
      }
    } catch (error) {
      console.log('❌ Error getting enhanced usage stats:', error);
      return {
        totalTime: 0,
        appCount: 0,
        topApps: [],
        unlocks: 0,
        notifications: 0,
        status: 'error',
        message: `Error retrieving usage data: ${error}`
      };
    }
  }

  /**
   * Get weekly usage statistics - Enhanced
   */
  async getWeeklyUsageStats(): Promise<any> {
    console.log('📅 Getting enhanced weekly usage statistics...');
    
    try {
      const result = await androidUsageStatsManager.getWeeklyUsageStats();
      
      if (result.status === 'success') {
        console.log('📊 Weekly stats compiled:', {
          totalTime: this.formatTime(result.totalTime),
          averageTime: this.formatTime(result.averageTime),
          daysWithData: result.daysWithData,
          topApp: result.topApp
        });
      }
      
      return result;
    } catch (error) {
      console.log('❌ Error getting weekly usage stats:', error);
      return {
        totalTime: 0,
        averageTime: 0,
        daysWithData: 0,
        topApp: 'No data',
        message: 'Unable to retrieve weekly usage data',
        status: 'error'
      };
    }
  }

  /**
   * Get top apps by usage time
   */
  async getTopApps(limit: number = 10): Promise<any[]> {
    const dailyStats = await this.getDailyUsageStats();
    return (dailyStats.topApps || [])
      .sort((a: any, b: any) => b.timeSpent - a.timeSpent)
      .slice(0, limit);
  }

  /**
   * Get usage status for ML analysis
   */
  async getUsageStatus(): Promise<any> {
    try {
      const dailyStats = await this.getDailyUsageStats();
      const totalHours = (dailyStats.totalTime || 0) / (1000 * 60 * 60);
      
      if (dailyStats.status === 'no_permission') {
        return {
          status: 'No Permission',
          message: 'Please grant Usage Access permission in Android Settings',
          color: '#f59e0b',
          icon: 'settings',
          totalHours: '0'
        };
      }
      
      if (dailyStats.status === 'no_data' || dailyStats.status === 'error') {
        return {
          status: 'No Data',
          message: 'Unable to analyze usage - no data available',
          color: '#6b7280',
          icon: 'alert-circle',
          totalHours: '0'
        };
      }
      
      let status, message, color, icon;
      
      if (totalHours < 2) {
        status = 'Excellent';
        message = 'Great job maintaining low screen time!';
        color = '#059669';
        icon = 'checkmark-circle';
      } else if (totalHours < 4) {
        status = 'Good';
        message = 'You\'re doing well with moderate usage';
        color = '#0284c7';
        icon = 'thumbs-up';
      } else if (totalHours < 6) {
        status = 'Moderate';
        message = 'Consider reducing screen time';
        color = '#f59e0b';
        icon = 'warning';
      } else {
        status = 'High';
        message = 'Try to limit screen time for better well-being';
        color = '#dc2626';
        icon = 'alert-triangle';
      }
      
      return {
        status,
        message,
        color,
        icon,
        totalHours: totalHours.toFixed(1)
      };
    } catch (error) {
      console.log('❌ Error getting usage status:', error);
      return {
        status: 'Error',
        message: 'Unable to analyze usage data',
        color: '#6b7280',
        icon: 'alert-circle',
        totalHours: '0'
      };
    }
  }

  /**
   * Debug method to test the enhanced usage stats API
   */
  public async debugUsageStatsAPI(): Promise<void> {
    console.log('🔧 DEBUG: Testing Enhanced Usage Stats API...');
    
    try {
      // Get debug info from Android manager
      const debugInfo = androidUsageStatsManager.getDebugInfo();
      console.log('📊 Android Usage Stats Manager Debug Info:', debugInfo);
      
      // Test permission check
      const hasPermission = await this.checkUsageAccessPermission();
      console.log('🔒 Permission status:', hasPermission);
      
      if (hasPermission) {
        // Test data retrieval
        const dailyStats = await this.getDailyUsageStats();
        console.log('📊 Sample daily stats:', {
          totalTime: this.formatTime(dailyStats.totalTime || 0),
          appCount: dailyStats.appCount || 0,
          status: dailyStats.status || 'unknown'
        });
      } else {
        console.log('⚠️ No permission - cannot test data retrieval');
      }
      
      console.log('✅ Enhanced API debug test completed');
    } catch (error) {
      console.log('❌ Enhanced API debug failed:', error);
    }
  }

  /**
   * Format time from milliseconds to readable string
   */
  formatTime(milliseconds: number): string {
    if (!milliseconds || milliseconds < 1000) {
      return 'Less than 1 minute';
    }
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    
    return `${minutes}m`;
  }

  /**
   * Get comprehensive debug information
   */
  public getDebugInfo(): any {
    const androidDebugInfo = androidUsageStatsManager.getDebugInfo();
    
    return {
      serviceInitialized: this.isInitialized,
      platformOS: Platform.OS,
      androidManager: androidDebugInfo,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Force refresh the service
   */
  async refreshService(): Promise<void> {
    console.log('🔄 Refreshing Enhanced UsageStatsService...');
    await this.initialize();
    console.log('✅ Enhanced service refreshed');
  }
}

export const usageStatsService = new UsageStatsService();