# How to Check Today's Data Duration & Apps

## 🎯 **Quick Methods to See Data Details**

### **Method 1: Console Debug (Recommended)**
Add this to any component or call from console:

```typescript
import { usageStatsService } from '../services/UsageStatsService';

// Show detailed breakdown of today's data
const breakdown = await usageStatsService.showTodayDataBreakdown();
console.log('Today\'s data:', breakdown);
```

### **Method 2: From React Component**
```typescript
const showDataBreakdown = async () => {
  try {
    const breakdown = await usageStatsService.showTodayDataBreakdown();
    if (breakdown) {
      Alert.alert(
        'Today\'s Data Range',
        `Time: ${breakdown.timeRange.start} to ${breakdown.timeRange.end}\n` +
        `Duration: ${breakdown.timeRange.duration}\n` +
        `Apps: ${breakdown.filteredApps}\n` +
        `Screen Time: ${breakdown.totalScreenTime}`,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error showing breakdown:', error);
  }
};
```

### **Method 3: Terminal Test**
Run the test script:
```bash
node test-today-data.js
```

## 📊 **What You'll See**

The breakdown will show:

### **Time Range**
```
🕐 TIME RANGE BEING USED:
   Start: 10/2/2025, 12:00:00 AM (1727827200000ms)
   End: 10/2/2025, 2:07:00 PM (1727877420000ms)
   Duration: 14h 7m
```

### **App Details**
```
📱 com.instagram.android:
   Time: 1h 46m (6360000ms)
   Last used: 10/2/2025, 2:05:00 PM
   Used today: true
   System app: false
   Include: true
```

### **Top Apps List**
```
🏆 TOP 10 APPS FOR TODAY:
   1. Instagram
      Duration: 1h 46m
      Percentage: 45.2%
      Package: com.instagram.android
      Last active: 10/2/2025, 2:05:00 PM

   2. Chrome
      Duration: 15m
      Percentage: 10.8%
      Package: com.android.chrome
      Last active: 10/2/2025, 1:30:00 PM
```

### **Summary**
```
📊 TOTAL SCREEN TIME TODAY: 3h 3m
⏱️  Time period: 10/2/2025, 12:00:00 AM to 10/2/2025, 2:07:00 PM
📅 Date: Wed Oct 02 2025
```

## 🔍 **Key Information Shown**

1. **Exact Time Range**: Shows from midnight to current time
2. **Raw vs Filtered Data**: How many apps before/after filtering
3. **Individual App Breakdown**: Time, last used, inclusion logic
4. **Percentage Distribution**: How much each app contributes
5. **System App Filtering**: What gets excluded and why

## 🧪 **Testing Steps**

1. **Call the method**: `usageStatsService.showTodayDataBreakdown()`
2. **Check console logs**: Look for detailed breakdown
3. **Compare with system**: Match against Android settings
4. **Verify time range**: Ensure it's midnight to now
5. **Check app filtering**: See what's included/excluded

This will show you exactly what duration (midnight to current time) and which apps are being used to display today's usage data! 📱