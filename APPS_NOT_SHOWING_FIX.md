# 🔍 Apps Not Displaying - Complete Fix Guide

## Problem
Apps were not showing in:
- ❌ Home page (top 3 apps)
- ❌ Analytics page (top 5 apps chart)
- ❌ Analytics page (all apps list)

---

## ✅ All Fixes Applied

### 1. **Field Name Mismatches (v1 → v2 API)**

All UI components have been updated to use the correct v2 API field names:

#### Home Page (`app/(tabs)/index.tsx`)
```tsx
// ✅ FIXED
totalScreenTime  // was totalTime
appUsage        // was topApps
appUsage.length // was appCount
app.appName     // was app.name
app.totalTimeInForeground // was app.timeSpent
```

#### Analytics Page (`app/(tabs)/analytics.tsx`)
```tsx
// ✅ FIXED
dailyData.appUsage // was dailyData.topApps
app.totalTimeInForeground // was app.timeSpent
app.appName // was app.name
weeklyData.weeklyTotal // was weeklyData.totalTime
```

#### Progress Page (`app/(tabs)/progress.tsx`)
```tsx
// ✅ FIXED
dailyUsage.totalScreenTime // was dailyUsage.totalTime
```

---

### 2. **Missing Weekly Stats Fields**

Added calculated fields to `WeeklyUsageStats`:

```typescript
export interface WeeklyUsageStats {
    weeklyTotal: number;
    dailyBreakdown: DailyUsageStats[];
    topApps: AppUsageData[];
    daysWithData?: number;      // ✅ NEW
    averageTime?: number;        // ✅ NEW
    topApp?: string;             // ✅ NEW
}
```

**Service now calculates:**
- `daysWithData`: Count of days with actual usage data
- `averageTime`: Weekly total ÷ days with data
- `topApp`: Name of the most used app

---

## 🎯 What Should Work Now

### Home Page
```
✅ Total screen time displays
✅ App count displays  
✅ Top 3 apps list shows:
   - App icon
   - App name
   - Usage time
```

### Analytics Page
```
✅ Top 5 apps vertical bar chart displays with:
   - Color-coded bars (green/amber/red)
   - Usage time labels
   - App names and icons
   - Interactive tooltips

✅ All apps list displays with:
   - App icons
   - App names
   - Usage times
   - Status badges (Healthy/Medium/High)

✅ Weekly insights show:
   - Total weekly time
   - Days with data
   - Most used app
   - Daily average
```

### Progress Page
```
✅ Daily goal progress displays
✅ Today's usage calculated correctly
✅ Weekly bar chart shows usage
```

---

## 🔧 Debugging Steps

If apps still don't show, check these in order:

### 1. **Check Permissions**
```typescript
// Run in console
const permission = await usageStatsService.checkUsageAccessPermission();
console.log('Permission:', permission); // Should be true
```

### 2. **Check Raw Data**
```typescript
// Run in console
const dailyStats = await usageStatsService.getDailyUsageStats();
console.log('Status:', dailyStats.status);  // Should be 'success' or 'fallback'
console.log('Apps:', dailyStats.appUsage);   // Should be an array
console.log('Count:', dailyStats.appUsage?.length); // Should be > 0
```

### 3. **Check Data Structure**
```typescript
// Expected structure:
{
  totalScreenTime: 1234567,  // milliseconds
  appUsage: [
    {
      packageName: "com.instagram.android",
      appName: "Instagram",
      totalTimeInForeground: 123456,
      lastTimeUsed: 1728123456789,
      icon: { type: "ionicon", name: "logo-instagram", color: "#E4405F" }
    },
    // ... more apps
  ],
  date: "2025-10-06",
  hourlyBreakdown: [0, 0, ..., 1234], // 24 elements
  status: "success"
}
```

### 4. **Check for Errors**
```typescript
// Look for console errors:
// ❌ "Cannot read property 'topApps' of undefined" → Field name issue
// ❌ "Cannot read property 'name' of undefined" → Should use 'appName'
// ❌ "Cannot read property 'timeSpent' of undefined" → Should use 'totalTimeInForeground'
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "No data" message shows
**Cause:** Status is not 'success' or 'fallback'  
**Solution:** Check permissions and run debug diagnostics

### Issue 2: Apps array is empty
**Cause:** All apps filtered out (< 1 min usage or system apps)  
**Solution:** Use phone for a few minutes and refresh

### Issue 3: App names show as package names
**Cause:** `getReadableAppName()` doesn't have mapping  
**Solution:** Add app to the name mapping in the service

### Issue 4: Icons don't show
**Cause:** `getAppIcon()` doesn't have icon mapping  
**Solution:** Add app to the icon mapping in the service

### Issue 5: Weekly insights show "N/A"
**Cause:** No data for the week or missing calculated fields  
**Solution:** Service now calculates all fields automatically

---

## 📊 Data Flow

```
1. User opens Home/Analytics page
   ↓
