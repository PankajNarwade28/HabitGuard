import React, { useState, useCallback, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import DigitalWellbeingService, { DeviceUsageData, PermissionStatus, ProcessedDeviceData, ProcessedAppData, ProcessedWeeklyData } from '@/services/DigitalWellbeingService';

export interface ScreenTimeData {
  todayUsage: number;
  avgWeeklyUsage: number;
  weeklyTrend: number[];
  topApps: Array<{
    name: string;
    usage: number;
    color: string;
    category: string;
  }>;
  dailyLimit: number;
  sleepSchedule: {
    bedtime: string;
    wakeTime: string;
    enabled: boolean;
  };
}

export interface AppUsageData {
  name: string;
  category: string;
  usage: number; // in minutes
  sessions: number;
  notifications: number;
  lastUsed: Date;
}

export interface SleepData {
  averageSleep: number;
  sleepQuality: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  weeklyPattern: Array<{ day: string; sleep: number; quality: number }>;
  sleepDebt: number; // hours
}

// Mock data - in a real app, this would come from device APIs
const mockData: ScreenTimeData = {
  todayUsage: 6.3,
  avgWeeklyUsage: 7.2,
  weeklyTrend: [5.2, 6.1, 7.3, 8.1, 6.8, 7.5, 6.3],
  topApps: [
    { name: 'Instagram', usage: 2.5, color: '#E1306C', category: 'Social Media' },
    { name: 'YouTube', usage: 1.8, color: '#FF0000', category: 'Entertainment' },
    { name: 'WhatsApp', usage: 1.2, color: '#25D366', category: 'Communication' },
    { name: 'TikTok', usage: 1.0, color: '#000000', category: 'Social Media' },
  ],
  dailyLimit: 6,
  sleepSchedule: {
    bedtime: '10:30 PM',
    wakeTime: '6:30 AM',
    enabled: true,
  },
};

const mockAppsData: AppUsageData[] = [
  {
    name: 'Instagram',
    category: 'Social Media',
    usage: 150, // 2.5 hours
    sessions: 45,
    notifications: 23,
    lastUsed: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    name: 'YouTube',
    category: 'Entertainment',
    usage: 108, // 1.8 hours
    sessions: 12,
    notifications: 5,
    lastUsed: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    name: 'WhatsApp',
    category: 'Communication',
    usage: 72, // 1.2 hours
    sessions: 78,
    notifications: 156,
    lastUsed: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
];

const mockSleepData: SleepData = {
  averageSleep: 6.8,
  sleepQuality: 'Fair',
  weeklyPattern: [
    { day: 'Mon', sleep: 7.2, quality: 75 },
    { day: 'Tue', sleep: 6.5, quality: 65 },
    { day: 'Wed', sleep: 6.8, quality: 70 },
    { day: 'Thu', sleep: 6.2, quality: 60 },
    { day: 'Fri', sleep: 5.9, quality: 55 },
    { day: 'Sat', sleep: 8.1, quality: 85 },
    { day: 'Sun', sleep: 7.5, quality: 80 },
  ],
  sleepDebt: 2.3, // Hours of sleep debt accumulated
};

// Device screen time access functions
const requestScreenTimePermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      // iOS Screen Time API access
      Alert.alert(
        'Screen Time Access',
        'To provide accurate screen time data, please enable Screen Time access for this app in Settings > Screen Time > Share Across Devices.',
        [{ text: 'OK' }]
      );
      return true; // User needs to manually enable in Settings
    } else if (Platform.OS === 'android') {
      // Android Usage Stats API access
      Alert.alert(
        'Usage Access Required',
        'To track your screen time, please grant Usage Access permission in the next screen.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Grant Permission', 
            onPress: () => {
              // In a real app, you would use react-native-usage-stats or similar
              Alert.alert('Permission Required', 'Please enable Usage Access for this app in Android Settings.');
            }
          }
        ]
      );
      return false; // Requires manual permission
    }
    return false;
  } catch (error) {
    console.error('Error requesting screen time permission:', error);
    return false;
  }
};

