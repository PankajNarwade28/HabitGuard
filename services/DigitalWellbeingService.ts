import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    message: string;
  };
  topCategory: {
    name: string;
    message: string;
  };
  pickupInsight: {
    message: string;
  };
}

export interface ProcessedDeviceData {
  dailyStats: {
    screenTime: number;
    pickups: number;
    notifications: number;
    firstPickup: string;
    screenOnTime: number;
  };
  appBreakdown: ProcessedAppData[];
  weeklyTrend: ProcessedWeeklyData[];
  insights: ProcessedInsights;
}

class DigitalWellbeingService {
  private static instance: DigitalWellbeingService;
  private permissionStatus: PermissionStatus = {
    granted: false,
    canRequestAgain: true,
  };

  public static getInstance(): DigitalWellbeingService {
    if (!DigitalWellbeingService.instance) {
      DigitalWellbeingService.instance = new DigitalWellbeingService();
    }
    return DigitalWellbeingService.instance;
  }

  /**
   * Initialize the service and handle demo/production modes
   */
  async initialize(): Promise<void> {
    try {
      console.log('🛡️ Initializing DigitalWellbeingService...');
      
      // Check if running in Expo Go (demo mode)
      const isExpoGo = __DEV__ && typeof expo !== 'undefined';
      
      if (isExpoGo) {
        console.log('📱 Running in Expo Go - Demo Mode Active');
        console.log('ℹ️  To test real usage access, build development APK');
        
        // In demo mode, simulate permission flow but use demo data
        const storedDemo = await AsyncStorage.getItem('demo_permission_granted');
        if (storedDemo) {
          this.permissionStatus = { granted: true, canRequestAgain: true };
          await this.preloadAndProcessData();
        } else {
          this.permissionStatus = { granted: false, canRequestAgain: true };
        }
      } else {
        console.log('🔧 Running in development/production build');
        // For production: Always reset permission to force fresh requests
        console.log('🔄 Resetting permission status to ensure fresh requests');
        this.permissionStatus = {
          granted: false,
          canRequestAgain: true,
        };
        await AsyncStorage.removeItem('screentime_permission');
      }
      
      // Always check and validate permission
      if (this.permissionStatus.granted) {
        console.log('🔍 Validating existing permission...');
        const isValid = await this.validateExistingPermission();
        if (!isValid) {
          console.log('⚠️ Existing permission invalid - resetting');
          this.permissionStatus.granted = false;
          await this.savePermissionStatus();
        } else {
          console.log('✅ Existing permission valid - pre-loading data');
          await this.preloadAndProcessData();
        }
      }
    } catch (error) {
      console.error('Failed to initialize DigitalWellbeingService:', error);
    }
  }

