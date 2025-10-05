# 🔍 Debug Guide for India/Mumbai Usage Data Issues

## 🚨 **Problem**: App not showing correct information for today and weekly data in Mumbai region

## 🛠️ **Available Debug Tools**

### **1. Quick Debug Commands**

#### **Check Timezone Issues**
```typescript
// In your component or console
usageStatsService.debugTimezone()
```

#### **See Today's Data Range**
```typescript
// Shows exact time range being used for "today"
const breakdown = await usageStatsService.showTodayDataBreakdown()
console.log('Today\'s range:', breakdown)
```

#### **Debug Weekly Data Step-by-Step**
```typescript
// Shows how each day of the week is calculated
const weeklyDebug = await usageStatsService.debugWeeklyDataCalculation()
console.log('Weekly analysis:', weeklyDebug)
```

#### **Check Raw Android Data**
```typescript
// Shows raw data from Android vs processed data
await usageStatsService.debugRawWeeklyData()
```

### **2. Comprehensive Test**
```typescript
// Import and run full test suite
import { debugUsageDataFlow } from './debug-usage-flow'
await debugUsageDataFlow()
```

### **3. Quick System Comparison**
```typescript
import { testFunctions } from './debug-usage-flow'
await testFunctions.compareWithSystem()
```

## 📊 **What to Look For**

### **Timezone Issues**
- ✅ **Correct**: IST time should match Mumbai time (UTC+5:30)
- ❌ **Wrong**: Time shows 5.5 hours difference from expected

### **Today's Data Range**
- ✅ **Correct**: Should be "12:00 AM IST today" to "current IST time"
- ❌ **Wrong**: Shows UTC midnight or wrong day boundaries

### **Weekly Data**
- ✅ **Correct**: Monday-Sunday in IST, proper day calculation
- ❌ **Wrong**: Week starts on wrong day or shows future/past days incorrectly

## 🎯 **Expected vs Actual**

### **For Mumbai (Oct 3, 2025)**

#### **Today's Data Should Show:**
```
🕐 TIME RANGE: 
   Start: Oct 3, 2025 12:00:00 AM IST
   End: Oct 3, 2025 [current time] IST
   Duration: [hours since midnight]
```

#### **Weekly Data Should Show:**
```
📅 WEEK RANGE:
   Monday Sept 30 - Sunday Oct 6, 2025 (IST)
   Current day: Thursday (Oct 3)
   Days with data: Mon, Tue, Wed, Thu
   Future days: Fri, Sat, Sun (should show 0)
```

## 🔧 **Common Issues & Fixes**

### **Issue 1: Wrong Time Zone**
**Symptoms**: Data shows for wrong day or time
**Debug**: `usageStatsService.debugTimezone()`
**Look for**: IST vs UTC time difference

### **Issue 2: No Data Showing**
**Symptoms**: 0 screen time, no apps
**Debug**: `usageStatsService.debugUsageStatsAPI()`
**Look for**: Permission errors, API failures

### **Issue 3: Weekly Data Wrong**
**Symptoms**: Wrong week range, missing days
**Debug**: `usageStatsService.debugWeeklyDataCalculation()`
**Look for**: Week boundary calculations, day filtering

### **Issue 4: Data Doesn't Match System**
**Symptoms**: App shows different times than Android settings
**Debug**: `testFunctions.compareWithSystem()`
**Look for**: Time range differences, app filtering issues

## 🚀 **Step-by-Step Debugging**

### **Step 1: Run Quick Check**
```typescript
// Add this to any component
const quickDebug = async () => {
  console.log('=== QUICK DEBUG ===')
  
  // Check timezone
  usageStatsService.debugTimezone()
  
  // Check today's data
  const today = await usageStatsService.getDailyUsageStats()
  console.log('Today:', {
    time: usageStatsService.formatTime(today.totalTime || 0),
    apps: today.appCount || 0,
    status: today.status
  })
  
  // Check weekly data
  const weekly = await usageStatsService.getWeeklyUsageStats()
  console.log('Weekly:', {
    time: usageStatsService.formatTime(weekly.totalTime || 0),
    days: weekly.daysWithData || 0,
    status: weekly.status
  })
}
```

### **Step 2: Compare with Android System**
1. Open **Android Settings** > **Digital Wellbeing & Parental Controls**
2. Check **today's screen time** and **top apps**
3. Compare with your app's display
4. Note any differences in times or apps

### **Step 3: Run Full Debug**
```typescript
import { debugUsageDataFlow } from './debug-usage-flow'
await debugUsageDataFlow()
```

### **Step 4: Analyze Results**
Look for these patterns in console logs:
- **Permission issues**: "Permission granted: false"
- **Timezone problems**: Wrong IST calculations  
- **Data range issues**: Wrong date boundaries
- **API failures**: Query errors or no data returned

## 📝 **Expected Console Output**

### **Working Correctly:**
```
✅ Permission granted: true
🇮🇳 IST Time: Oct 3, 2025 [correct time]
📊 Raw data found: [number] apps
📱 Top Apps: Instagram, Chrome, etc.
📈 Weekly data: 4/7 days with data
```

### **Common Issues:**
```
❌ Permission granted: false
🕐 Time difference: 5.5 hours (timezone issue)  
📊 Raw data found: 0 apps (no data)
📅 Days since Monday: wrong calculation
```

Run these debugging tools and share the console output to identify exactly what's causing the incorrect data display for Mumbai timezone! 🇮🇳