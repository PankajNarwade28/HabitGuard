# Quick Reference: Wellbeing App Exclusion

## What Was Changed?

### File: `services/UsageStatsService.ts`

#### 1. Added Wellbeing to Blocked Packages (Line ~972)
```typescript
// Digital Wellbeing (Exclude from tracking)
'com.google.android.apps.wellbeing',
```

#### 2. Event Processing Filter (Line ~520)
```typescript
// Filter system apps and Wellbeing at event level
if (this.isSystemApp(packageName)) {
    if (packageName === 'com.google.android.apps.wellbeing') {
        console.log('🚫 Wellbeing app filtered from events');
    }
    systemEventCount++;
    continue;
}
```

#### 3. Aggregated Stats Filter (Line ~663)
```typescript
// ✅ Filter 1: Exclude system apps and Wellbeing
if (this.isSystemApp(packageName)) {
    if (packageName === 'com.google.android.apps.wellbeing') {
        console.log(`🚫 Wellbeing app filtered: ${this.formatTime(timeSpent)} excluded from total`);
    }
    systemAppCount++;
    return;
}
```

## Impact

### ✅ What's Excluded:
- **Package**: `com.google.android.apps.wellbeing`
- **App Name**: "Wellbeing"
- **Icon**: Fitness icon (blue)
- **Time**: ~17 minutes (from your example)

### ✅ Where It's Excluded:
1. **Total Screen Time** - Not counted in daily/weekly totals
2. **Top Apps List** - Does NOT appear in "Top Apps Today"
3. **App Usage Arrays** - Completely filtered out
4. **Statistics** - Not included in any calculations

## Console Output

### When Wellbeing is detected:
```
🚫 Wellbeing app filtered from events
```
or
```
🚫 Wellbeing app filtered: 17m 14s excluded from total
```

## Testing Checklist

### ✅ Today Tab
- [ ] Open "Top Apps Today" section
- [ ] Verify Wellbeing is NOT listed
- [ ] Check total screen time is accurate

### ✅ Progress Tab  
- [ ] Check weekly chart bars
- [ ] Verify totals don't include Wellbeing
- [ ] Confirm week average is correct

### ✅ Console Logs
- [ ] Run app with: `npx expo start`
- [ ] Check for filter messages
- [ ] Verify system app count increases

## Quick Test Commands

```bash
# Start the development server
npx expo start

# Check logs for Wellbeing filtering
# Look for: "🚫 Wellbeing app filtered"

# If needed, rebuild
npx expo start --clear
```

## How to Add More Apps

If you need to exclude other apps, add them to the `blockedPackages` array:

```typescript
const blockedPackages = [
    // ... existing apps
    
    // Add your app here:
    'com.example.otherapp',
];
```

## Package Name Format
- Lowercase only
- Format: `com.company.appname`
- Example: `com.google.android.apps.wellbeing`

## Summary

**Status**: ✅ Complete  
**Files Changed**: 1 (`UsageStatsService.ts`)  
**Lines Changed**: ~15 lines (3 sections)  
**Breaking Changes**: None  
**Testing Required**: Manual testing on device  

---

**See Full Details**: `WELLBEING_APP_EXCLUSION.md`
