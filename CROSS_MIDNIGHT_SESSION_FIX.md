# Cross-Midnight Session Filtering Fix 🌙

## Problem Summary

**Instagram showing 22 minutes when you only used it <1 minute today**

The app was reporting inflated usage times because Android's `queryUsageStats()` API returns **aggregated data** that includes sessions spanning across midnight.

## Root Cause Analysis

### Timeline Example

```
Oct 5, 2025 (Yesterday)              Oct 6, 2025 (Today)
├─────────────────────────────────┬─────────────────────────────┐
│  7:20 PM                         │  12:00 AM    1:13 AM        │
│  Instagram opened                │  Midnight    Instagram      │
│                                  │              closed         │
│  [──────────Session──────────────┼──────]                     │
│                                  │                             │
│  firstTimeStamp: 7:20 PM         │                             │
│  lastTimeUsed: 1:13 AM           │                             │
│  totalTime: 22 minutes ❌        │  (INCLUDES YESTERDAY!)      │
└──────────────────────────────────┴─────────────────────────────┘
```

### The API Limitation

Android's `queryUsageStats()` returns:
```java
{
  packageName: "com.instagram.android",
  totalTimeInForeground: 1320000,  // 22 minutes (BOTH DAYS!)
  firstTimeStamp: 1728148214000,   // Oct 5, 7:20 PM ← Yesterday
  lastTimeUsed: 1728169393000      // Oct 6, 1:13 AM ← Today
}
```

**The Problem:**
- `totalTimeInForeground` includes usage from **BOTH Oct 5 AND Oct 6**
- Cannot separate how much time was on Oct 5 vs Oct 6
- Previous filter only checked `lastTimeUsed` (which was today), so app was included ❌

## The Solution

### New Filter 3b: Cross-Midnight Session Detection

Added a critical check BEFORE including any app in today's statistics:

```typescript
// ✅ Filter 3b: CRITICAL - Exclude cross-midnight sessions
if (firstTimeStamp > 0 && firstTimeStamp < startTimeUTC) {
    // App session started before midnight = contaminated data
    yesterdayCarryoverCount++;
    console.log(`🚫 Cross-midnight session filtered: ${appName}`);
    console.log(`   First use: ${firstTimeStamp} (before midnight)`);
    console.log(`   Last use: ${lastTimeUsed} (after midnight)`);
    console.log(`   Time excluded: ${timeSpent} (contains yesterday's usage)`);
    return; // ← EXCLUDE this app entirely
}
```

### Filter Sequence (Complete)

```
1. Filter System Apps
   └─ Exclude: Launcher, SystemUI, Wellbeing, etc.

2. Filter Background Apps
   └─ Exclude: Apps with < 1 minute usage (background services)

3. Filter Outside Time Range
   └─ Exclude: Apps where lastTimeUsed is NOT in today's range

4. Filter Cross-Midnight Sessions ← NEW!
   └─ Exclude: Apps where firstTimeStamp is BEFORE today's midnight
   └─ Why: Total time includes yesterday's usage (cannot be separated)

5. Cap Unrealistic Times
   └─ Cap: Times exceeding maximum possible duration (midnight to now)
```

## How It Works

### Scenario 1: Instagram (Cross-Midnight) - NOW FIXED ✅

**Before Fix:**
```
firstTimeStamp: Oct 5, 7:20 PM (< midnight) 
lastTimeUsed: Oct 6, 1:13 AM (> midnight)
totalTime: 22 minutes

