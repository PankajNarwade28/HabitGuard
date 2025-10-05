# Usage Data Fetching Analysis 📊

## 🔍 **How Usage Data is Fetched from Mobile**

### **1. Data Source**
```typescript
// Uses react-native-usage-stats library
this.UsageStats = require('react-native-usage-stats')

// Queries Android's UsageStatsManager API
const usageStats = await this.UsageStats.queryUsageStats(startTime, endTime)
```

### **2. Permission Required**
```typescript
// Checks if usage access permission is granted
const hasPermission = await this.UsageStats.isUsageAccessGranted()

// Opens Android settings for user to grant permission
await this.UsageStats.requestUsageAccessPermission()
```

### **3. Data Query Process**
```typescript
// For TODAY's data (IST timezone):
const istTime = this.getISTTime() // Current time in IST
const startTime = IST_midnight_converted_to_UTC
const endTime = current_IST_time_converted_to_UTC

// Query Android with UTC timestamps
const usageStats = await this.UsageStats.queryUsageStats(startTime, endTime)
```

## 📅 **Weekly Data Fetching Logic**

### **Current Implementation Issues:**

#### **1. Week Calculation (IST-based)**
```typescript
// Get current IST time
const istTime = this.getISTTime()

// Calculate Monday start (ISO week)
const currentDayOfWeek = istTime.getDay() // 0=Sunday, 1=Monday...
const daysSinceMonday = (currentDayOfWeek + 6) % 7
const startOfWeekIST = new Date(istTime)
startOfWeekIST.setDate(istTime.getDate() - daysSinceMonday)
```

#### **2. Daily Data Loop**
```typescript
for (let i = 0; i < 7; i++) {
  const dateIST = new Date(startOfWeekIST)
  dateIST.setDate(startOfWeekIST.getDate() + i)
  
  // Get daily stats for each day
  const dailyStats = await this.getDailyUsageStats(dateIST)
  
  weeklyData.push({
    day: dayNames[i], // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    totalTime: dailyStats.totalTime || 0,
    date: dateIST.toISOString().split('T')[0]
  })
}
```

## 🚨 **Identified Issues**

### **1. Timezone Conversion Problems**
- **Problem**: IST calculations may not align with Android's internal timezone
- **Impact**: Wrong day boundaries, incorrect data ranges
- **Current**: Converting IST to UTC for Android queries

### **2. Weekly Data Aggregation**
- **Problem**: Each daily call uses different timezone logic
- **Impact**: Inconsistent data across week days
- **Current**: 7 separate `getDailyUsageStats()` calls

### **3. Data Processing Inconsistencies**
```typescript
// Each day processes data differently based on:
- Whether it's "today" vs historical
- IST vs UTC timezone calculations  
- Different filtering logic for time ranges
```

## 🛠️ **How to Debug Current Issues**

### **Method 1: Check Weekly Data Flow**
```typescript
// Add to component
const debugWeeklyData = async () => {
  console.log('🧪 DEBUGGING WEEKLY DATA...')
  
  const weeklyStats = await usageStatsService.getWeeklyUsageStats()
  console.log('Weekly result:', weeklyStats)
  
  // Check each day individually
  const istTime = usageStatsService.getISTTime()
  for (let i = 0; i < 7; i++) {
    const date = new Date(istTime)
    date.setDate(istTime.getDate() - 6 + i) // Last 7 days
    
    console.log(`Day ${i}:`, date.toLocaleDateString())
    const dayData = await usageStatsService.getDailyUsageStats(date)
    console.log(`  Data:`, dayData)
  }
}
```

### **Method 2: Check Raw Android Data**
```typescript
// Add to UsageStatsService
public async debugRawWeeklyData(): Promise<void> {
  if (!this.UsageStats) return
  
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  console.log('🔍 RAW ANDROID DATA (Last 7 days):')
  console.log(`Query range: ${weekAgo.toLocaleString()} to ${now.toLocaleString()}`)
  
  const rawData = await this.UsageStats.queryUsageStats(weekAgo.getTime(), now.getTime())
  
  // Group by day
  const dailyGroups = new Map()
  rawData.forEach(app => {
    const lastUsed = new Date(app.lastTimeUsed || 0)
    const dayKey = lastUsed.toDateString()
    
    if (!dailyGroups.has(dayKey)) {
      dailyGroups.set(dayKey, [])
    }
    dailyGroups.get(dayKey).push(app)
  })
  
  console.log('📊 Daily breakdown:')
  dailyGroups.forEach((apps, day) => {
    const totalTime = apps.reduce((sum, app) => sum + (app.totalTimeInForeground || 0), 0)
    console.log(`${day}: ${apps.length} apps, ${this.formatTime(totalTime)}`)
  })
}
```

## 🎯 **Expected vs Actual Behavior**

### **Expected (Mumbai/IST):**
- **Today**: Oct 3, 2025 data from 12:00 AM IST to current IST time
- **Week**: Monday Oct 30 to Sunday Oct 6 (current week in IST)
- **Data**: Shows accurate usage matching Android system settings

### **Potential Issues:**
- **UTC Conversion**: May be off by 5.5 hours
- **Day Boundaries**: Midnight IST vs midnight UTC 
- **Week Start**: Monday in IST vs Monday in UTC
- **Data Range**: IST today vs UTC today

## 🔧 **Quick Fixes to Test**

### **1. Check Current Time Handling**
```typescript
usageStatsService.debugTimezone() // Shows current time calculations
```

### **2. Test Today's Data Range** 
```typescript
usageStatsService.showTodayDataBreakdown() // Shows exact time ranges used
```

### **3. Compare with System Data**
```typescript
// Go to Android Settings > Digital Wellbeing
// Compare times shown there vs app display
```

Would you like me to implement fixes for the specific timezone and weekly data issues, or would you prefer to run these debug methods first to see exactly what's happening?