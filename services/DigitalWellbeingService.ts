import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { usageStatsService } from './UsageStatsService';

export interface DeviceUsageData {
  todayUsage: number; // hours
  todayPickups: number;
  todayNotifications: number;
  firstPickupTime: string;
  screenOnTime: number; // hours
  appUsage: Array<{
    packageName: string;
    appName: string;
    usageTime: number; // minutes
    launches: number;
    category: string;
    color: string;
  }>;
  weeklyData: Array<{
    date: string;
    usage: number;
    pickups: number;
  }>;
}

export interface PermissionStatus {
  granted: boolean;
  canRequestAgain: boolean;
  lastRequestTime?: number;
}

export interface ProcessedAppData {
  name: string;
  category: string;
  usageHours: number;
  usageMinutes: number;
  launches: number;
  color: string;
  percentage: number;
}

export interface ProcessedWeeklyData {
  date: string;
  usage: number;
  pickups: number;
  dayName: string;
}

export interface ProcessedInsights {
  todayVsAverage: {
    difference: number;
    isHigher: boolean;
    text: string;
  };
  topAppToday: string;
  mostProductiveHour: string;
  screenTimeCategory: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export interface ProcessedData {
  success: boolean;
  hasData: boolean;
  status: string;
  message: string;
  data: {
    todayUsage: number;
    todayPickups: number;
    todayNotifications: number;
    firstPickupTime: string;
    screenOnTime: number;
    appUsage: ProcessedAppData[];
    weeklyData: ProcessedWeeklyData[];
    insights: ProcessedInsights;
  } | null;
}

/**
 * Real-data-only Digital Wellbeing Service
 * Interfaces with Android Usage Stats API through UsageStatsService
 * NO MOCK DATA OR DEMO MODE
 */
class DigitalWellbeingService {
  private permissionStatus: PermissionStatus;
  private processedData: ProcessedData | null = null;
  private isInitialized = false;

  constructor() {
    console.log('🛡️ Initializing Real-Data-Only DigitalWellbeingService');
    this.permissionStatus = {
      granted: false,
      canRequestAgain: true,
    };
  }

  /**
   * Initialize the service - Real data only
   */
  async initialize(): Promise<void> {
    try {
      console.log('🛡️ Initializing DigitalWellbeingService for real data only...');
      
      // Always reset permission status to ensure fresh requests
      console.log('🔄 Resetting permission status to ensure fresh requests');
      this.permissionStatus = {
        granted: false,
        canRequestAgain: true,
      };
      await AsyncStorage.removeItem('screentime_permission');

      // Check if platform supports usage stats
      if (Platform.OS !== 'android') {
        console.log('⚠️ Usage stats only available on Android');
        this.permissionStatus = { granted: false, canRequestAgain: false };
        this.isInitialized = true;
        return;
      }

      this.isInitialized = true;
      console.log('✅ DigitalWellbeingService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize DigitalWellbeingService:', error);
      this.isInitialized = true; // Mark as initialized even if failed
    }
  }

  /**
   * Request usage access permission - Real Android permission only
   */
  async requestUsageAccessPermission(): Promise<boolean> {
    try {
      console.log('🔐 Requesting real Android usage access permission...');

      // Check if platform supports usage stats
      if (Platform.OS !== 'android') {
        console.log('⚠️ Usage access permission only available on Android');
        Alert.alert(
          'Platform Not Supported',
          'Usage access permission is only available on Android devices.',
          [{ text: 'OK' }]
        );
        return false;
      }

      let granted = false;

      try {
        // Request real Android permission
        console.log('📱 Requesting Android usage access permission');
        await usageStatsService.requestUsageAccessPermission();
        
        // Check if permission was granted
        granted = await usageStatsService.checkUsageAccessPermission();
        console.log(`🔐 Permission request result: ${granted}`);
      } catch (error) {
        console.error('❌ Error requesting permission:', error);
        granted = false;
      }

      // Update permission status
      this.permissionStatus = {
        granted,
        canRequestAgain: !granted,
        lastRequestTime: Date.now(),
      };

      if (granted) {
        console.log('✅ Usage access permission granted');
        await AsyncStorage.setItem('screentime_permission', 'true');
        await this.loadAndProcessRealData();
      } else {
        console.log('❌ Usage access permission denied');
        await AsyncStorage.removeItem('screentime_permission');
      }

      return granted;
    } catch (error) {
      console.error('❌ Error in permission request:', error);
      return false;
    }
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): PermissionStatus {
    return { ...this.permissionStatus };
  }

  /**
   * Load and process real Android usage data
   */
  private async loadAndProcessRealData(): Promise<void> {
    try {
      console.log('📊 Loading real Android usage data...');

      // Get real daily stats from Android
      const dailyResult = await usageStatsService.getDailyUsageStats();
      
      if (!dailyResult.success || !dailyResult.hasData) {
        console.log('⚠️ No real daily usage data available');
        this.processedData = {
          success: false,
          hasData: false,
          status: dailyResult.status || 'no_data',
          message: dailyResult.message || 'No real usage data available from Android',
          data: null
        };
        return;
      }

      // Get real weekly stats from Android
      const weeklyResult = await usageStatsService.getWeeklyUsageStats();

      // Process the real data
      this.processedData = this.processRealUsageData(dailyResult, weeklyResult);
      
      console.log('✅ Real usage data processed successfully');
    } catch (error) {
      console.error('❌ Error loading real usage data:', error);
      this.processedData = {
        success: false,
        hasData: false,
        status: 'error',
        message: `Error loading real data: ${error}`,
        data: null
      };
    }
  }

