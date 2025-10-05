# UsageStatsService API Quick Reference

## 📱 Core Methods

### `getDailyUsageStats(date?: Date): Promise<DailyUsageStats>`

Get usage statistics for a specific day (defaults to today).

**Returns:**
```typescript
{
    totalScreenTime: number;        // Total milliseconds
    appUsage: AppUsageData[];       // Array of app usage
    date: string;                   // ISO date string (YYYY-MM-DD)
    hourlyBreakdown?: number[];     // 24-element array (real data!)
    status: 'success' | 'no_data' | 'error' | 'no_library' | 'fallback';
}
```

**Example:**
```typescript
const today = await usageStatsService.getDailyUsageStats();
console.log(`Total: ${today.totalScreenTime}ms`);
console.log(`Apps: ${today.appUsage.length}`);
console.log(`Peak hour: Hour ${today.hourlyBreakdown?.indexOf(Math.max(...today.hourlyBreakdown))}`);

// Get specific date
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const stats = await usageStatsService.getDailyUsageStats(yesterday);
```

---

### `getWeeklyUsageStats(): Promise<WeeklyUsageStats>`

Get usage statistics for the current week (Monday to Sunday, IST).

**Returns:**
```typescript
{
    weeklyTotal: number;              // Total milliseconds for the week
    dailyBreakdown: DailyUsageStats[]; // Array of 7 days
    topApps: AppUsageData[];          // Top 10 apps aggregated
}
```

**Example:**
```typescript
const weekly = await usageStatsService.getWeeklyUsageStats();
console.log(`Week total: ${weekly.weeklyTotal}ms`);
weekly.dailyBreakdown.forEach(day => {
    console.log(`${day.date}: ${day.totalScreenTime}ms`);
});
```

---

### `getMLDataForAnalysis(days?: number): Promise<MLDataPoint[]>`

Get ML-ready data points for the specified number of days (default 30).

**Returns:**
```typescript
{
    timestamp: number;                // Unix timestamp
    dailyTotal: number;               // Total milliseconds
    hourlyBreakdown: number[];        // Real hourly data (24 elements)
    topApps: string[];                // Top 15 package names
    behaviorPattern: 'light' | 'moderate' | 'heavy' | 'excessive';
    dayOfWeek: number;                // 0=Monday, 6=Sunday
    isWeekend: boolean;               // Weekend flag
}[]
```

**Example:**
```typescript
const mlData = await usageStatsService.getMLDataForAnalysis(30);

// Analyze weekend vs weekday
const weekendData = mlData.filter(d => d.isWeekend);
const weekdayData = mlData.filter(d => !d.isWeekend);

// Find peak usage hour
const allHourly = mlData.map(d => d.hourlyBreakdown).flat();
const peakHour = allHourly.indexOf(Math.max(...allHourly));
```

---

## 🔐 Permission Methods

### `checkUsageAccessPermission(): Promise<boolean>`

Check if usage access permission is granted.

```typescript
const hasPermission = await usageStatsService.checkUsageAccessPermission();
if (!hasPermission) {
    await usageStatsService.requestUsageAccessPermission();
}
```

### `requestUsageAccessPermission(): Promise<void>`

Opens Android's Usage Access Settings panel.

---

## 🛠️ Utility Methods

### `formatTime(milliseconds: number): string`

Convert milliseconds to human-readable format.

```typescript
usageStatsService.formatTime(3600000);  // "1h"
usageStatsService.formatTime(5400000);  // "1h 30m"
usageStatsService.formatTime(120000);   // "2m"
```

### `getUsageStatus(): Promise<UsageStatus>`

Get overall usage classification.

```typescript
const status = await usageStatsService.getUsageStatus();
console.log(status.status);    // "Excellent" | "Good" | "Moderate" | "High"
console.log(status.message);   // Personalized message
console.log(status.color);     // UI color code
```

---

## 📊 Data Types