const getDeviceScreenTime = async (): Promise<ScreenTimeData | null> => {
  try {
    // This would integrate with actual device APIs
    if (Platform.OS === 'ios') {
      // Use iOS Screen Time API (requires special entitlements)
      // For now, return mock data with proper formatting
      return {
        ...mockData,
        todayUsage: Number((Math.random() * 8 + 2).toFixed(1)), // 2-10 hours, 1 decimal
      };
    } else if (Platform.OS === 'android') {
      // Use Android UsageStatsManager API
      // For now, return mock data with proper formatting
      return {
        ...mockData,
        todayUsage: Number((Math.random() * 8 + 2).toFixed(1)), // 2-10 hours, 1 decimal
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting device screen time:', error);
    return null;
  }
};

export function useScreenTimeData() {
  const [data, setData] = useState<ScreenTimeData>(mockData);
  const [deviceData, setDeviceData] = useState<DeviceUsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({ granted: false, canRequestAgain: true });
  const [wellbeingService] = useState(() => DigitalWellbeingService.getInstance());

  // Initialize service and check permissions
  useEffect(() => {
    const initializeService = async () => {
      await wellbeingService.initialize();
      const status = wellbeingService.getPermissionStatus();
      setPermissionStatus(status);
      
      if (status.granted) {
        await refreshData();
      }
    };
    
    initializeService();
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get cached processed data first for faster loading
      let processedData = await wellbeingService.getCachedProcessedData();
      
      if (processedData) {
        // Use processed cached data
        setDeviceData({
          todayUsage: processedData.dailyStats.screenTime,
          todayPickups: processedData.dailyStats.pickups,
          todayNotifications: processedData.dailyStats.notifications,
          firstPickupTime: processedData.dailyStats.firstPickup,
          screenOnTime: processedData.dailyStats.screenOnTime,
          appUsage: processedData.appBreakdown.map((app: ProcessedAppData) => ({
            appName: app.name,
            category: app.category,
            usageTime: app.usageMinutes,
            launches: app.launches,
            color: app.color,
          })),
          weeklyData: processedData.weeklyTrend.map((day: ProcessedWeeklyData) => ({
            date: day.date,
            usage: day.usage,
            pickups: day.pickups,
          })),
        } as DeviceUsageData);
        
        // Convert to our ScreenTimeData format
        const convertedData: ScreenTimeData = {
          todayUsage: processedData.dailyStats.screenTime,
          avgWeeklyUsage: processedData.weeklyTrend.reduce((sum: number, day: ProcessedWeeklyData) => sum + day.usage, 0) / 7,
          weeklyTrend: processedData.weeklyTrend.map((day: ProcessedWeeklyData) => day.usage),
          topApps: processedData.appBreakdown.slice(0, 4).map((app: ProcessedAppData) => ({
            name: app.name,
            usage: app.usageHours,
            color: app.color,
            category: app.category,
          })),
          dailyLimit: data.dailyLimit, // Keep user's set limit
          sleepSchedule: data.sleepSchedule, // Keep user's sleep schedule
        };
        
        setData(convertedData);
      } else {
        // If no cached data, try to get fresh device data
        const realDeviceData = await wellbeingService.getDeviceUsageData();
        
        if (realDeviceData) {
          setDeviceData(realDeviceData);
          
          // Convert device data to our ScreenTimeData format
          const convertedData: ScreenTimeData = {
            todayUsage: realDeviceData.todayUsage,
            avgWeeklyUsage: realDeviceData.weeklyData.reduce((sum, day) => sum + day.usage, 0) / 7,
            weeklyTrend: realDeviceData.weeklyData.map(day => day.usage),
            topApps: realDeviceData.appUsage.slice(0, 4).map(app => ({
              name: app.appName,
              usage: Number((app.usageTime / 60).toFixed(1)), // Convert minutes to hours
              color: app.color,
              category: app.category,
            })),
            dailyLimit: data.dailyLimit, // Keep user's set limit
            sleepSchedule: data.sleepSchedule, // Keep user's sleep schedule
          };
          
          setData(convertedData);
        } else {
          // Fallback to mock data if no permission or device data unavailable
          setData(prev => ({
            ...prev,
            todayUsage: mockData.todayUsage + (Math.random() - 0.5) * 0.5,
            weeklyTrend: mockData.weeklyTrend.map(usage => usage + (Math.random() - 0.5) * 0.3),
          }));
        }
      }
    } catch (err) {
      setError('Failed to fetch screen time data');
      console.error('Error fetching screen time data:', err);
    } finally {
      setLoading(false);
    }
  }, [wellbeingService, data.dailyLimit, data.sleepSchedule]);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    try {
      const granted = await wellbeingService.requestPermission();
      const status = wellbeingService.getPermissionStatus();
      setPermissionStatus(status);
      
      if (granted) {
        await refreshData();
      }
    } catch (err) {
      setError('Failed to request permission');
      console.error('Error requesting permission:', err);
    } finally {
      setLoading(false);
    }
  }, [wellbeingService, refreshData]);

  const updateDailyLimit = useCallback((newLimit: number) => {
    setData(prev => ({
      ...prev,
      dailyLimit: newLimit,
    }));
  }, []);

  const updateSleepSchedule = useCallback((newSchedule: Partial<ScreenTimeData['sleepSchedule']>) => {
    setData(prev => ({
      ...prev,
      sleepSchedule: {
        ...prev.sleepSchedule,
        ...newSchedule,
      },
    }));
  }, []);

  return {
    data,
    deviceData,
    loading,
    error,
    permissionStatus,
    hasPermission: permissionStatus.granted,
    refreshData,
    requestPermission,
    updateDailyLimit,
    updateSleepSchedule,
  };
}