  /**
   * Process real usage data from Android
   */
  private processRealUsageData(dailyResult: any, weeklyResult: any): ProcessedData {
    try {
      console.log('🔄 Processing real Android usage data...');

      const dailyData = dailyResult.data;
      const weeklyData = weeklyResult.hasData ? weeklyResult.data : [];

      // Process app usage data
      const processedApps: ProcessedAppData[] = dailyData.appUsage.map((app: any, index: number) => {
        const usageMinutes = Math.round(app.usageTime);
        const usageHours = Math.floor(usageMinutes / 60);
        const remainingMinutes = usageMinutes % 60;

        return {
          name: app.appName || app.packageName || `App ${index + 1}`,
          category: app.category || 'Other',
          usageHours,
          usageMinutes: remainingMinutes,
          launches: app.launches || 0,
          color: app.color || this.getAppColor(index),
          percentage: this.calculateAppPercentage(app.usageTime, dailyData.todayUsage)
        };
      });

      // Process weekly data
      const processedWeekly: ProcessedWeeklyData[] = weeklyData.map((day: any) => ({
        date: day.date,
        usage: day.usage || 0,
        pickups: day.pickups || 0,
        dayName: this.getDayName(day.date)
      }));

      // Calculate insights from real data
      const insights = this.calculateInsights(dailyData, processedApps, processedWeekly);

      return {
        success: true,
        hasData: true,
        status: 'real_data_loaded',
        message: 'Real Android usage data loaded successfully',
        data: {
          todayUsage: dailyData.todayUsage || 0,
          todayPickups: dailyData.todayPickups || 0,
          todayNotifications: dailyData.todayNotifications || 0,
          firstPickupTime: dailyData.firstPickupTime || 'No data',
          screenOnTime: dailyData.screenOnTime || 0,
          appUsage: processedApps,
          weeklyData: processedWeekly,
          insights
        }
      };
    } catch (error) {
      console.error('❌ Error processing real usage data:', error);
      return {
        success: false,
        hasData: false,
        status: 'processing_error',
        message: `Error processing real data: ${error}`,
        data: null
      };
    }
  }

  /**
   * Calculate insights from real data
   */
  private calculateInsights(
    dailyData: any,
    appUsage: ProcessedAppData[],
    weeklyData: ProcessedWeeklyData[]
  ): ProcessedInsights {
    // Calculate average from weekly data
    const weeklyAverage = weeklyData.length > 0 
      ? weeklyData.reduce((sum, day) => sum + day.usage, 0) / weeklyData.length
      : dailyData.todayUsage;

    const todayVsAverage = {
      difference: Math.round(((dailyData.todayUsage - weeklyAverage) / weeklyAverage) * 100),
      isHigher: dailyData.todayUsage > weeklyAverage,
      text: dailyData.todayUsage > weeklyAverage ? 'above' : 'below'
    };

    // Get top app
    const topAppToday = appUsage.length > 0 ? appUsage[0].name : 'No apps used';

    // Determine screen time category
    let screenTimeCategory: 'Low' | 'Moderate' | 'High' | 'Very High';
    if (dailyData.todayUsage < 2) {
      screenTimeCategory = 'Low';
    } else if (dailyData.todayUsage < 4) {
      screenTimeCategory = 'Moderate';
    } else if (dailyData.todayUsage < 6) {
      screenTimeCategory = 'High';
    } else {
      screenTimeCategory = 'Very High';
    }

    return {
      todayVsAverage,
      topAppToday,
      mostProductiveHour: 'Based on real usage patterns', // Could be enhanced with hourly data
      screenTimeCategory
    };
  }

  /**
   * Get processed usage data
   */
  async getUsageData(): Promise<ProcessedData> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.permissionStatus.granted) {
      return {
        success: false,
        hasData: false,
        status: 'permission_required',
        message: 'Usage access permission required to display real data',
        data: null
      };
    }

    if (!this.processedData) {
      await this.loadAndProcessRealData();
    }

    return this.processedData || {
      success: false,
      hasData: false,
      status: 'no_data',
      message: 'No real usage data available',
      data: null
    };
  }

  /**
   * Refresh data by reloading from Android
   */
  async refreshData(): Promise<ProcessedData> {
    console.log('🔄 Refreshing real Android usage data...');
    this.processedData = null;
    return await this.getUsageData();
  }

  /**
   * Check if service has real data available
   */
  hasData(): boolean {
    return this.processedData?.hasData === true;
  }

  /**
   * Get service status
   */
  getStatus(): string {
    if (!this.isInitialized) return 'not_initialized';
    if (!this.permissionStatus.granted) return 'permission_required';
    if (!this.processedData) return 'no_data_loaded';
    return this.processedData.status;
  }

  // Helper methods
  private getAppColor(index: number): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[index % colors.length];
  }

  private calculateAppPercentage(appTime: number, totalTime: number): number {
    if (totalTime === 0) return 0;
    return Math.round((appTime / (totalTime * 60)) * 100); // Convert hours to minutes for calculation
  }

  private getDayName(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Reset service (clear all data and permissions)
   */
  async reset(): Promise<void> {
    console.log('🔄 Resetting DigitalWellbeingService...');
    this.processedData = null;
    this.permissionStatus = {
      granted: false,
      canRequestAgain: true,
    };
    await AsyncStorage.removeItem('screentime_permission');
    console.log('✅ Service reset complete');
  }
}

// Export singleton instance
export const digitalWellbeingService = new DigitalWellbeingService();
export default digitalWellbeingService;