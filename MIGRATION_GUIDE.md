# Migration Guide: UsageStatsService v1 → v2

## Overview
This guide helps you migrate from the old `UsageStatsService` API to the new improved version.

---

## 🔄 Breaking Changes

### 1. Return Type Changes

#### `getDailyUsageStats()`

**Before (v1):**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
// Type: any
// Fields: totalTime, appCount, topApps, status
```

**After (v2):**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
// Type: DailyUsageStats
// Fields: totalScreenTime, appUsage, date, hourlyBreakdown, status
```

---

## 📝 Field Name Changes

| Old Field Name | New Field Name | Type | Notes |
|----------------|----------------|------|-------|
| `totalTime` | `totalScreenTime` | `number` | Same value, renamed |
| `appCount` | `appUsage.length` | `number` | Calculate from array |
| `topApps` | `appUsage` | `AppUsageData[]` | Renamed for clarity |
| ❌ N/A | `date` | `string` | **NEW** - ISO date string |
| ❌ N/A | `hourlyBreakdown` | `number[]` | **NEW** - Real hourly data |

---

## 🛠️ Code Migration Examples

### Example 1: Display Total Screen Time

**Before:**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
console.log(`Total: ${stats.totalTime}ms`);
```

**After:**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
console.log(`Total: ${stats.totalScreenTime}ms`);
```

---

### Example 2: Count Apps

**Before:**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
console.log(`Apps used: ${stats.appCount}`);
```

**After:**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
console.log(`Apps used: ${stats.appUsage.length}`);
```

---

### Example 3: Display Top Apps

**Before:**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
stats.topApps.forEach(app => {
    console.log(`${app.name}: ${app.timeSpent}ms`);
});
```

**After:**
```typescript
const stats = await usageStatsService.getDailyUsageStats();
stats.appUsage.forEach(app => {
    console.log(`${app.appName}: ${app.totalTimeInForeground}ms`);
});
```

---

### Example 4: React Component

**Before:**
```typescript
const [dailyStats, setDailyStats] = useState<any>(null);

useEffect(() => {
    const fetchStats = async () => {
        const stats = await usageStatsService.getDailyUsageStats();
        setDailyStats(stats);
    };
    fetchStats();
}, []);

return (
    <View>
        <Text>Total: {dailyStats?.totalTime || 0}ms</Text>
        <Text>Apps: {dailyStats?.appCount || 0}</Text>
        {dailyStats?.topApps?.map(app => (
            <Text key={app.packageName}>{app.name}</Text>
        ))}
    </View>
);
```

**After:**
```typescript
import { DailyUsageStats } from '../services/UsageStatsService';

const [dailyStats, setDailyStats] = useState<DailyUsageStats | null>(null);

useEffect(() => {
    const fetchStats = async () => {
        const stats = await usageStatsService.getDailyUsageStats();
        setDailyStats(stats);
    };
    fetchStats();
}, []);

return (
    <View>
        <Text>Total: {dailyStats?.totalScreenTime || 0}ms</Text>
        <Text>Apps: {dailyStats?.appUsage.length || 0}</Text>
        <Text>Date: {dailyStats?.date}</Text>
        {dailyStats?.appUsage?.map(app => (
            <Text key={app.packageName}>{app.appName}</Text>
        ))}
    </View>
);
```

---

## 🆕 New Features to Use

### 1. Hourly Breakdown (NEW!)

```typescript
const stats = await usageStatsService.getDailyUsageStats();

if (stats.hourlyBreakdown) {
    // Find peak usage hour
    const maxTime = Math.max(...stats.hourlyBreakdown);
    const peakHour = stats.hourlyBreakdown.indexOf(maxTime);
    
    console.log(`Peak hour: ${peakHour}:00`);
    console.log(`Peak time: ${usageStatsService.formatTime(maxTime)}`);
    
    // Create hourly chart
    stats.hourlyBreakdown.forEach((time, hour) => {
        console.log(`${hour}:00 - ${usageStatsService.formatTime(time)}`);
    });
}
```

### 2. Date Field (NEW!)

```typescript
const stats = await usageStatsService.getDailyUsageStats();
console.log(`Data for: ${stats.date}`); // "2025-10-05"
```

### 3. Status Checking (ENHANCED!)

```typescript
const stats = await usageStatsService.getDailyUsageStats();

switch (stats.status) {
    case 'success':
        // Event-based data - most accurate
        console.log('✅ High accuracy data');
        break;
    case 'fallback':
        // Aggregated data - may include carryover
        console.log('⚠️ Lower accuracy data');
        break;
    case 'no_data':
        console.log('❌ No data available');
        break;
    case 'error':
        console.log('❌ Error occurred');
        break;
    case 'no_library':
        console.log('❌ Native library not available');
        break;
}
```

---

## 📊 Weekly Stats Changes

### `getWeeklyUsageStats()`

**Before:**
```typescript
const weekly = await usageStatsService.getWeeklyUsageStats();
// dailyBreakdown was an array of objects with custom shape
weekly.dailyBreakdown.forEach(day => {
    console.log(`${day.day}: ${day.totalTime}ms`);
});
```

**After:**
```typescript
const weekly = await usageStatsService.getWeeklyUsageStats();
// dailyBreakdown is now an array of DailyUsageStats
weekly.dailyBreakdown.forEach(day => {
    console.log(`${day.date}: ${day.totalScreenTime}ms`);
    console.log(`Apps: ${day.appUsage.length}`);
    // You now also have access to hourlyBreakdown per day!
});
```

---

## 🤖 ML Data Changes

### `getMLDataForAnalysis()`

**NEW Fields:**
- `dayOfWeek` (0=Monday, 6=Sunday)
- `isWeekend` (boolean)
- `hourlyBreakdown` now contains **real data** (was simulated)
- `topApps` now contains **15 apps** (was 5)

**Usage:**
```typescript
const mlData = await usageStatsService.getMLDataForAnalysis(30);