export function useAppUsageData() {
  const [apps, setApps] = useState<AppUsageData[]>(mockAppsData);
  const [loading, setLoading] = useState(false);

  const getAppsByCategory = useCallback((category: string) => {
    return apps.filter(app => app.category === category);
  }, [apps]);

  const getTotalUsageByCategory = useCallback(() => {
    const categories = apps.reduce((acc, app) => {
      if (!acc[app.category]) {
        acc[app.category] = { usage: 0, apps: 0 };
      }
      acc[app.category].usage += app.usage;
      acc[app.category].apps += 1;
      return acc;
    }, {} as Record<string, { usage: number; apps: number }>);

    return Object.entries(categories).map(([category, data]) => ({
      category,
      usage: data.usage,
      apps: data.apps,
      percentage: Math.round((data.usage / apps.reduce((sum, app) => sum + app.usage, 0)) * 100),
    }));
  }, [apps]);

  const getMostUsedApps = useCallback((limit = 5) => {
    return [...apps]
      .sort((a, b) => b.usage - a.usage)
      .slice(0, limit);
  }, [apps]);

  return {
    apps,
    loading,
    getAppsByCategory,
    getTotalUsageByCategory,
    getMostUsedApps,
  };
}

export function useSleepData() {
  const [sleepData, setSleepData] = useState<SleepData>(mockSleepData);
  const [loading, setLoading] = useState(false);

  const getSleepTrend = useCallback(() => {
    const recentWeek = sleepData.weeklyPattern.slice(-7);
    const previousWeek = sleepData.weeklyPattern.slice(-14, -7);
    
    if (previousWeek.length === 0) return 0;
    
    const recentAvg = recentWeek.reduce((sum, day) => sum + day.sleep, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, day) => sum + day.sleep, 0) / previousWeek.length;
    
    return recentAvg - previousAvg;
  }, [sleepData]);

  const getSleepQualityScore = useCallback(() => {
    const scores = sleepData.weeklyPattern.map(day => day.quality);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [sleepData]);

  const getOptimalBedtime = useCallback((targetSleepHours = 8, wakeTime = '6:30 AM') => {
    const [time, period] = wakeTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let wakeHours = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours;
    
    let bedtimeHours = wakeHours - targetSleepHours;
    if (bedtimeHours < 0) bedtimeHours += 24;
    
    const bedtimePeriod = bedtimeHours >= 12 ? 'PM' : 'AM';
    const displayHours = bedtimeHours > 12 ? bedtimeHours - 12 : bedtimeHours === 0 ? 12 : bedtimeHours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${bedtimePeriod}`;
  }, []);

  return {
    sleepData,
    loading,
    getSleepTrend,
    getSleepQualityScore,
    getOptimalBedtime,
  };
}

// Utility functions
export const formatUsageTime = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const formatUsageNumber = (hours: number) => {
  // Format number for display (max 1 decimal place)
  return Number(hours.toFixed(1));
};

export const getUsageColor = (usage: number, limit: number) => {
  const percentage = (usage / limit) * 100;
  if (percentage >= 100) return '#F44336'; // Red
  if (percentage >= 80) return '#FF9800'; // Orange
  if (percentage >= 60) return '#FFC107'; // Amber
  return '#4CAF50'; // Green
};

export const calculateSleepDebt = (actualSleep: number[], targetSleep = 8) => {
  return actualSleep.reduce((debt, sleep) => {
    return debt + Math.max(0, targetSleep - sleep);
  }, 0);
};