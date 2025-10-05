# No Data Showing for Today - Debugging Guide

## Issue
App is not showing any data for today from 12:00 AM till current time.

## Changes Made

### ✅ Removed Aggressive Filter 3b
The previous "cross-midnight session filter" was **too aggressive** and filtering out ALL apps that had any usage before midnight, even if they were heavily used today.

**Problem with Filter 3b:**
```typescript
// ❌ TOO AGGRESSIVE - Removed this
if (firstTimeStamp > 0 && firstTimeStamp < startTimeUTC) {
    // This filtered out apps like WhatsApp that were used yesterday AND today
    return; // Excluded!
}
```

**Why it failed:**
- `firstTimeStamp` from Android might be ANY historical usage, not just today's first use
- If you used WhatsApp yesterday, `firstTimeStamp` would be from yesterday
- Even if you used WhatsApp for 2 hours TODAY, it would be excluded
- Result: NO apps showing (all were filtered out)

### ✅ Current Logic (Fixed)

Now using **only Filter 3** which is correct:

```typescript
// ✅ CORRECT - Only filter if NOT used today
if (lastTimeUsed < startOfToday || lastTimeUsed > endOfToday) {
    return; // Only exclude if app wasn't used today at all
}
```

**This works because:**
- `lastTimeUsed` tells us when the app was LAST used
- If last use is within today's range (12 AM to now), app IS used today
- We include it in today's statistics
- The reported time might have slight carryover, but data IS shown

## Two Data Collection Methods

### Method 1: Event-Based (100% Accurate) ✅ PREFERRED

**API:** `queryEvents()`
```javascript
// Gets individual foreground/background events
const events = await queryEvents(midnight, now);
// Result: Exact session times, no carryover possible
```

**Check logs for:**
```
🎉 SUCCESS: Using event-based calculation (accurate, no carryover)!
```

### Method 2: Aggregated (Fallback) ⚠️

**API:** `queryUsageStats()`
```javascript
// Gets aggregated totals per app
const stats = await queryUsageStats(midnight, now);
// Result: May include slight carryover from cross-midnight sessions
```

**Check logs for:**
```
🔄 Fallback: Using queryUsageStats (may include carryover)...
```

## Debugging Steps

### Step 1: Check Console Logs

Look for these key messages:

#### A. Time Range Calculation
```
📅 FETCHING REAL ANDROID USAGE DATA for 2025-10-06 (IST)
🕐 IST Range: 6/10/2025, 12:00:00 am to 6/10/2025, 10:45:33 am
📍 UTC Timestamps: 1728154800000 to 1728193533000
⏱️ Query Duration: 10.75 hours
🔍 Debug - Is Today: true
🔍 Debug - Current IST Time: 6/10/2025, 10:45:33 am
```

**Verify:**
- Start time is exactly 12:00:00 AM IST
- End time is current time
- Duration is correct

#### B. Data Retrieval Method
```
🎯 Step 1: Fetching usage events...
📞 Calling queryEvents API...
✅ Got 1234 usage events

OR

⚠️ queryEvents not available, falling back to queryUsageStats
```

**Check:**
- Is `queryEvents()` being used? (Better)
- Or falling back to `queryUsageStats()`? (Less accurate)

#### C. Raw Data Received
```
📦 Raw data received: 15 apps from Android

🔍 Sample raw data (first 3 apps):
[
  {
    pkg: "com.whatsapp",
    totalTimeInForeground: 2700000,
    lastTimeUsed: 1728190000000,
    lastTimeUsedIST: "6/10/2025, 10:00:00 am"
  },
  ...
]
```

**Check:**
- How many apps did Android return?
- Are there apps with valid timestamps?
- Are lastTimeUsed timestamps within today's range?

#### D. Filtering Results
```
🚫 System apps filtered: 5
🚫 Background apps filtered (< 1 min): 3
🚫 Yesterday carryover filtered: 0
✅ User apps included: 7

📊 Top 10 apps: ['WhatsApp: 45m', 'Chrome: 30m', ...]
📱 Total apps: 7, Total time: 1h 45m
```

**Check:**
- How many apps passed filtering?
- If 0 apps, why? (All system apps? All yesterday?)
- Do you see the warning: "No apps passed filtering!"?

### Step 2: Common Issues

#### Issue 1: No Permission
```
⚠️ No usage access permission
```

**Solution:** Grant usage access permission in Settings

#### Issue 2: All Apps Filtered
```
⚠️ WARNING: No apps passed filtering!
   - All apps were either system apps, background services, or not used today
```

**Possible causes:**
- Device hasn't been used much today
- All usage was system apps (Launcher, Settings, etc.)
- lastTimeUsed timestamps are not in today's range

#### Issue 3: Empty Data from Android
```
❌ NO REAL DATA AVAILABLE - Query returned empty.
```

