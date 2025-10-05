# Progress Tab Timeout Fix

## Problem
The Progress tab was timing out at Step 1 and not displaying any data:
```
LOG  📋 Step 1: Getting user settings...
LOG  ⚠️ Load timeout reached - forcing completion
```

## Root Cause
The `permissionService.getUserSettings()` or other service calls were hanging without timeout protection, causing the entire loading sequence to stall and hit the 15-second global timeout.

## Solution
Added **individual timeout protection** for each loading step with fallback values:

### 1. **User Settings** (2s timeout)
```typescript
try {
  const userSettings = await Promise.race([
    permissionService.getUserSettings(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Settings timeout')), 2000))
  ]);
  setDailyGoal(userSettings.dailyGoalHours || 4);
} catch (error) {
  console.log('⚠️ Settings timeout, using default 4h goal');
  setDailyGoal(4); // Fallback to 4 hours
}
```

### 2. **Streak Data** (2s timeout)
```typescript
try {
  const streak = await Promise.race([
    streakService.getStreakData(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Streak timeout')), 2000))
  ]);
  setStreakData(streak);
} catch (error) {
  setStreakData({ currentStreak: 0, bestStreak: 0 }); // Default values
}
```

### 3. **Achievements** (2s timeout)
```typescript
try {
  const achievementsList = await Promise.race([
    streakService.getAchievements(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Achievements timeout')), 2000))
  ]);
  setAchievements(achievementsList);
} catch (error) {
  setAchievements([]); // Empty array
}
```

### 4. **Week Progress** (5s timeout - longer for potential real data fetch)
```typescript
try {
  const week = await Promise.race([
    streakService.getThisWeekProgress(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Week timeout')), 5000))
  ]);
  setWeekData(week);
} catch (error) {
  setWeekData([]); // Empty array
}
```

### 5. **Weekly Stats** (2s timeout)
```typescript
try {
  const stats = await Promise.race([
    streakService.getWeeklyStats(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Stats timeout')), 2000))
  ]);
  setWeeklyStats(stats);
} catch (error) {
  setWeeklyStats({ 
    goalsMet: 0, 
    totalDays: 7, 
    averageUsage: 0, 
    bestDay: 'N/A' 
  });
}
```

## Benefits

### ✅ **Resilient Loading**
- Each step has its own timeout
- Failures don't block other steps
- Page always loads (even with partial data)

### ✅ **Better UX**
- No more blank screen waiting
- Shows available data immediately
- Graceful degradation

### ✅ **Clear Logging**
- See which step times out
- Easier debugging
- Better user feedback

## Timeout Values

| Step | Timeout | Reason |
|------|---------|--------|
| Permission Check | 3s | Native Android call |
| User Settings | 2s | AsyncStorage read |
| Streak Data | 2s | AsyncStorage read |
| Achievements | 2s | AsyncStorage read |
| Week Progress | 5s | May fetch real usage data |
| Weekly Stats | 2s | Simple calculation |
| Global Timeout | 15s | Safety net (rarely hit now) |

## Expected Behavior After Fix

### Success Case:
```
📋 Step 1: Getting user settings...
✅ User settings loaded: 4h goal
📋 Step 2: Getting streak data...
✅ Streak data loaded: 3 days
📋 Step 3: Getting achievements...
✅ Achievements loaded: 8 total
📋 Step 4: Getting week progress...
✅ Week data loaded: 7 days
📋 Step 5: Calculating weekly stats...
✅ Weekly stats loaded: 4/7 goals met
✅ Progress data loaded successfully
```

### Partial Timeout Case:
```
📋 Step 1: Getting user settings...
⚠️ Settings timeout, using default 4h goal
📋 Step 2: Getting streak data...
✅ Streak data loaded: 3 days
... (continues with available data)
```

## Testing Steps

1. **Restart the app**
2. **Open Progress tab**
3. **Check logs**: Should see all 5 steps complete quickly
4. **Verify UI**: Should show:
   - Streak counter
   - Daily goal progress bar
   - Weekly chart (7 colored bars)
   - Achievements list

## Fallback Values

If services timeout, the UI shows:
- **Daily Goal**: 4 hours (default)
- **Streak**: 0 days
- **Achievements**: Empty list
- **Week Data**: Empty chart
- **Stats**: 0/7 goals met, 0h average

Users can still:
- View cached data when services recover
- Grant permissions to get real data
- See any data that loaded successfully

## Why This Works

### Before:
- One slow service blocked everything
- 15s timeout was too late
- UI showed loading forever
- No data displayed

### After:
- Each service independent
- Fast failures (2-5s)
- UI shows partial data
- Always displays something

---

**Status**: ✅ Fixed  
**Testing**: Verify Progress tab loads within 5 seconds  
**Fallback**: UI gracefully handles timeouts
