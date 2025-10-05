/**
 * Comprehensive test script for usage data and weekly data issues
 * For India/Mumbai timezone debugging
 */

import { usageStatsService } from './services/UsageStatsService';

export async function debugUsageDataFlow() {
  console.log('🧪 ===== COMPREHENSIVE USAGE DATA DEBUG =====');
  console.log('🇮🇳 Testing for India/Mumbai region (IST timezone)');
  console.log('📅 Current date: October 3, 2025\n');

  try {
    // 1. Check current timezone handling
    console.log('1️⃣ TIMEZONE ANALYSIS:');
    console.log('------------------------');
    usageStatsService.debugTimezone();

    // 2. Test today's data breakdown
    console.log('\n2️⃣ TODAY\'S DATA BREAKDOWN:');
    console.log('------------------------');
    const todayBreakdown = await usageStatsService.showTodayDataBreakdown();
    if (todayBreakdown) {
      console.log('✅ Today\'s data retrieved successfully');
    } else {
      console.log('❌ Failed to get today\'s data');
    }

    // 3. Test raw weekly data
    console.log('\n3️⃣ RAW WEEKLY DATA ANALYSIS:');
    console.log('------------------------');
    await usageStatsService.debugRawWeeklyData();

    // 4. Test weekly calculation step by step
    console.log('\n4️⃣ WEEKLY CALCULATION DEBUG:');
    console.log('------------------------');
    const weeklyDebug = await usageStatsService.debugWeeklyDataCalculation();
    if (weeklyDebug) {
      console.log('✅ Weekly data calculation completed');
    } else {
      console.log('❌ Weekly data calculation failed');
    }

    // 5. Test regular API calls
    console.log('\n5️⃣ REGULAR API TESTS:');
    console.log('------------------------');
    
    console.log('📊 Testing getDailyUsageStats()...');
    const dailyData = await usageStatsService.getDailyUsageStats();
    console.log('Daily result:', {
      totalTime: usageStatsService.formatTime(dailyData.totalTime || 0),
      appCount: dailyData.appCount || 0,
      status: dailyData.status,
      topApp: dailyData.topApps?.[0]?.name || 'None'
    });

    console.log('\n📈 Testing getWeeklyUsageStats()...');
    const weeklyData = await usageStatsService.getWeeklyUsageStats();
    console.log('Weekly result:', {
      totalTime: usageStatsService.formatTime(weeklyData.totalTime || 0),
      averageTime: usageStatsService.formatTime(weeklyData.averageTime || 0),
      daysWithData: weeklyData.daysWithData || 0,
      status: weeklyData.status,
      topApp: weeklyData.topApp || 'None'
    });

    // 6. Permission and API status
    console.log('\n6️⃣ PERMISSION & API STATUS:');
    console.log('------------------------');
    await usageStatsService.debugUsageStatsAPI();

    // 7. Summary and recommendations
    console.log('\n7️⃣ SUMMARY & RECOMMENDATIONS:');
    console.log('========================');
    
    const hasData = dailyData && dailyData.totalTime > 0;
    const hasWeeklyData = weeklyData && weeklyData.totalTime > 0;
    
    if (hasData && hasWeeklyData) {
      console.log('✅ SUCCESS: Both daily and weekly data are working');
      console.log('📊 Data appears to be fetching correctly for IST timezone');
    } else if (hasData && !hasWeeklyData) {
      console.log('⚠️ PARTIAL: Daily data works but weekly data has issues');
      console.log('🔍 Check weekly calculation logic and day boundaries');
    } else if (!hasData && !hasWeeklyData) {
      console.log('❌ CRITICAL: No data is being fetched');
      console.log('🔐 Check permissions and Android API access');
    } else {
      console.log('❓ UNUSUAL: Weekly data works but daily data doesn\'t');
      console.log('🔍 Check today\'s date handling and IST calculations');
    }

    console.log('\n🎯 NEXT STEPS:');
    if (!hasData) {
      console.log('1. Ensure Usage Access permission is granted');
      console.log('2. Check if react-native-usage-stats library is working');
      console.log('3. Verify Android API level compatibility');
    } else {
      console.log('1. Compare times with Android Settings > Digital Wellbeing');
      console.log('2. Verify IST timezone calculations are correct');
      console.log('3. Check if week boundaries align with expected dates');
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

// Export individual test functions
export const testFunctions = {
  debugTimezone: () => usageStatsService.debugTimezone(),
  testTodayData: () => usageStatsService.showTodayDataBreakdown(),
  testWeeklyRaw: () => usageStatsService.debugRawWeeklyData(),
  testWeeklyCalculation: () => usageStatsService.debugWeeklyDataCalculation(),
  testPermissions: () => usageStatsService.debugUsageStatsAPI(),
  
  // Quick comparison test
  compareWithSystem: async () => {
    console.log('📱 SYSTEM COMPARISON TEST:');
    console.log('Please compare these results with Android Settings > Digital Wellbeing:');
    
    const today = await usageStatsService.getDailyUsageStats();
    if (today && today.topApps) {
      console.log('\n🏆 Top Apps (Your App):');
      today.topApps.slice(0, 5).forEach((app: any, i: number) => {
        console.log(`   ${i + 1}. ${app.name}: ${usageStatsService.formatTime(app.timeSpent)}`);
      });
      console.log(`\n📊 Total Screen Time: ${usageStatsService.formatTime(today.totalTime)}`);
    }
  }
};

// Usage example:
// debugUsageDataFlow() - Full comprehensive test
// testFunctions.compareWithSystem() - Quick comparison with system
// testFunctions.debugTimezone() - Just timezone debugging