/**
 * Quick test script to debug usage access permission
 * Add this to your app temporarily to test permission status
 */

import { usageStatsService } from './services/UsageStatsService';

export const debugUsageAccess = async () => {
  console.log('=== HabitGuard Usage Access Debug ===');
  
  try {
    // Test 1: Check permission
    console.log('1. Checking usage access permission...');
    const hasPermission = await usageStatsService.checkUsageAccessPermission();
    console.log('Permission result:', hasPermission);
    
    // Test 2: Get usage data
    console.log('2. Getting daily usage stats...');
    const dailyStats = await usageStatsService.getDailyUsageStats();
    console.log('Daily stats:', {
      totalTime: usageStatsService.formatTime(dailyStats.totalTime),
      appCount: dailyStats.appCount,
      topApp: dailyStats.topApps?.[0]?.name || 'None'
    });
    
    // Test 3: Get usage status
    console.log('3. Getting ML usage status...');
    const status = await usageStatsService.getUsageStatus();
    console.log('Usage status:', status);
    
    console.log('=== Debug Complete ===');
    
    return {
      hasPermission,
      isWorking: dailyStats.topApps?.length > 0,
      dataSource: dailyStats.topApps?.[0]?.name?.includes('Instagram') ? 'mock' : 'unknown'
    };
    
  } catch (error) {
    console.error('Debug error:', error);
    return {
      hasPermission: false,
      isWorking: false,
      error: error.message
    };
  }
};

// Usage: Call this function from your component to debug
// Example: debugUsageAccess().then(result => console.log('Debug result:', result));