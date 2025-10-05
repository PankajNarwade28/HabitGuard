# Progress Tab Redesign - Specification

## Overview
Complete redesign of the Progress tab to focus on weekly data visualization with a clean, working interface. Shows last 7 days ending today with daily goals and statistics.

## Key Features

### 1. Last 7 Days Chart
- **Display Range**: Shows 7 days ending today (e.g., if today is Monday, shows Tuesday-Monday)
- **Bar Chart**: Vertical bars for each day
- **Color Coding**:
  - Gray (#cbd5e1): No data
  - Green (#10b981): On track (≤ daily goal)
  - Amber (#f59e0b): Moderate (goal to 1.5× goal)
  - Red (#ef4444): Over goal (> 1.5× goal)
- **Interactive**: Tap bars to see detailed time and date
- **Today Indicator**: Purple dot under today's bar

### 2. Today's Progress Card
- **Large Time Display**: Current day's usage in prominent size
- **Progress Bar**: Visual representation against daily goal
- **Status Indicator**: "On Track", "Moderate", or "Over Goal"
- **Color-Coded**: Matches bar chart color scheme

### 3. Weekly Summary Stats
Four key metrics in 2×2 grid:
- **Total Time**: Sum of all 7 days
- **Daily Average**: Total time ÷ 7
- **Days On Track**: Count of days ≤ goal
- **Best Day**: Day with lowest usage

### 4. Daily Goal Management
- **Display Current Goal**: Shows goal in hours
- **Easy Access to Settings**: Button to navigate to settings tab
- **Goal Storage**: Persisted in AsyncStorage with key `daily_goal_hours`
- **Default**: 4 hours if not set

### 5. Permission Handling
- **Clean No-Permission State**: Friendly message with grant button
- **Direct Action**: Button opens usage access settings

## Technical Implementation

### Data Flow
```typescript
1. Load daily goal from AsyncStorage
2. Check usage access permission
3. Fetch last 7 days of data from UsageStatsService
4. Calculate weekly statistics
5. Display with real-time updates
```

### Date Calculation
```typescript
// Get last 7 days ending today
for (let i = 6; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  // Fetch data for this date
}
```

### Key Functions
- `getLast7DaysData()`: Fetches usage data for each of last 7 days
- `calculateWeeklyStats()`: Computes totals, averages, and best day
- `getUsageColor()`: Determines bar color based on goal
- `getUsageStatus()`: Returns status text (On Track, Moderate, Over Goal)
- `formatTime()`: Converts hours to "Xh" or "Xm" format

## UI Components Removed
The following were removed from the old design:
- ❌ Streak tracking
- ❌ Achievements system
- ❌ Modal dialogs
- ❌ Best streak counter
- ❌ Individual achievement cards
- ❌ Complex loading states with timeouts
- ❌ StreakService dependency
- ❌ PermissionService dependency

## UI Components Added
- ✅ Clean 7-day bar chart
- ✅ Today's usage hero card
- ✅ Weekly statistics grid
- ✅ Goal management card
- ✅ Settings navigation button
- ✅ Interactive tooltips on bars
- ✅ Visual today indicator

## Settings Integration
The settings tab should include:
- **Daily Goal Input**: Number picker for goal in hours (1-12h range recommended)
- **Save Button**: Stores to AsyncStorage with key `daily_goal_hours`
- **Default Value**: 4 hours

Example settings code:
```typescript
// Save goal
await AsyncStorage.setItem('daily_goal_hours', goalValue.toString());

// Load goal
const saved = await AsyncStorage.getItem('daily_goal_hours');
const goal = saved ? parseFloat(saved) : 4;
```

## Design Specifications

### Color Palette
- **Primary Purple**: #a855f7 (headers, accents)
- **Success Green**: #10b981 (on track)
- **Warning Amber**: #f59e0b (moderate)
- **Danger Red**: #ef4444 (over goal)
- **Neutral Gray**: #cbd5e1 (no data)
- **Background**: #fef7ff (light purple tint)
- **Card**: #ffffff (white)

### Typography
- **Title**: 32px bold white
- **Subtitle**: 16px light purple
- **Card Title**: 18px semibold purple
- **Large Numbers**: 48px bold (today's time)
- **Stats**: 16px bold
- **Labels**: 12-14px regular

### Spacing
- **Screen Padding**: 16px
- **Card Margin**: 16px horizontal, 0px top (stacked)
- **Card Padding**: 20-24px
- **Component Gap**: 12-16px
- **Chart Height**: 180px

### Shadows
- **Today Card**: Purple shadow with elevation 8
- **Regular Cards**: Subtle gray shadow with elevation 4

## User Experience

### Loading State
- Centered spinner with "Loading your progress..." message
- Clean, minimal design
- Purple spinner color

### No Permission State
- Lock icon with friendly message
- Clear call-to-action button
- Explains why permission is needed

### Data State
- Shows 7 days even if some have no data (gray bars)
- Graceful handling of missing data (0 hours)
- Real-time updates on focus

### Interactions
- **Tap Bar**: Shows tooltip with time and date
- **Tap Settings Button**: Navigates to settings tab
- **Pull to Refresh**: Reloads data (via useFocusEffect)
- **Tap Go to Settings**: Opens settings tab for goal change

## Future Enhancements (Optional)
- 📊 Export weekly report
- 📈 Compare with previous weeks
- 🎯 Custom goal per day of week
- 🏆 Weekly achievements badges
- 📅 Month view calendar
- 📊 Trend line overlay

## Dependencies
- `@/services/UsageStatsService`: Fetches daily usage data
- `@react-native-async-storage/async-storage`: Stores daily goal
- `expo-router`: Navigation to settings
- `@expo/vector-icons/Ionicons`: Icons
- `react-native`: Core UI components

## File Structure
```
app/
  (tabs)/
    progress.tsx         # Main component (redesigned)
    settings.tsx         # Settings tab (needs goal input)
services/
  UsageStatsService.ts   # Data fetching
```

## Testing Checklist
- [ ] Last 7 days load correctly
- [ ] Today shows with indicator
- [ ] Bar colors match usage levels
- [ ] Tooltips show on tap
- [ ] Weekly stats calculate correctly
- [ ] Goal loads from storage
- [ ] Settings button navigates
- [ ] Permission state handles gracefully
- [ ] No data shows gray bars
- [ ] Time formatting works (hours/minutes)

---
**Status**: Specification Complete
**Implementation**: Pending
**Priority**: High - Core feature
**Complexity**: Medium
