# Notification System - Complete Implementation Guide

## Overview

HabitGuard now has a comprehensive notification system that covers all essential user interactions and daily engagement features.

---

## 📱 Notification Types Implemented

### 1. **Authentication Notifications**

#### Login Success Notification ✅
- **Trigger**: After successful login
- **Title**: "✅ Login Successful"
- **Body**: "Welcome back, [Name]! Your data is now synced."
- **Implementation**: `NotificationService.sendLoginSuccessNotification(userName)`

#### Signup Success Notification 🎉
- **Trigger**: After successful account creation
- **Title**: "🎉 Account Created"
- **Body**: "Welcome to HabitGuard, [Name]! Your account has been created successfully."
- **Implementation**: `NotificationService.sendSignupSuccessNotification(userName)`

#### Logout Notification 👋
- **Trigger**: After user logs out
- **Title**: "👋 Logged Out"
- **Body**: "You have been logged out successfully. Your local data remains safe."
- **Implementation**: `NotificationService.sendLogoutNotification()`

#### Login Reminder 🔐
- **Trigger**: 1 minute after app opens without login
- **Title**: "🔐 Login to HabitGuard"
- **Body**: "Login to unlock personalized insights, sync your data, and track your progress!"
- **Implementation**: Existing via `useLoginReminder` hook

---

### 2. **Daily Watchtime Notifications** (NEW ⭐)

#### Dynamic Status-Based Notifications
The system automatically determines the status based on usage percentage:

##### 🌟 Excellent (0-50% of goal)
- **Title**: "🌟 Excellent Digital Wellness!"
- **Message**: Shows current usage and encouragement
- **Color**: Green (#10b981)

##### ✅ Good (50-80% of goal)
- **Title**: "✅ Great Job!"
- **Message**: Confirms user is on track
- **Color**: Blue (#3b82f6)

##### ⚠️ Approaching Limit (80-100% of goal)
- **Title**: "⚠️ Approaching Your Limit"
- **Message**: Suggests taking a break
- **Color**: Orange (#f59e0b)

##### ⏰ Over Limit (100-120% of goal)
- **Title**: "⏰ Goal Exceeded"
- **Message**: Encourages unwinding
- **Color**: Red (#ef4444)

##### 🚨 High Alert (>120% of goal)
- **Title**: "🚨 High Screen Time Alert"
- **Message**: Strong recommendation to take a break
- **Color**: Dark Red (#dc2626)

#### Features:
- ✅ **Dismissable**: Can be dismissed by user
- ✅ **Smart Timing**: Only sends once per day
- ✅ **Configurable Goal**: Customizable daily goal (default: 3 hours)
- ✅ **Real-Time Data**: Uses actual Android usage statistics

#### Implementation:
```typescript
// Send immediate notification
await NotificationService.sendDailyWatchtimeNotification(
  totalMinutes,
  dailyGoalMinutes,
  true // isDismissable
);

// Schedule daily notification at specific time
await NotificationService.scheduleDailyWatchtimeSummary(20, 0); // 8 PM
```

---

### 3. **Additional Notifications**

#### Data Sync Notification ☁️
- **Success**: "☁️ Data Synced - Your usage data has been synced to the cloud successfully."
- **Failure**: "⚠️ Sync Failed - Failed to sync your data. Please check your internet connection."
- **Implementation**: `NotificationService.sendDataSyncNotification(success, message)`

#### Milestone Notification 🏆
- **Trigger**: When user achieves a milestone
- **Title**: "🏆 [Milestone Name]"
- **Body**: Custom description
- **Implementation**: `NotificationService.sendMilestoneNotification(milestone, description)`

#### Streak Notification 🔥
- **Types**: Screen time streak, App limit streak, Goal met streak
- **Example**: "🔥 7 Day Streak! - Amazing! You've maintained healthy screen time for 7 days in a row."
- **Implementation**: `NotificationService.sendStreakNotification(streakDays, streakType)`

#### Setup Complete Notification 🎉
- **Trigger**: After completing onboarding and granting permissions
- **Title**: "🎉 HabitGuard Setup Complete!"
- **Body**: "All permissions granted! We're now tracking your screen time..."
- **Implementation**: Existing in `NotificationService.sendSetupCompleteNotification()`

---

## 🎨 In-App Modal Notification

### WatchtimeNotificationModal Component

A beautiful, gradient-based modal that displays watchtime status in-app.

#### Features:
- ✅ **Visual Progress Bar**: Shows percentage of daily goal
- ✅ **Color-Coded Status**: Different colors for different usage levels
- ✅ **Action Buttons**:
  - View Detailed Analytics
  - Send as Push Notification
  - Dismiss
- ✅ **Smart Display**: Only shows once per day with meaningful data (>30 min)
- ✅ **Gradient Design**: Beautiful LinearGradient backgrounds

#### Usage:
```tsx
import { WatchtimeNotificationModal } from '@/components/WatchtimeNotificationModal';

// Add to your main screen or _layout
<WatchtimeNotificationModal />
```

---

## 🔧 Hooks for Notification Management

### useDailyWatchtimeNotification Hook

Manages daily watchtime notifications with full customization.

#### Features:
- ✅ Enable/disable notifications
- ✅ Set notification time (hour and minute)
- ✅ Customize daily goal
- ✅ Send manual notifications
- ✅ Auto-check and send notifications

#### Usage:
```typescript
import { useDailyWatchtimeNotification } from '@/hooks/useDailyWatchtimeNotification';

const {
  isEnabled,
  notificationTime,
  dailyGoalMinutes,
  sendManualNotification,
  updateDailyGoal,
  updateNotificationTime,
  toggleNotifications,
  checkAndSendNotification,
} = useDailyWatchtimeNotification();

// Update daily goal to 4 hours
await updateDailyGoal(240);

// Set notification time to 9 PM
await updateNotificationTime(21, 0);

// Send manual notification
await sendManualNotification();

// Toggle notifications on/off
await toggleNotifications(false);
```

---

## 📦 NotificationService API

### Core Methods

#### Authentication
```typescript
// Login success
NotificationService.sendLoginSuccessNotification(userName?: string)

// Signup success
NotificationService.sendSignupSuccessNotification(userName?: string)

// Logout
NotificationService.sendLogoutNotification()

// Login reminder
NotificationService.sendLoginReminderNotification()
```

#### Daily Watchtime
```typescript
// Send immediate watchtime notification
NotificationService.sendDailyWatchtimeNotification(
  totalMinutes: number,
  dailyGoalMinutes: number = 180,
  isDismissable: boolean = true
)

// Schedule daily notification
NotificationService.scheduleDailyWatchtimeSummary(
  hour: number = 20,
  minute: number = 0
)
```

#### Other Notifications
```typescript
// Data sync
NotificationService.sendDataSyncNotification(success: boolean, message?: string)

// Milestone
NotificationService.sendMilestoneNotification(milestone: string, description: string)

// Streak
NotificationService.sendStreakNotification(
  streakDays: number,
  streakType: 'screen_time' | 'app_limit' | 'goal_met'
)

// Setup complete
NotificationService.sendSetupCompleteNotification()

// Screen time alert
NotificationService.scheduleScreenTimeAlert(screenTimeHours: number, dailyLimit: number)
```

#### Management
```typescript
// Request permissions
NotificationService.requestPermissions()

// Cancel all notifications
NotificationService.cancelAllNotifications()

// Cancel specific type
NotificationService.cancelNotificationsByType(type: string)
```

---

## 🚀 Integration Guide

### Step 1: Add to UserContext (Already Implemented ✅)

The UserContext now automatically sends notifications on:
- Login success
- Signup success
- Logout

### Step 2: Add WatchtimeNotificationModal to Main Layout

```tsx
// In app/(tabs)/_layout.tsx or app/_layout.tsx
import { WatchtimeNotificationModal } from '@/components/WatchtimeNotificationModal';

export default function Layout() {
  return (
    <>
      {/* Your existing layout */}
      <WatchtimeNotificationModal />
    </>
  );
}
```

### Step 3: Use Hook in Settings Screen

```tsx
// In app/(tabs)/settings.tsx
import { useDailyWatchtimeNotification } from '@/hooks/useDailyWatchtimeNotification';

export default function SettingsScreen() {
  const {
    isEnabled,
    dailyGoalMinutes,
    notificationTime,
    updateDailyGoal,
    updateNotificationTime,
    toggleNotifications,
    sendManualNotification,
  } = useDailyWatchtimeNotification();

  return (
    <View>
      {/* Add UI controls for notification settings */}
    </View>
  );
}
```

### Step 4: Optional - Add Manual Trigger Button

```tsx
// In any screen where you want to test notifications
import { NotificationService } from '@/services/NotificationService';

const handleTestNotification = async () => {
  await NotificationService.sendDailyWatchtimeNotification(
    145, // 2h 25m
    180, // 3h goal
    true
  );
};

<Button onPress={handleTestNotification} title="Test Watchtime Notification" />
```

---

## 📊 Data Flow

```
User Action → Context/Service → NotificationService → Expo Notifications → Device Notification
```

### Example: Login Flow
```
1. User enters credentials
2. login() in UserContext called
3. authService.login() authenticates
4. NotificationService.sendLoginSuccessNotification(userName) called
5. Notification appears on device
```

### Example: Daily Watchtime Flow
```
1. App opens or specific time reached
2. useDailyWatchtimeNotification hook checks if notification needed
3. Fetches today's usage stats from UsageStatsService
4. Calculates status (Excellent/Good/Warning/etc.)
5. WatchtimeNotificationModal shows in-app (once per day)
6. User can also send as push notification
7. Scheduled notification sent at configured time (default 8 PM)
```

---

## 🎯 Notification Permissions

All notifications respect user permissions:
- ✅ Check permission before sending
- ✅ Request permission on first use
- ✅ Gracefully handle permission denial
- ✅ Log permission status for debugging

```typescript
const { status } = await Notifications.getPermissionsAsync();
if (status !== 'granted') {
  console.log('⚠️ Notification permission not granted');
  return;
}
```

---

## 📱 Notification Channels (Android)

Default channel configured with:
- **Name**: "default"
- **Importance**: MAX
- **Vibration**: [0, 250, 250, 250]
- **Light Color**: #FF231F7C

---

## 🧪 Testing Notifications

### Test Login Success
```typescript
await NotificationService.sendLoginSuccessNotification('John Doe');
```

### Test Watchtime (Different Statuses)
```typescript
// Excellent (50% of goal)
await NotificationService.sendDailyWatchtimeNotification(90, 180, true);

// Good (70% of goal)
await NotificationService.sendDailyWatchtimeNotification(126, 180, true);

// Warning (90% of goal)
await NotificationService.sendDailyWatchtimeNotification(162, 180, true);

// Over limit (110% of goal)
await NotificationService.sendDailyWatchtimeNotification(198, 180, true);

// High alert (150% of goal)
await NotificationService.sendDailyWatchtimeNotification(270, 180, true);
```

### Test Streak
```typescript
await NotificationService.sendStreakNotification(7, 'screen_time');
```

---

## 🔔 Best Practices

1. **Don't Spam**: Send notifications only when meaningful
2. **Respect Privacy**: Don't send sensitive data in notifications
3. **Be Timely**: Send at appropriate times (not late at night)
4. **Be Actionable**: Include clear calls-to-action
5. **Allow Dismissal**: Most notifications should be dismissable
6. **Test Thoroughly**: Test on different Android versions

---

## 📈 Future Enhancements

Potential additions:
- 🔮 Predictive notifications based on usage patterns
- 📅 Weekly/monthly summary notifications
- 🎯 Goal achievement celebrations
- 👥 Social features (compare with friends)
- 🌙 Smart bedtime reminders based on usage
- 📊 App-specific notifications

---

## ✅ Summary

**Implemented Notifications:**
1. ✅ Login Success Notification
2. ✅ Signup Success Notification
3. ✅ Logout Notification
4. ✅ Login Reminder Notification
5. ✅ Daily Watchtime Notification (5 status levels)
6. ✅ Daily Watchtime Summary (scheduled)
7. ✅ Data Sync Notifications
8. ✅ Milestone Notifications
9. ✅ Streak Notifications
10. ✅ Setup Complete Notification

**Components:**
- ✅ WatchtimeNotificationModal (in-app modal)
- ✅ Existing LoginReminder component

**Hooks:**
- ✅ useDailyWatchtimeNotification (full notification management)
- ✅ Existing useLoginReminder hook

**Status**: All core notifications implemented and ready for use! 🚀

---

## 📝 Usage Example in Settings

```tsx
import { useDailyWatchtimeNotification } from '@/hooks/useDailyWatchtimeNotification';
import { View, Text, Switch, Button } from 'react-native';

export default function NotificationSettings() {
  const {
    isEnabled,
    dailyGoalMinutes,
    notificationTime,
    updateDailyGoal,
    updateNotificationTime,
    toggleNotifications,
    sendManualNotification,
  } = useDailyWatchtimeNotification();

  return (
    <View>
      <Text>Daily Notifications</Text>
      <Switch
        value={isEnabled}
        onValueChange={toggleNotifications}
      />
      
      <Text>Daily Goal: {dailyGoalMinutes} minutes</Text>
      <Button
        title="Set to 2 hours"
        onPress={() => updateDailyGoal(120)}
      />
      
      <Text>Notification Time: {notificationTime.hour}:{notificationTime.minute}</Text>
      <Button
        title="Set to 9 PM"
        onPress={() => updateNotificationTime(21, 0)}
      />
      
      <Button
        title="Test Notification"
        onPress={sendManualNotification}
      />
    </View>
  );
}
```

---

**Date**: October 14, 2025  
**Status**: ✅ FULLY IMPLEMENTED  
**Ready for Production**: YES 🚀