### `AppUsageData`
```typescript
{
    packageName: string;           // e.g., "com.instagram.android"
    appName: string;               // e.g., "Instagram"
    totalTimeInForeground: number; // Milliseconds
    lastTimeUsed: number;          // Unix timestamp
    icon?: AppIconData;            // Icon metadata
}
```

### `AppIconData`
```typescript
{
    type: 'ionicon' | 'fontawesome' | 'material';
    name: string;      // Icon name
    color?: string;    // Hex color code
}
```

---

## ⚡ Quick Examples

### 1. Show Today's Top 5 Apps
```typescript
const today = await usageStatsService.getDailyUsageStats();
const top5 = today.appUsage.slice(0, 5);

top5.forEach(app => {
    console.log(`${app.appName}: ${usageStatsService.formatTime(app.totalTimeInForeground)}`);
});
```

### 2. Detect Peak Usage Hour
```typescript
const today = await usageStatsService.getDailyUsageStats();
if (today.hourlyBreakdown) {
    const maxTime = Math.max(...today.hourlyBreakdown);
    const peakHour = today.hourlyBreakdown.indexOf(maxTime);
    console.log(`Peak hour: ${peakHour}:00 (${usageStatsService.formatTime(maxTime)})`);
}
```

### 3. Weekly Comparison
```typescript
const weekly = await usageStatsService.getWeeklyUsageStats();
const avgDaily = weekly.weeklyTotal / 7;
console.log(`Average daily: ${usageStatsService.formatTime(avgDaily)}`);
```

### 4. Weekend vs Weekday Analysis
```typescript
const mlData = await usageStatsService.getMLDataForAnalysis(30);

const weekendAvg = mlData
    .filter(d => d.isWeekend)
    .reduce((sum, d) => sum + d.dailyTotal, 0) / mlData.filter(d => d.isWeekend).length;

const weekdayAvg = mlData
    .filter(d => !d.isWeekend)
    .reduce((sum, d) => sum + d.dailyTotal, 0) / mlData.filter(d => !d.isWeekend).length;

console.log(`Weekend: ${usageStatsService.formatTime(weekendAvg)}`);
console.log(`Weekday: ${usageStatsService.formatTime(weekdayAvg)}`);
```

### 5. Habit Detection
```typescript
const mlData = await usageStatsService.getMLDataForAnalysis(7);

// Find most common usage time
const hourlyTotals = new Array(24).fill(0);
mlData.forEach(day => {
    day.hourlyBreakdown.forEach((time, hour) => {
        hourlyTotals[hour] += time;
    });
});

const habitHour = hourlyTotals.indexOf(Math.max(...hourlyTotals));
console.log(`You typically use your phone most at ${habitHour}:00`);
```

---

## 🎨 Status Values

| Status | Meaning |
|--------|---------|
| `success` | Event-based calculation (most accurate) |
| `fallback` | Aggregated stats (less accurate, may include carryover) |
| `no_data` | No usage data available for the period |
| `error` | Error occurred during data fetching |
| `no_library` | Native module not available |

---

## ⏰ Timezone Note

All times are in **India Standard Time (IST, UTC+5:30)**. The service handles timezone conversion internally.

---

## 🔍 Debugging

Enable debug logs:
```typescript
// Check timezone
usageStatsService.debugTimezone();

// Show today's breakdown
await usageStatsService.showTodayDataBreakdown();

// Test API
await usageStatsService.debugUsageStatsAPI();
```

---

## 📅 Date Handling

The service uses IST (UTC+5:30) for all date calculations:

```typescript
// Get today (IST)
const today = await usageStatsService.getDailyUsageStats();

// Get specific date (will be interpreted as IST)
const oct5 = new Date('2025-10-05');
const stats = await usageStatsService.getDailyUsageStats(oct5);
```

---

## 💾 Data Storage

- **Daily CSV:** Stored in AsyncStorage at key `'usage_csv_data'`
- **ML Data:** Stored at keys `'ml_data_YYYY-MM-DD'`
- **Retention:** Last 30 days automatically cleaned up

---

**For detailed implementation guide, see:** `USAGE_STATS_IMPROVEMENTS.md`