**Possible causes:**
- First day using the app (no historical data yet)
- Android hasn't collected data yet (wait a few minutes)
- Device was restarted (data might be lost)

### Step 3: Verify Midnight Calculation

The app calculates "today" as:
```
Start: 12:00:00 AM IST (India Standard Time)
End: Current time IST

IST = UTC + 5:30
So Oct 6, 12:00 AM IST = Oct 5, 6:30 PM UTC
```

**Check logs for:**
```
🔍 Debug - Target Date: [Date object]
🔍 Debug - Is Today: true
🕐 IST Range: 6/10/2025, 12:00:00 am to [current time]
```

**Verify:**
- Start time is exactly midnight (00:00:00)
- End time is current time
- Timezone is IST (Asia/Kolkata)

## Expected Console Output (Success Case)

```
📅 FETCHING REAL ANDROID USAGE DATA for 2025-10-06 (IST)
🕐 IST Range: 6/10/2025, 12:00:00 am to 6/10/2025, 10:45:33 am
📍 UTC Timestamps: 1728154800000 to 1728193533000
⏱️ Query Duration: 10.75 hours
🔍 Debug - Is Today: true
🔍 Debug - Current IST Time: 6/10/2025, 10:45:33 am

🎯 Step 1: Fetching usage events...
📞 Calling queryEvents API...
✅ Got 1234 usage events

🎉 SUCCESS: Using event-based calculation (accurate, no carryover)!

🔄 Processing usage EVENTS (today-only calculation)...
📦 Raw events received: 1234 events from Android

🚫 System events filtered: 456
✅ Packages with usage: 12

🚫 Background apps filtered (< 1 min): 3
✅ User apps included (today only, event-based): 9

📊 Top 10 apps: [
  'WhatsApp: 45m',
  'Chrome: 30m',
  'Instagram: 22m',
  'YouTube: 15m',
  ...
]
📱 Total apps: 9, Total time: 1h 52m

✅ Event-based data processed successfully
```

## Expected Console Output (Fallback Case)

```
📅 FETCHING REAL ANDROID USAGE DATA for 2025-10-06 (IST)
🕐 IST Range: 6/10/2025, 12:00:00 am to 6/10/2025, 10:45:33 am

🎯 Step 1: Fetching usage events...
⚠️ queryEvents not available on this device, falling back to queryUsageStats

🔄 Fallback: Using queryUsageStats (may include carryover)...

🎉 SUCCESS: Got real usage data from Android!
📦 Raw data received: 15 apps from Android

🔄 Processing REAL ANDROID usage stats (AGGREGATED)...

🚫 System apps filtered: 5
🚫 Background apps filtered (< 1 min): 3
🚫 Yesterday carryover filtered: 0
✅ User apps included (aggregated method): 7

📊 Top 10 apps: ['WhatsApp: 45m', 'Chrome: 30m', ...]
📱 Total apps: 7, Total time: 1h 45m

✅ Real usage data processed successfully
```

## Quick Fixes

### Fix 1: Check Permission
```typescript
const hasPermission = await UsageStats.isUsageAccessGranted();
console.log('Has permission:', hasPermission);
```

If false, open Settings → Apps → Special App Access → Usage Access → Enable

### Fix 2: Check if Library is Loaded
```typescript
console.log('UsageStats library:', this.UsageStats);
console.log('queryEvents available:', typeof this.UsageStats?.queryEvents);
console.log('queryUsageStats available:', typeof this.UsageStats?.queryUsageStats);
```

### Fix 3: Test with Known Time Range
Try querying last 24 hours instead of just today:
```typescript
const now = Date.now();
const yesterday = now - (24 * 60 * 60 * 1000);
const stats = await this.UsageStats.queryUsageStats(yesterday, now);
console.log('Last 24h apps:', stats.length);
```

## What to Check in Your Logs

1. **Is the time range correct?** (12:00 AM to now)
2. **Is queryEvents being used?** (Preferred) or queryUsageStats? (Fallback)
3. **How many raw apps/events from Android?** (Should be > 0)
4. **How many apps after filtering?** (Should show user apps)
5. **Are there any error messages?** (Permission, library not loaded, etc.)

## Summary

### Problem
- Filter 3b was too aggressive
- Filtered ALL apps that had any historical usage
- Result: No apps showing

### Solution
- Removed Filter 3b
- Now only filters apps NOT used today (Filter 3)
- Accept slight carryover for cross-midnight apps (it's a limitation of Android's aggregated API)
- Prefer event-based method for 100% accuracy

### Trade-off
- **Event-based:** 100% accurate, no carryover
- **Aggregated:** May have 5-15 min carryover for apps used across midnight
- **But:** Data IS shown (not all filtered out)

---

**Next Step:** Run the app and check console logs to see which issue is occurring.