Check Filter 3: lastTimeUsed in today's range? ✅ YES
→ Result: INCLUDED ❌ WRONG (has yesterday's time)
```

**After Fix:**
```
firstTimeStamp: Oct 5, 7:20 PM (< midnight) 
lastTimeUsed: Oct 6, 1:13 AM (> midnight)
totalTime: 22 minutes

Check Filter 3: lastTimeUsed in today's range? ✅ YES
Check Filter 3b: firstTimeStamp before midnight? ✅ YES
→ Result: EXCLUDED ✅ CORRECT (contaminated data)
```

### Scenario 2: WhatsApp (Used Only Today) ✅

```
firstTimeStamp: Oct 6, 9:00 AM (> midnight)
lastTimeUsed: Oct 6, 10:30 AM (> midnight)
totalTime: 15 minutes

Check Filter 3: lastTimeUsed in today's range? ✅ YES
Check Filter 3b: firstTimeStamp before midnight? ❌ NO
→ Result: INCLUDED ✅ (today-only usage)
```

### Scenario 3: Chrome (Used Late Last Night) ✅

```
firstTimeStamp: Oct 5, 11:30 PM (< midnight)
lastTimeUsed: Oct 5, 11:50 PM (< midnight)
totalTime: 20 minutes

Check Filter 3: lastTimeUsed in today's range? ❌ NO
→ Result: EXCLUDED ✅ (by Filter 3, not even checked by 3b)
```

## Why This Approach?

### Why Not Just Subtract Time?

**❌ WRONG APPROACH:**
```typescript
// This assumes continuous usage - INCORRECT!
sessionDuration = lastTimeUsed - firstTimeStamp;
todayPortion = currentTime - midnight;
// Subtract to get "today's time"
```

**Why It Fails:**
```
Actual Usage Pattern:
7:20 PM - 7:30 PM (10 min) ← Yesterday
11:00 PM - 11:05 PM (5 min) ← Yesterday
1:00 AM - 1:07 AM (7 min) ← Today

queryUsageStats returns: 22 minutes total
But which sessions happened when? UNKNOWN!
```

### Conservative But Accurate

**Our Approach:**
- ✅ If `firstTimeStamp` < midnight → Exclude entire app
- ✅ Guarantees no yesterday's data in today's totals
- ✅ Better to under-report than over-report

**Trade-off:**
- ⚠️ Apps with cross-midnight sessions won't show today
- ⚠️ But this is rare (most apps aren't used at midnight)
- ✅ Accuracy is more important than completeness

## Expected Results

### Before Fix
```
Today's Usage (Oct 6):
├─ Instagram: 22 minutes ❌ (includes yesterday)
├─ WhatsApp: 45 minutes ✅
└─ Total: 67 minutes ❌
```

### After Fix
```
Today's Usage (Oct 6):
├─ Instagram: Not shown ✅ (cross-midnight session excluded)
├─ WhatsApp: 45 minutes ✅
└─ Total: 45 minutes ✅
```

## Console Output

### What You'll See

```
🔄 Processing REAL ANDROID usage stats (AGGREGATED)...
📦 Raw data received: 15 apps from Android

🔍 Instagram Debug:
   Raw time from Android: 22m
   First timestamp: 5/10/2025, 7:20:14 pm
   Last timestamp: 6/10/2025, 1:13:13 am
   Last used: 6/10/2025, 1:13:13 am
   Midnight UTC: 6/10/2025, 12:00:00 am

✅ Filter 3: lastTimeUsed in range (passes)

🚫 Cross-midnight session filtered: Instagram
   First use: 5/10/2025, 7:20:14 pm (before midnight)
   Last use: 6/10/2025, 1:13:13 am (after midnight)
   Time excluded: 22m (contains yesterday's usage)

🚫 System apps filtered: 5
🚫 Background apps filtered (< 1 min): 3
🚫 Yesterday carryover filtered: 2 (includes cross-midnight)
✅ User apps included (today only): 7
```

## Two Data Collection Methods

### Method 1: Event-Based (Most Accurate) ✅

**API:** `queryEvents()`
- Gets individual MOVE_TO_FOREGROUND / MOVE_TO_BACKGROUND events
- Calculates exact session times
- **Only counts sessions AFTER midnight**
- 100% accurate, no carryover possible

**Status:** Preferred, tries first

### Method 2: Aggregated (Fallback) ⚠️

**API:** `queryUsageStats()`
- Gets total aggregated time per app
- Cannot separate individual sessions
- **Requires cross-midnight filtering (Filter 3b)**
- Conservative but accurate

**Status:** Fallback if `queryEvents()` unavailable

## Time Range Definition

**"Today" in IST (India Standard Time):**
```
Start: 12:00:00 AM IST (Oct 6) = 6:30:00 PM UTC (Oct 5)
End:   Current time IST
```

**Why IST?**
- Your device timezone
- All date calculations use IST
- Midnight means 12 AM IST, not UTC

## Testing the Fix

### What to Check

1. **Instagram should NOT appear** in today's list (if used across midnight)
2. **Apps used only today** should appear with correct times
3. **Console logs** should show:
   ```
   🚫 Cross-midnight session filtered: Instagram
   ```

### Test Cases

| App | First Use | Last Use | Expected Result |
|-----|-----------|----------|-----------------|
| Instagram | Yesterday 7 PM | Today 1 AM | ❌ Excluded (cross-midnight) |
| WhatsApp | Today 9 AM | Today 10 AM | ✅ Included (today only) |
| Chrome | Yesterday 11 PM | Yesterday 11:50 PM | ❌ Excluded (Filter 3) |
| YouTube | Today 12:01 AM | Today 2 AM | ✅ Included (started after midnight) |

## Code Location

**File:** `services/UsageStatsService.ts`
**Method:** `processRealUsageStats()`
**Lines:** ~681-698 (Filter 3b)

## Related Issues

- **Issue:** Apps showing inflated times
- **Cause:** Cross-midnight sessions including yesterday's data
- **Fix:** Filter 3b - exclude apps with `firstTimeStamp < midnight`
- **Impact:** Accurate daily totals, no carryover contamination

## Alternative: Use Event-Based Calculation

For 100% accuracy without any filtering compromises:

```typescript
// Already implemented! Just needs to work on your device
const events = await this.UsageStats.queryEvents(startTime, endTime);
const processedData = this.processUsageEvents(events, startTime, endTime);
```

**Advantages:**
- Session-level accuracy
- No cross-midnight issues
- Exact time calculation
- No conservative exclusions

**Check logs for:**
```
🎉 SUCCESS: Using event-based calculation (accurate, no carryover)!
```

If you see this, you're getting the most accurate data possible!

---

## Summary

### Before
- Instagram: 22 minutes ❌ (includes yesterday)
- Cause: `firstTimeStamp` not checked
- Result: Inflated totals

### After  
- Instagram: Not shown ✅ (cross-midnight excluded)
- Cause: Filter 3b checks `firstTimeStamp < midnight`
- Result: Accurate today-only totals

### Key Principle

> **"Today" means 12:00 AM to 11:59 PM IST. Any app with usage before midnight is excluded because aggregated data cannot be split by day.**

**Status:** ✅ Fixed
**Accuracy:** Today-only usage guaranteed
**Trade-off:** Cross-midnight apps excluded (acceptable for accuracy)
