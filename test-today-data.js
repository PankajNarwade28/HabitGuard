/**
 * Test script to show today's data breakdown
 * Run this to see exactly what duration and apps are being displayed
 */

// Import the service
const { usageStatsService } = require('./services/UsageStatsService');

async function testTodayData() {
  console.log('🧪 TESTING TODAY\'S DATA BREAKDOWN');
  console.log('=====================================');
  
  try {
    // Show detailed breakdown
    console.log('\n1. 📊 DETAILED DATA BREAKDOWN:');
    const breakdown = await usageStatsService.showTodayDataBreakdown();
    
    console.log('\n2. 🔍 REGULAR APP DATA:');
    const todayData = await usageStatsService.getDailyUsageStats();
    
    console.log('\n📋 SUMMARY:');
    if (breakdown) {
      console.log(`⏱️  Time Range: ${breakdown.timeRange.start} to ${breakdown.timeRange.end}`);
      console.log(`📊 Total Apps Found: ${breakdown.totalApps}`);
      console.log(`✅ Apps After Filtering: ${breakdown.filteredApps}`);
      console.log(`🕐 Total Screen Time: ${breakdown.totalScreenTime}`);
      
      console.log('\n🏆 TOP APPS:');
      breakdown.topApps.slice(0, 5).forEach((app, i) => {
        console.log(`   ${i + 1}. ${app.name}: ${app.duration}`);
      });
    }
    
    if (todayData) {
      console.log(`\n📱 App Service Reports:`);
      console.log(`   Total Time: ${usageStatsService.formatTime(todayData.totalTime)}`);
      console.log(`   App Count: ${todayData.appCount}`);
      console.log(`   Status: ${todayData.status}`);
      
      if (todayData.topApps && todayData.topApps.length > 0) {
        console.log('\n   Top Apps from Service:');
        todayData.topApps.slice(0, 5).forEach((app, i) => {
          console.log(`     ${i + 1}. ${app.name}: ${usageStatsService.formatTime(app.timeSpent)}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing today\'s data:', error);
  }
}

// Export for use in React Native
module.exports = { testTodayData };

// Run if called directly
if (require.main === module) {
  testTodayData();
}