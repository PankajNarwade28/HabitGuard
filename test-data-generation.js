// Quick test to demonstrate the enhanced data generation
// Run with: node test-data-generation.js

console.log('🛡️ HabitGuard - Testing Enhanced Data Generation');
console.log('================================================');

// Simulate the enhanced data generation
function generateRealisticUsageData() {
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  
  // Generate realistic usage based on day type
  const baseUsage = isWeekend ? 8.2 : 6.5; // Higher on weekends
  const variance = (Math.random() - 0.5) * 2; // ±1 hour variance
  const todayUsage = Math.max(3, Number((baseUsage + variance).toFixed(1)));
  
  // Correlate pickups with usage (roughly 20 pickups per hour)
  const todayPickups = Math.floor(todayUsage * 20 + (Math.random() - 0.5) * 30);
  
  // Generate correlated notifications
  const todayNotifications = Math.floor(todayUsage * 15 + Math.random() * 50);

  console.log('📊 Today\'s Usage Data:');
  console.log(`   Screen Time: ${todayUsage} hours`);
  console.log(`   Device Pickups: ${todayPickups}`);
  console.log(`   Notifications: ${todayNotifications}`);
  console.log(`   Day Type: ${isWeekend ? 'Weekend' : 'Weekday'}`);
  
  // Generate app usage distribution
  const apps = [
    { name: 'Instagram', category: 'Social Media', weight: 0.18 },
    { name: 'YouTube', category: 'Entertainment', weight: 0.15 },
    { name: 'WhatsApp', category: 'Communication', weight: 0.12 },
    { name: 'Chrome', category: 'Productivity', weight: 0.10 },
    { name: 'TikTok', category: 'Social Media', weight: 0.08 },
  ];

  console.log('\n📱 Top App Usage:');
  const totalMinutes = todayUsage * 60;
  apps.forEach(app => {
    const minutes = Math.floor(totalMinutes * app.weight);
    const hours = (minutes / 60).toFixed(1);
    console.log(`   ${app.name}: ${minutes}min (${hours}h) - ${app.category}`);
  });

  // Generate weekly trend
  console.log('\n📈 Weekly Trend (last 7 days):');
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayIsWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayUsage = dayIsWeekend ? 7.5 + Math.random() : 6.2 + (Math.random() - 0.5);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    console.log(`   ${dayName}: ${dayUsage.toFixed(1)}h`);
  }

  console.log('\n✅ Data generation complete! This simulates what users will see.');
  console.log('🔄 The app now requests permission immediately on startup');
  console.log('📊 Real device data will be processed and cached for fast access');
}

// Run the test
generateRealisticUsageData();