2. Component calls usageStatsService.getDailyUsageStats()
   ↓
3. Service checks permission
   ↓
4. Service fetches raw Android events/stats
   ↓
5. Service processes events → filters system apps → calculates times
   ↓
6. Service returns DailyUsageStats with:
   - totalScreenTime ✅
   - appUsage array ✅
   - date ✅
   - hourlyBreakdown ✅
   - status ✅
   ↓
7. Component receives data
   ↓
8. Component maps appUsage array → displays apps
```

---

## 🧪 Testing Checklist

Run through this checklist to verify everything works:

### Home Page
- [ ] Total screen time shows (not "N/A")
- [ ] App count shows (not "0")
- [ ] Top 3 apps list visible
- [ ] App icons display correctly
- [ ] App names display (not package names)
- [ ] Usage times display (e.g., "2h 15m")

### Analytics Page - Top 5 Chart
- [ ] Chart container visible
- [ ] 5 vertical bars display
- [ ] Bars have correct heights (proportional)
- [ ] Bars have colors (green/amber/red)
- [ ] Usage time labels above bars
- [ ] App icons below bars
- [ ] App names below icons
- [ ] Tap shows tooltip with status

### Analytics Page - All Apps List
- [ ] App count in title correct (e.g., "15 apps")
- [ ] All apps listed (not just 5)
- [ ] Each app has icon
- [ ] Each app has name
- [ ] Each app has usage time
- [ ] Status badge shows (Healthy/Medium/High)

### Analytics Page - Weekly Insights
- [ ] Total weekly time shows
- [ ] Days with data shows (e.g., "3 out of 7")
- [ ] Most used app shows (not "N/A")
- [ ] Daily average shows

---

## 🔄 If Still Not Working

### Last Resort Debugging

1. **Clear app data and restart**
   ```bash
   # On Android device
   Settings → Apps → HabitGuard → Storage → Clear Data
   ```

2. **Check Android version**
   - Requires Android 5.0+ (Lollipop)
   - Usage Stats API may behave differently on different versions

3. **Check React Native console**
   ```bash
   # Run with logging
   npx expo start
   # Open browser console for detailed logs
   ```

4. **Enable debug panel**
   - Debug panel on home page shows permission status
   - Shows raw data from API
   - Has manual refresh button

---

## ✅ Summary of Changes

| File | Changes Made |
|------|--------------|
| `UsageStatsService.ts` | ✅ Added `daysWithData`, `averageTime`, `topApp` to weekly stats |
| `index.tsx` (Home) | ✅ Updated all field names to v2 API |
| `analytics.tsx` | ✅ Updated all field names to v2 API |
| `progress.tsx` | ✅ Updated totalTime → totalScreenTime |

**All TypeScript errors:** ✅ **RESOLVED**

---

## 📞 Quick Reference

### V2 API Field Names (Use These!)
```typescript
// Daily Stats
dailyStats.totalScreenTime      // ✅ Use this
dailyStats.appUsage             // ✅ Use this
dailyStats.appUsage.length      // ✅ Use this
dailyStats.date                 // ✅ Use this
dailyStats.hourlyBreakdown      // ✅ Use this

// App Data
app.appName                     // ✅ Use this
app.packageName                 // ✅ Use this
app.totalTimeInForeground       // ✅ Use this
app.lastTimeUsed                // ✅ Use this

// Weekly Stats
weeklyStats.weeklyTotal         // ✅ Use this
weeklyStats.dailyBreakdown      // ✅ Use this
weeklyStats.topApps             // ✅ Use this
weeklyStats.daysWithData        // ✅ Use this
weeklyStats.averageTime         // ✅ Use this
weeklyStats.topApp              // ✅ Use this
```

---

**Fixed Date:** October 6, 2025  
**Status:** ✅ **COMPLETE - Apps should now display on all pages!**

**If apps still don't show after these fixes, please check:**
1. Android permissions are granted
2. Phone has been used today
3. React Native app has been reloaded (shake device → Reload)
