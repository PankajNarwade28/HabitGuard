# Usage Data Fix Guide

## 🔧 Issues Fixed

### 1. **Real Data Accuracy**
- **Problem**: App showing different data than Android system
- **Fix**: Enhanced query strategies with exact timestamp matching
- **Improvement**: Better time range filtering and data processing

### 2. **Permission Handling**  
- **Problem**: Usage access permission not opening settings directly
- **Fix**: Direct Android intent support for usage access panel
- **Improvement**: Multiple fallback methods and user guidance

### 3. **Data Processing**
- **Problem**: Time filtering and aggregation issues
- **Fix**: Enhanced data processing with detailed logging
- **Improvement**: Better system app filtering and time calculations

## 🧪 Testing Guide

### Step 1: Check Permission Status
```typescript
// Test permission checking
await usageStatsService.checkUsageAccessPermission();
```

### Step 2: Request Permission (Direct Panel)
```typescript
// Opens usage access settings directly
await usageStatsService.requestUsageAccessPermission();
```

### Step 3: Debug Real Data
```typescript
// Enhanced debugging with detailed logs
await usageStatsService.debugUsageStatsAPI();
```

### Step 4: Get Today's Data
```typescript
// Get today's accurate usage data
const todayData = await usageStatsService.getDailyUsageStats();
console.log('Today\'s data:', todayData);
```

## 📊 Expected Data Format

Your app should now show data matching Android's system:
- **Instagram**: 1hr 46mins → `"Instagram": "1h 46m"`
- **Expo Go**: 26 minutes → `"Expo Go": "26m"`  
- **Chrome**: 15 minutes → `"Chrome": "15m"`

## 🔍 Debugging Steps

### 1. Check Console Logs
Look for these debug messages:
```
🎯 REAL DATA MODE ACTIVE
📱 Strategy 1: Exact day range query...
📈 Strategy 1 result: X apps
🎉 SUCCESS: Got real usage data from Android!
```

### 2. Verify Permission
```
🔐 Permission check result: true
🎉 Permission granted! Real data mode active.
```

### 3. Data Processing
```
🔄 Processing REAL ANDROID usage stats... X apps
📱 DATA SOURCE: Actual Android Usage Stats API
📊 Final processed data: {...}
```

## 🚨 Troubleshooting

### If No Data Shows:
1. **Permission Check**: `debugUsageStatsAPI()` 
2. **Time Range**: Check if query times match current day
3. **System Apps**: Verify filtering is not too aggressive

### If Data Doesn't Match System:
1. **Query Range**: Compare timestamps with system data
2. **Aggregation**: Check if multiple entries are being combined
3. **Filtering**: Ensure system apps are filtered correctly

### If Permission Issues:
1. **Direct Intent**: Test `requestUsageAccessPermission()`
2. **Manual Setup**: Guide user through Settings manually
3. **Multiple Tries**: Android sometimes needs multiple attempts

## 🎯 Key Improvements

### Enhanced Query Strategies
- **Strategy 1**: Exact day range (midnight to now)
- **Strategy 2**: Extended range (last 25 hours)  
- **Strategy 3**: Last 48 hours with filtering
- **Strategy 4**: Weekly range fallback

### Better Permission Handling
- Direct usage access panel opening
- Multiple Android intent fallbacks
- Clear user guidance for manual setup

### Accurate Data Processing
- No arbitrary time thresholds (accepts any usage > 0)
- Proper time range filtering
- Enhanced system app detection
- Better aggregation logic

## 📝 Next Steps

1. **Test on Device**: Run the app and check console logs
2. **Compare Data**: Verify against Android system settings
3. **Permission Flow**: Test direct settings panel opening
4. **Debug Mode**: Use `debugUsageStatsAPI()` for detailed analysis

The app should now show accurate real-time data matching your Android system's usage statistics! 🎉