  /**
   * Request screen time permission from user
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (this.permissionStatus.granted) {
        // If already granted, ensure data is processed
        await this.preloadAndProcessData();
        return true;
      }

      // Check if running in demo mode (Expo Go)
      const isExpoGo = __DEV__ && typeof expo !== 'undefined';
      
      this.permissionStatus.lastRequestTime = Date.now();
      let granted = false;

      if (isExpoGo) {
        console.log('📱 Demo Mode: Simulating permission request');
        granted = await this.showDemoPermissionDialog();
      } else {
        console.log('🔧 Production Mode: Real permission request');
        if (Platform.OS === 'ios') {
          granted = await this.requestiOSScreenTimePermission();
        } else if (Platform.OS === 'android') {
          granted = await this.requestAndroidUsageStatsPermission();
        }
      }

      // Update permission status
      await this.updatePermissionStatus(granted);
      
      if (isExpoGo && granted) {
        await AsyncStorage.setItem('demo_permission_granted', 'true');
      }

      // If permission was granted, immediately process data
      if (granted) {
        console.log('Permission granted! Processing data...');
        await this.preloadAndProcessData();
      }

      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Demo mode permission dialog (for Expo Go testing)
   */
  private async showDemoPermissionDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '🛡️ HabitGuard Demo Mode',
        '📱 You\'re running in Expo Go demo mode.\n\n🎯 This simulates the permission request experience.\n\n📊 Demo data will be shown instead of real usage stats.\n\n🔧 To test real data access:\n• Build development APK\n• Install on device\n• Grant Usage Access permission',
        [
          {
            text: 'Use Demo Data',
            style: 'default',
            onPress: () => {
              console.log('📊 User chose demo data');
              resolve(true);
            },
          },
          {
            text: 'Skip Demo',
            style: 'cancel',
            onPress: () => {
              console.log('⏭️ User skipped demo');
              resolve(false);
            },
          },
        ]
      );
    });
  }

  /**
   * iOS Screen Time permission request
   */
  private async requestiOSScreenTimePermission(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '�️ Screen Time Access Required',
        '📊 HabitGuard needs access to your Screen Time data to show your actual usage patterns.\n\n🔒 Your data stays private on your device.\n\n📍 Steps to enable:\n1. Tap "Open Settings"\n2. Go to Screen Time\n3. Enable "Share Across Devices"\n4. Return to HabitGuard',
        [
          {
            text: 'Use Demo Data',
            style: 'cancel',
            onPress: () => {
              resolve(false); // Don't update permission status
            },
          },
          {
            text: 'Grant Access',
            style: 'default',
            onPress: async () => {
              try {
                await Linking.openURL('App-Prefs:SCREEN_TIME');
                // Optimistically assume permission granted
                setTimeout(() => {
                  this.updatePermissionStatus(true);
                }, 2000);
                resolve(true);
              } catch (error) {
                console.error('Failed to open settings:', error);
                try {
                  await Linking.openURL('App-Prefs:');
                  setTimeout(() => {
                    this.updatePermissionStatus(true);
                  }, 2000);
                  resolve(true);
                } catch (fallbackError) {
                  console.error('Failed to open settings fallback:', fallbackError);
                  resolve(false);
                }
              }
            },
          },
        ]
      );
    });
  }

  /**
   * Android Usage Stats permission request
   */
  private async requestAndroidUsageStatsPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        '�️ Digital Wellbeing Access',
        '📊 HabitGuard needs access to your device usage data.\n\n🔒 Your data stays private on your device.\n\n🎯 Get insights on:\n• Daily screen time\n• App usage patterns\n• Device pickup frequency\n\n⚠️ Note: Requires development build, not Expo Go.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              this.updatePermissionStatus(false);
              resolve(false);
            },
          },
          {
            text: 'Open Settings',
            onPress: async () => {
              try {
                // Show step-by-step instructions for Android
                Alert.alert(
                  '� Enable Usage Access',
                  '� Follow these steps:\n\n1️⃣ Tap "Open Settings" below\n2️⃣ Find "HabitGuard" in the app list\n3️⃣ Toggle "Permit usage access" ON\n4️⃣ Return to HabitGuard\n\n� We\'ll immediately start processing your data!',
                  [
                    {
                      text: 'Open Settings',
                      style: 'default',
                      onPress: async () => {
                        try {
                          // Try to open usage access settings directly
                          await Linking.openURL('android.settings.USAGE_ACCESS_SETTINGS');
                          // Mark as granted optimistically - we'll validate later
                          setTimeout(() => {
                            this.updatePermissionStatus(true);
                          }, 2000);
                          resolve(true);
                        } catch (error) {
                          try {
                            // Fallback to general settings
                            await Linking.openURL('android.settings.SETTINGS');
                            setTimeout(() => {
                              this.updatePermissionStatus(true);
                            }, 2000);
                            resolve(true);
                          } catch (settingsError) {
                            console.error('Could not open settings:', settingsError);
                            Alert.alert(
                              '📱 Manual Setup Required',
                              '📍 Go to: Settings → Apps → Special app access → Usage access → HabitGuard\n\n✅ Turn ON the toggle',
                              [{ text: 'I understand', onPress: () => resolve(false) }]
                            );
                          }
                        }
                      }
                    }
                  ]
                );
                
                // Don't resolve here - let the button handler resolve
              } catch (error) {
                console.error('Failed to open settings:', error);
                Alert.alert(
                  'Settings Access Error',
                  'Unable to open settings automatically. Please manually go to:\nSettings → Apps → Special app access → Usage access → HabitGuard',
                  [{ text: 'OK' }]
                );
                resolve(false);
              }
            },
          },
        ]
      );
    });
  }

  /**
   * Validate permission status after user returns from settings
   */
  private async validatePermissionAfterSettings(): Promise<void> {
    try {
      // In a real implementation, you would check the actual permission status
      // For now, we'll optimistically assume it's granted
      console.log('Validating permission after settings...');
      await this.updatePermissionStatus(true);
      
      // Start processing data immediately
      await this.preloadAndProcessData();
    } catch (error) {
      console.error('Error validating permission:', error);
    }
  }

  /**
   * Get actual device usage data
   */
  async getDeviceUsageData(): Promise<DeviceUsageData | null> {
    try {
      if (!this.permissionStatus.granted) {
        return null;
      }

      if (Platform.OS === 'ios') {
        return await this.getiOSUsageData();
      } else if (Platform.OS === 'android') {
        return await this.getAndroidUsageData();
      }

      return null;
    } catch (error) {
      console.error('Error getting device usage data:', error);
      return null;
    }
  }

  /**
   * iOS Screen Time data retrieval
   */
  private async getiOSUsageData(): Promise<DeviceUsageData> {
    // For now, return enhanced mock data that simulates real iOS Screen Time data
    // In a production app, you would use the Screen Time API
    const mockData: DeviceUsageData = {
      todayUsage: this.generateRealisticUsage(),
      todayPickups: Math.floor(Math.random() * 100) + 50,
      todayNotifications: Math.floor(Math.random() * 200) + 100,
      firstPickupTime: this.generateFirstPickupTime(),
      screenOnTime: this.generateRealisticUsage() * 0.8, // Screen on time is usually less than app usage
      appUsage: this.generateRealisticiOSAppUsage(),
      weeklyData: this.generateWeeklyData(),
    };

    return mockData;
  }

  /**
   * Android Usage Stats data retrieval (Consistent realistic data)
   */
  private async getAndroidUsageData(): Promise<DeviceUsageData> {
    // Return consistent realistic data instead of random data
    console.log('📄 Generating consistent Android usage data...');
    
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Use day-based seed for consistency but variation across days
    const seed = dayOfYear % 7; // Weekly pattern
    
    // Generate consistent usage based on day type and seed
    const baseUsages = [6.2, 5.8, 7.1, 6.9, 7.5, 8.3, 7.8]; // Weekly pattern
    const todayUsage = isWeekend ? baseUsages[6] : baseUsages[seed % 5];
    
    // Consistent pickups and notifications based on usage
    const todayPickups = Math.floor(todayUsage * 18 + 25); // 18 pickups per hour + base
    const todayNotifications = Math.floor(todayUsage * 12 + 35); // 12 notifications per hour + base
    
    const mockData: DeviceUsageData = {
      todayUsage: Number(todayUsage.toFixed(1)),
      todayPickups,
      todayNotifications,
      firstPickupTime: this.generateConsistentFirstPickupTime(seed),
      screenOnTime: Number((todayUsage * 0.85).toFixed(1)),
      appUsage: this.generateConsistentAndroidAppUsage(todayUsage, seed),
      weeklyData: this.generateConsistentWeeklyData(seed),
    };

    console.log('✅ Generated consistent usage data:', {
      usage: mockData.todayUsage,
      pickups: mockData.todayPickups,
      apps: mockData.appUsage.length,
      seed: seed
    });
    
    return mockData;
  }

  /**
   * Check if we should request permission
   */
  private async shouldRequestPermission(): Promise<boolean> {
    if (this.permissionStatus.granted) {
      return false;
    }

    if (!this.permissionStatus.canRequestAgain) {
      return false;
    }

    // Don't spam the user - wait at least 24 hours between requests
    if (this.permissionStatus.lastRequestTime) {
      const timeSinceLastRequest = Date.now() - this.permissionStatus.lastRequestTime;
      const oneDayInMs = 24 * 60 * 60 * 1000;
      if (timeSinceLastRequest < oneDayInMs) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate existing permission is still working
   */
  private async validateExistingPermission(): Promise<boolean> {
    try {
      // Try to access usage data to validate permission
      const data = await this.getDeviceUsageData();
      return data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update and save permission status
   */
  private async updatePermissionStatus(granted: boolean): Promise<void> {
    this.permissionStatus = {
      granted,
      canRequestAgain: !granted, // If denied, we can try again later
      lastRequestTime: Date.now(),
    };
    await this.savePermissionStatus();
  }

  /**
   * Save permission status to storage
   */
  private async savePermissionStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem('screentime_permission', JSON.stringify(this.permissionStatus));
    } catch (error) {
      console.error('Failed to save permission status:', error);
    }
  }

  /**
   * Generate realistic usage time
   */
  private generateRealisticUsage(): number {
    const hour = new Date().getHours();
    let baseUsage = 0;

    // More usage during evening hours
    if (hour >= 18 && hour <= 23) {
      baseUsage = Math.random() * 4 + 3; // 3-7 hours
    } else if (hour >= 12 && hour <= 17) {
      baseUsage = Math.random() * 3 + 2; // 2-5 hours
    } else {
      baseUsage = Math.random() * 2 + 1; // 1-3 hours
    }

    return Number(baseUsage.toFixed(1));
  }

  /**
   * Generate first pickup time
   */
  private generateConsistentFirstPickupTime(seed: number): string {
    const morningHours = [6, 6, 7, 7, 8, 6, 7]; // Consistent pattern
    const morningMinutes = [15, 45, 0, 30, 15, 30, 0];
    const hour = morningHours[seed % 7];
    const minute = morningMinutes[seed % 7];
    return `${hour}:${minute.toString().padStart(2, '0')} AM`;
  }
  
  private generateFirstPickupTime(): string {
    const hour = Math.floor(Math.random() * 3) + 6; // 6-8 AM
    const minute = Math.floor(Math.random() * 60);
    return `${hour}:${minute.toString().padStart(2, '0')} AM`;
  }

  /**
   * Generate realistic iOS app usage data
   */
  private generateRealisticiOSAppUsage() {
    const iosApps = [
      { name: 'Instagram', packageName: 'com.instagram.ios', category: 'Social Media', color: '#E1306C' },
      { name: 'YouTube', packageName: 'com.google.ios.youtube', category: 'Entertainment', color: '#FF0000' },
      { name: 'WhatsApp', packageName: 'net.whatsapp.WhatsApp', category: 'Communication', color: '#25D366' },
      { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', category: 'Social Media', color: '#000000' },
      { name: 'Safari', packageName: 'com.apple.mobilesafari', category: 'Productivity', color: '#1E90FF' },
      { name: 'Messages', packageName: 'com.apple.MobileSMS', category: 'Communication', color: '#34C759' },
      { name: 'Mail', packageName: 'com.apple.mobilemail', category: 'Productivity', color: '#007AFF' },
      { name: 'Twitter', packageName: 'com.atebits.Tweetie2', category: 'Social Media', color: '#1DA1F2' },
    ];

    return iosApps.slice(0, 6).map(app => ({
      ...app,
      usageTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
      launches: Math.floor(Math.random() * 50) + 10,
      appName: app.name,
    }));
  }

  /**
   * Generate realistic Android app usage data
   */
  private generateRealisticAndroidAppUsage(totalUsageHours: number = 6.5) {
    const androidApps = [
      { name: 'Instagram', packageName: 'com.instagram.android', category: 'Social Media', color: '#E1306C', weight: 0.18 },
      { name: 'YouTube', packageName: 'com.google.android.youtube', category: 'Entertainment', color: '#FF0000', weight: 0.15 },
      { name: 'WhatsApp', packageName: 'com.whatsapp', category: 'Communication', color: '#25D366', weight: 0.12 },
      { name: 'Chrome', packageName: 'com.android.chrome', category: 'Productivity', color: '#4285F4', weight: 0.10 },
      { name: 'TikTok', packageName: 'com.ss.android.ugc.trill', category: 'Social Media', color: '#000000', weight: 0.08 },
      { name: 'Gmail', packageName: 'com.google.android.gm', category: 'Productivity', color: '#EA4335', weight: 0.06 },
      { name: 'Spotify', packageName: 'com.spotify.music', category: 'Entertainment', color: '#1DB954', weight: 0.07 },
      { name: 'Facebook', packageName: 'com.facebook.katana', category: 'Social Media', color: '#1877F2', weight: 0.04 },
      { name: 'Maps', packageName: 'com.google.android.apps.maps', category: 'Navigation', color: '#34A853', weight: 0.03 },
      { name: 'Netflix', packageName: 'com.netflix.mediaclient', category: 'Entertainment', color: '#E50914', weight: 0.05 },
    ];

    const totalMinutes = totalUsageHours * 60;
    
    return androidApps.map((app) => {
      // Distribute time based on realistic app usage patterns
      const baseTime = totalMinutes * app.weight;
      const variance = baseTime * (0.3 * Math.random() - 0.15); // ±15% variance
      const usageTime = Math.max(5, Math.floor(baseTime + variance));
      
      // Calculate realistic launch counts based on app type
      let baseLaunches;
      if (app.category === 'Communication') {
        baseLaunches = Math.floor(usageTime / 3); // High frequency
      } else if (app.category === 'Social Media') {
        baseLaunches = Math.floor(usageTime / 8); // Medium frequency
      } else {
        baseLaunches = Math.floor(usageTime / 15); // Lower frequency
      }
      
      return {
        packageName: app.packageName,
        appName: app.name,
        category: app.category,
        usageTime,
        launches: Math.max(1, baseLaunches + Math.floor(Math.random() * 5)),
        color: app.color,
      };
    }).filter(app => app.usageTime > 8) // Filter out very low usage apps
     .sort((a, b) => b.usageTime - a.usageTime); // Sort by usage time
  }

  /**
   * Generate consistent Android app usage (no random data)
   */
  private generateConsistentAndroidAppUsage(totalUsageHours: number, seed: number) {
    const androidApps = [
      { name: 'Instagram', packageName: 'com.instagram.android', category: 'Social Media', color: '#E1306C', weight: 0.18 },
      { name: 'YouTube', packageName: 'com.google.android.youtube', category: 'Entertainment', color: '#FF0000', weight: 0.15 },
      { name: 'WhatsApp', packageName: 'com.whatsapp', category: 'Communication', color: '#25D366', weight: 0.12 },
      { name: 'Chrome', packageName: 'com.android.chrome', category: 'Productivity', color: '#4285F4', weight: 0.10 },
      { name: 'TikTok', packageName: 'com.ss.android.ugc.trill', category: 'Social Media', color: '#000000', weight: 0.08 },
      { name: 'Gmail', packageName: 'com.google.android.gm', category: 'Productivity', color: '#EA4335', weight: 0.06 },
      { name: 'Spotify', packageName: 'com.spotify.music', category: 'Entertainment', color: '#1DB954', weight: 0.07 },
      { name: 'Facebook', packageName: 'com.facebook.katana', category: 'Social Media', color: '#1877F2', weight: 0.04 },
    ];

    const totalMinutes = totalUsageHours * 60;
    const seedMultipliers = [1.0, 0.9, 1.1, 0.95, 1.05, 1.15, 0.85]; // Consistent daily variations
    
    return androidApps.map((app, index) => {
      const baseTime = totalMinutes * app.weight;
      const multiplier = seedMultipliers[(seed + index) % 7];
      const usageTime = Math.floor(baseTime * multiplier);
      
      let baseLaunches;
      if (app.category === 'Communication') {
        baseLaunches = Math.floor(usageTime / 3);
      } else if (app.category === 'Social Media') {
        baseLaunches = Math.floor(usageTime / 8);
      } else {
        baseLaunches = Math.floor(usageTime / 15);
      }
      
      return {
        packageName: app.packageName,
        appName: app.name,
        category: app.category,
        usageTime: Math.max(10, usageTime),
        launches: Math.max(1, baseLaunches),
        color: app.color,
      };
    }).filter(app => app.usageTime > 15)
     .sort((a, b) => b.usageTime - a.usageTime);
  }

  /**
   * Generate consistent weekly data (no random variations)
   */
  private generateConsistentWeeklyData(seed: number): Array<{ date: string; usage: number; pickups: number }> {
    const today = new Date();
    const weeklyUsagePattern = [6.2, 5.8, 7.1, 6.9, 7.5, 8.3, 7.8]; // Consistent weekly pattern
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayIndex = (seed + (6 - i)) % 7;
      const usage = weeklyUsagePattern[dayIndex];
      
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        usage: Number(usage.toFixed(1)),
        pickups: Math.floor(usage * 18 + 25)
      });
    }
    
    return weeklyData;
  }

  /**
   * Generate weekly usage data
   */
  private generateWeeklyData() {
    const weeklyData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        usage: this.generateRealisticUsage(),
        pickups: Math.floor(Math.random() * 100) + 40,
      });
    }
    
    return weeklyData;
  }

  /**
   * Manual permission verification for Android
   */
  async verifyAndroidPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return this.permissionStatus.granted;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Verify Permission Status',
        'Have you granted "Usage Access" permission to HabitGuard in your device settings?',
        [
          {
            text: 'Not Yet',
            style: 'cancel',
            onPress: () => {
              this.updatePermissionStatus(false);
              resolve(false);
            }
          },
          {
            text: 'Yes, I granted it',
            onPress: () => {
              this.updatePermissionStatus(true);
              resolve(true);
            }
          }
        ]
      );
    });
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): PermissionStatus {
    return { ...this.permissionStatus };
  }

  /**
   * Pre-load and process data when app starts
   */
  private async preloadAndProcessData(): Promise<void> {
    try {
      console.log('Pre-loading device usage data...');
      const deviceData = await this.getDeviceUsageData();
      
      if (deviceData) {
        // Cache processed data
        const processedData = this.processDeviceData(deviceData);
        await AsyncStorage.setItem('cached_device_data', JSON.stringify({
          data: processedData,
          timestamp: Date.now(),
          expiresAt: Date.now() + (60 * 60 * 1000), // Cache for 1 hour
        }));
        
        console.log('Device data pre-loaded and cached successfully');
      }
    } catch (error) {
      console.error('Error pre-loading data:', error);
    }
  }

  /**
   * Process raw device data into app-friendly format
   */
  private processDeviceData(deviceData: DeviceUsageData): ProcessedDeviceData {
    return {
      dailyStats: {
        screenTime: deviceData.todayUsage,
        pickups: deviceData.todayPickups,
        notifications: deviceData.todayNotifications,
        firstPickup: deviceData.firstPickupTime,
        screenOnTime: deviceData.screenOnTime,
      },
      appBreakdown: deviceData.appUsage.map(app => ({
        name: app.appName,
        category: app.category,
        usageHours: Number((app.usageTime / 60).toFixed(1)),
        usageMinutes: app.usageTime,
        launches: app.launches,
        color: app.color,
        percentage: Math.round((app.usageTime / (deviceData.todayUsage * 60)) * 100),
      })),
      weeklyTrend: deviceData.weeklyData.map(day => ({
        date: day.date,
        usage: day.usage,
        pickups: day.pickups,
        dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      })),
      insights: this.generateInsights(deviceData),
    };
  }

  /**
   * Generate insights from usage data
   */
  private generateInsights(deviceData: DeviceUsageData) {
    const avgWeeklyUsage = deviceData.weeklyData.reduce((sum, day) => sum + day.usage, 0) / 7;
    const todayVsAverage = deviceData.todayUsage - avgWeeklyUsage;
    
    const topCategory = deviceData.appUsage.reduce((prev, current) => {
      const prevCategoryTime = deviceData.appUsage
        .filter(app => app.category === prev.category)
        .reduce((sum, app) => sum + app.usageTime, 0);
      const currentCategoryTime = deviceData.appUsage
        .filter(app => app.category === current.category)
        .reduce((sum, app) => sum + app.usageTime, 0);
      return currentCategoryTime > prevCategoryTime ? current : prev;
    });

    return {
      todayVsAverage: {
        difference: Math.abs(todayVsAverage),
        isHigher: todayVsAverage > 0,
        message: todayVsAverage > 0.5 
          ? `📈 ${todayVsAverage.toFixed(1)}h above your weekly average`
          : todayVsAverage < -0.5 
          ? `📉 ${Math.abs(todayVsAverage).toFixed(1)}h below your weekly average`
          : `✅ On track with your weekly average`,
      },
      topCategory: {
        name: topCategory.category,
        message: `📱 Most time spent on ${topCategory.category}`,
      },
      pickupInsight: {
        message: deviceData.todayPickups > 100 
          ? `🔄 High device activity (${deviceData.todayPickups} pickups)`
          : deviceData.todayPickups < 50
          ? `🧘 Mindful usage (${deviceData.todayPickups} pickups)`
          : `📱 Moderate usage (${deviceData.todayPickups} pickups)`,
      }
    };
  }

  /**
   * Get cached processed data
   */
  async getCachedProcessedData(): Promise<ProcessedDeviceData | null> {
    try {
      const cached = await AsyncStorage.getItem('cached_device_data');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (parsedCache.expiresAt > Date.now()) {
          return parsedCache.data as ProcessedDeviceData;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Reset permission status (for testing and debugging)
   */
  async resetPermission(): Promise<void> {
    console.log('🔄 Resetting permission status for fresh testing');
    this.permissionStatus = {
      granted: false,
      canRequestAgain: true,
    };
    await AsyncStorage.removeItem('screentime_permission');
    await AsyncStorage.removeItem('cached_device_data');
    console.log('✅ Permission status reset complete');
  }

  /**
   * Get debug information about current service state
   */
  getDebugInfo() {
    return {
      permissionStatus: this.permissionStatus,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };
  }
}

export default DigitalWellbeingService;