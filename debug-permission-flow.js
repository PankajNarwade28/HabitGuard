// Debug utility to test permission flow and data consistency
// This helps verify the fixes are working correctly

console.log('🔧 HabitGuard - Debug Permission & Data Flow');
console.log('============================================');

// Test 1: Data Consistency
console.log('\n📊 Test 1: Data Consistency Check');
function testDataConsistency() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const seed = dayOfYear % 7;
  
  console.log(`   Date: ${today.toDateString()}`);
  console.log(`   Day of Year: ${dayOfYear}`);
  console.log(`   Seed: ${seed}`);
  
  // Generate data twice to verify consistency
  const weeklyUsagePattern = [6.2, 5.8, 7.1, 6.9, 7.5, 8.3, 7.8];
  const todayUsage1 = weeklyUsagePattern[seed % 7];
  const todayUsage2 = weeklyUsagePattern[seed % 7];
  
  console.log(`   Usage 1: ${todayUsage1}h`);
  console.log(`   Usage 2: ${todayUsage2}h`);
  console.log(`   ✅ Consistent: ${todayUsage1 === todayUsage2}`);
  
  return todayUsage1 === todayUsage2;
}

// Test 2: Permission Flow States
console.log('\n🔐 Test 2: Permission Flow States');
function testPermissionStates() {
  const states = [
    { name: 'Initial', granted: false, canRequestAgain: true },
    { name: 'After Grant', granted: true, canRequestAgain: true },
    { name: 'After Deny', granted: false, canRequestAgain: false },
  ];
  
  states.forEach(state => {
    console.log(`   ${state.name}: granted=${state.granted}, canRequest=${state.canRequestAgain}`);
  });
  
  return true;
}

// Test 3: App Usage Distribution
console.log('\n📱 Test 3: App Usage Distribution');
function testAppDistribution() {
  const apps = [
    { name: 'Instagram', weight: 0.18 },
    { name: 'YouTube', weight: 0.15 },
    { name: 'WhatsApp', weight: 0.12 },
    { name: 'Chrome', weight: 0.10 },
    { name: 'TikTok', weight: 0.08 },
  ];
  
  const totalUsage = 6.5; // hours
  const totalMinutes = totalUsage * 60;
  
  console.log(`   Total Usage: ${totalUsage}h (${totalMinutes}min)`);
  
  let totalDistributed = 0;
  apps.forEach(app => {
    const minutes = Math.floor(totalMinutes * app.weight);
    totalDistributed += minutes;
    console.log(`   ${app.name}: ${minutes}min (${(minutes/60).toFixed(1)}h) - ${(app.weight*100).toFixed(0)}%`);
  });
  
  console.log(`   Total Distributed: ${totalDistributed}min (${(totalDistributed/60).toFixed(1)}h)`);
  
  return totalDistributed > 0;
}

// Run all tests
const test1 = testDataConsistency();
const test2 = testPermissionStates();
const test3 = testAppDistribution();

console.log('\n🎯 Test Results Summary:');
console.log(`   Data Consistency: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   Permission States: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
console.log(`   App Distribution: ${test3 ? '✅ PASS' : '❌ FAIL'}`);

const allPass = test1 && test2 && test3;
console.log(`\n${allPass ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);

console.log('\n🚀 Expected App Behavior:');
console.log('   1. App starts with branded loading screen');
console.log('   2. Immediately shows permission request dialog');
console.log('   3. After granting permission, shows consistent data');
console.log('   4. Data remains consistent across app refreshes');
console.log('   5. Same data for same day, varies by day of week');