// NEW: Filter by day of week
const mondays = mlData.filter(d => d.dayOfWeek === 0);

// NEW: Separate weekend/weekday
const weekends = mlData.filter(d => d.isWeekend);
const weekdays = mlData.filter(d => !d.isWeekend);

// NEW: Real hourly patterns
mlData.forEach(day => {
    const peakHour = day.hourlyBreakdown.indexOf(Math.max(...day.hourlyBreakdown));
    console.log(`Peak hour: ${peakHour}`);
});
```

---

## 🔍 Find & Replace Guide

If you want to do a bulk migration, use these find/replace patterns:

### Pattern 1: totalTime → totalScreenTime
```
Find:    stats.totalTime
Replace: stats.totalScreenTime
```

### Pattern 2: topApps → appUsage
```
Find:    stats.topApps
Replace: stats.appUsage
```

### Pattern 3: appCount → appUsage.length
```
Find:    stats.appCount
Replace: stats.appUsage.length
```

### Pattern 4: app.name → app.appName
```
Find:    app.name
Replace: app.appName
```

### Pattern 5: app.timeSpent → app.totalTimeInForeground
```
Find:    app.timeSpent
Replace: app.totalTimeInForeground
```

---

## ⚠️ Common Pitfalls

### Pitfall 1: Type Assumptions
**❌ Wrong:**
```typescript
const stats: any = await usageStatsService.getDailyUsageStats();
```

**✅ Correct:**
```typescript
import { DailyUsageStats } from '../services/UsageStatsService';
const stats: DailyUsageStats = await usageStatsService.getDailyUsageStats();
```

### Pitfall 2: Missing appUsage Check
**❌ Wrong:**
```typescript
const topApp = stats.appUsage[0].appName; // May crash if empty
```

**✅ Correct:**
```typescript
const topApp = stats.appUsage.length > 0 ? stats.appUsage[0].appName : 'None';
```

### Pitfall 3: Hourly Breakdown Assumption
**❌ Wrong:**
```typescript
const peakHour = stats.hourlyBreakdown.indexOf(Math.max(...stats.hourlyBreakdown));
// May crash if hourlyBreakdown is undefined
```

**✅ Correct:**
```typescript
const peakHour = stats.hourlyBreakdown 
    ? stats.hourlyBreakdown.indexOf(Math.max(...stats.hourlyBreakdown))
    : -1;
```

---

## 📱 UI Component Updates

### Chart Component Example

**Before:**
```typescript
<BarChart
    data={stats.topApps.map(app => ({
        label: app.name,
        value: app.timeSpent
    }))}
/>
```

**After:**
```typescript
<BarChart
    data={stats.appUsage.map(app => ({
        label: app.appName,
        value: app.totalTimeInForeground
    }))}
/>

// NEW: Add hourly chart
<LineChart
    data={stats.hourlyBreakdown?.map((time, hour) => ({
        label: `${hour}:00`,
        value: time
    })) || []}
/>
```

---

## 🧪 Testing Updates

### Unit Test Example

**Before:**
```typescript
test('should return daily stats', async () => {
    const stats = await usageStatsService.getDailyUsageStats();
    expect(stats.totalTime).toBeGreaterThan(0);
    expect(stats.appCount).toBeGreaterThan(0);
    expect(stats.topApps).toBeInstanceOf(Array);
});
```

**After:**
```typescript
import { DailyUsageStats } from '../services/UsageStatsService';

test('should return daily stats', async () => {
    const stats: DailyUsageStats = await usageStatsService.getDailyUsageStats();
    expect(stats.totalScreenTime).toBeGreaterThan(0);
    expect(stats.appUsage.length).toBeGreaterThan(0);
    expect(stats.appUsage).toBeInstanceOf(Array);
    expect(stats.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(stats.hourlyBreakdown).toHaveLength(24);
});
```

---

## ✅ Migration Checklist

Use this checklist to ensure complete migration:

- [ ] Replace `totalTime` with `totalScreenTime`
- [ ] Replace `topApps` with `appUsage`
- [ ] Replace `appCount` with `appUsage.length`
- [ ] Replace `app.name` with `app.appName`
- [ ] Replace `app.timeSpent` with `app.totalTimeInForeground`
- [ ] Add type annotations (`DailyUsageStats`)
- [ ] Handle new `date` field where needed
- [ ] Optionally use new `hourlyBreakdown` feature
- [ ] Update status checking to handle `'fallback'` status
- [ ] Update weekly stats handling
- [ ] Update ML data usage (new fields)
- [ ] Update unit tests
- [ ] Update UI components
- [ ] Test thoroughly

---

## 🆘 Need Help?

If you encounter issues during migration:

1. **Check type errors:** TypeScript will highlight most issues
2. **Review examples:** See `QUICK_API_REFERENCE.md`
3. **Check status:** Use `stats.status` to debug data issues
4. **Consult docs:** See `USAGE_STATS_IMPROVEMENTS.md` for details

---

## 📞 Quick Reference

| Task | Old Code | New Code |
|------|----------|----------|
| Get total time | `stats.totalTime` | `stats.totalScreenTime` |
| Get app count | `stats.appCount` | `stats.appUsage.length` |
| Get apps list | `stats.topApps` | `stats.appUsage` |
| Get app name | `app.name` | `app.appName` |
| Get app time | `app.timeSpent` | `app.totalTimeInForeground` |
| Get date | ❌ N/A | `stats.date` |
| Get hourly data | ❌ N/A | `stats.hourlyBreakdown` |

---

**Good luck with your migration! 🚀**
