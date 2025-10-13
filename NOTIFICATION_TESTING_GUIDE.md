# 🧪 Quick Notification Testing Guide

## Test Commands

Copy and paste these into your code to test notifications:

### 1. Test Login Success
```typescript
import { NotificationService } from '@/services/NotificationService';

// Test with name
await NotificationService.sendLoginSuccessNotification('John Doe');

// Test without name
await NotificationService.sendLoginSuccessNotification();
```

### 2. Test Signup Success
```typescript
// Test with name
await NotificationService.sendSignupSuccessNotification('Jane Smith');

// Test without name
await NotificationService.sendSignupSuccessNotification();
```

### 3. Test Logout
```typescript
await NotificationService.sendLogoutNotification();
```

### 4. Test Daily Watchtime - All Status Levels

```typescript
// 🌟 Excellent (30 min / 3 hour goal = 16.7%)
await NotificationService.sendDailyWatchtimeNotification(30, 180, true);

// 🌟 Excellent (1h 30m / 3 hour goal = 50%)
await NotificationService.sendDailyWatchtimeNotification(90, 180, true);

// ✅ Good (2h / 3 hour goal = 66.7%)
await NotificationService.sendDailyWatchtimeNotification(120, 180, true);

// ✅ Good (2h 24m / 3 hour goal = 80%)
await NotificationService.sendDailyWatchtimeNotification(144, 180, true);

// ⚠️ Approaching Limit (2h 42m / 3 hour goal = 90%)
await NotificationService.sendDailyWatchtimeNotification(162, 180, true);

// ⚠️ Approaching Limit (2h 57m / 3 hour goal = 99%)
await NotificationService.sendDailyWatchtimeNotification(177, 180, true);

// ⏰ Over Limit (3h 18m / 3 hour goal = 110%)
await NotificationService.sendDailyWatchtimeNotification(198, 180, true);

// 🚨 High Alert (4h 30m / 3 hour goal = 150%)
await NotificationService.sendDailyWatchtimeNotification(270, 180, true);

// 🚨 High Alert (6h / 3 hour goal = 200%)
await NotificationService.sendDailyWatchtimeNotification(360, 180, true);
```

### 5. Test Data Sync
```typescript
// Success
await NotificationService.sendDataSyncNotification(true);

// Success with custom message
await NotificationService.sendDataSyncNotification(true, 'All 2.5 hours of data synced!');

// Failure
await NotificationService.sendDataSyncNotification(false);

// Failure with custom message
await NotificationService.sendDataSyncNotification(false, 'Network timeout. Will retry in 5 minutes.');
```

### 6. Test Milestone
```typescript
await NotificationService.sendMilestoneNotification(
  'First Week Complete!',
  'You\'ve been using HabitGuard for 7 days. Great commitment!'
);

await NotificationService.sendMilestoneNotification(
  '100 Hours Tracked!',
  'You\'ve tracked over 100 hours of screen time. That\'s dedication!'
);

await NotificationService.sendMilestoneNotification(
  'Goal Master',
  'You\'ve met your daily goal 30 times! Incredible achievement!'
);
```

### 7. Test Streak
```typescript
// Screen time streak
await NotificationService.sendStreakNotification(7, 'screen_time');

// App limit streak
await NotificationService.sendStreakNotification(14, 'app_limit');

// Goal met streak
await NotificationService.sendStreakNotification(30, 'goal_met');
```

### 8. Test Scheduled Notifications
```typescript
// Schedule daily watchtime summary at 8 PM
await NotificationService.scheduleDailyWatchtimeSummary(20, 0);

// Schedule at 9 PM
await NotificationService.scheduleDailyWatchtimeSummary(21, 0);

// Schedule at 10:30 PM
await NotificationService.scheduleDailyWatchtimeSummary(22, 30);
```

---

## 🎯 Add Test Button to Your Screen

```tsx
import { NotificationService } from '@/services/NotificationService';
import { useState } from 'react';
import { Alert, Button, ScrollView, Text, View } from 'react-native';

export default function NotificationTestScreen() {
  const [lastTest, setLastTest] = useState('');

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    try {
      await testFn();
      setLastTest(`✅ ${name} - Success`);
    } catch (error) {
      setLastTest(`❌ ${name} - Failed: ${error}`);
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">Notification Tests</Text>
      
      {lastTest && (
        <View className="bg-gray-100 p-3 rounded-lg mb-4">
          <Text>{lastTest}</Text>
        </View>
      )}

      <View className="space-y-2">
        {/* Authentication */}
        <Text className="text-lg font-semibold mt-4">Authentication</Text>
        <Button
          title="Login Success"
          onPress={() => runTest('Login Success', async () => {
            await NotificationService.sendLoginSuccessNotification('Test User');
          })}
        />
        <Button
          title="Signup Success"
          onPress={() => runTest('Signup Success', async () => {
            await NotificationService.sendSignupSuccessNotification('New User');
          })}
        />
        <Button
          title="Logout"
          onPress={() => runTest('Logout', async () => {
            await NotificationService.sendLogoutNotification();
          })}
        />

        {/* Watchtime */}
        <Text className="text-lg font-semibold mt-4">Watchtime Status</Text>
        <Button
          title="🌟 Excellent (50%)"
          onPress={() => runTest('Excellent Status', async () => {
            await NotificationService.sendDailyWatchtimeNotification(90, 180, true);
          })}
        />
        <Button
          title="✅ Good (70%)"
          onPress={() => runTest('Good Status', async () => {
            await NotificationService.sendDailyWatchtimeNotification(126, 180, true);
          })}
        />
        <Button
          title="⚠️ Warning (90%)"
          onPress={() => runTest('Warning Status', async () => {
            await NotificationService.sendDailyWatchtimeNotification(162, 180, true);
          })}
        />
        <Button
          title="⏰ Over Limit (110%)"
          onPress={() => runTest('Over Limit', async () => {
            await NotificationService.sendDailyWatchtimeNotification(198, 180, true);
          })}
        />
        <Button
          title="🚨 High Alert (150%)"
          onPress={() => runTest('High Alert', async () => {
            await NotificationService.sendDailyWatchtimeNotification(270, 180, true);
          })}
        />

        {/* Streaks */}
        <Text className="text-lg font-semibold mt-4">Streaks</Text>
        <Button
          title="7 Day Screen Time Streak"
          onPress={() => runTest('Streak', async () => {
            await NotificationService.sendStreakNotification(7, 'screen_time');
          })}
        />

        {/* Milestones */}
        <Text className="text-lg font-semibold mt-4">Milestones</Text>
        <Button
          title="First Week Milestone"
          onPress={() => runTest('Milestone', async () => {
            await NotificationService.sendMilestoneNotification(
              'First Week Complete!',
              'You\'ve been using HabitGuard for 7 days!'
            );
          })}
        />

        {/* Data Sync */}
        <Text className="text-lg font-semibold mt-4">Data Sync</Text>
        <Button
          title="Sync Success"
          onPress={() => runTest('Sync Success', async () => {
            await NotificationService.sendDataSyncNotification(true);
          })}
        />
        <Button
          title="Sync Failed"
          onPress={() => runTest('Sync Failed', async () => {
            await NotificationService.sendDataSyncNotification(false);
          })}
        />

        {/* Scheduled */}
        <Text className="text-lg font-semibold mt-4">Scheduled</Text>
        <Button
          title="Schedule Daily Summary (8 PM)"
          onPress={() => runTest('Schedule Daily', async () => {
            await NotificationService.scheduleDailyWatchtimeSummary(20, 0);
            Alert.alert('Scheduled', 'Daily watchtime summary will be sent at 8 PM every day');
          })}
        />
      </View>
    </ScrollView>
  );
}
```

---

## 🔥 Quick Copy-Paste for Settings Screen

Add notification controls to your settings screen:

```tsx
import { useDailyWatchtimeNotification } from '@/hooks/useDailyWatchtimeNotification';
import { useState } from 'react';
import { Alert, Button, Switch, Text, TextInput, View } from 'react-native';

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

  const [goalInput, setGoalInput] = useState(dailyGoalMinutes.toString());
  const [hourInput, setHourInput] = useState(notificationTime.hour.toString());
  const [minuteInput, setMinuteInput] = useState(notificationTime.minute.toString());

  const handleUpdateGoal = () => {
    const minutes = parseInt(goalInput, 10);
    if (minutes > 0 && minutes <= 1440) {
      updateDailyGoal(minutes);
      Alert.alert('Success', `Daily goal updated to ${minutes} minutes`);
    } else {
      Alert.alert('Error', 'Please enter a valid number of minutes (1-1440)');
    }
  };

  const handleUpdateTime = () => {
    const hour = parseInt(hourInput, 10);
    const minute = parseInt(minuteInput, 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      updateNotificationTime(hour, minute);
      Alert.alert('Success', `Notification time updated to ${hour}:${minute.toString().padStart(2, '0')}`);
    } else {
      Alert.alert('Error', 'Please enter valid hour (0-23) and minute (0-59)');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendManualNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-4">Notification Settings</Text>

      {/* Enable/Disable */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-lg">Daily Notifications</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      {/* Daily Goal */}
      <View className="mb-6">
        <Text className="text-lg mb-2">Daily Goal (minutes)</Text>
        <TextInput
          value={goalInput}
          onChangeText={setGoalInput}
          keyboardType="numeric"
          className="border border-gray-300 rounded-lg p-3 mb-2"
        />
        <Text className="text-sm text-gray-600 mb-2">
          Current: {dailyGoalMinutes} minutes ({Math.floor(dailyGoalMinutes / 60)}h {dailyGoalMinutes % 60}m)
        </Text>
        <Button title="Update Goal" onPress={handleUpdateGoal} />
      </View>

      {/* Notification Time */}
      <View className="mb-6">
        <Text className="text-lg mb-2">Notification Time</Text>
        <View className="flex-row gap-2">
          <TextInput
            value={hourInput}
            onChangeText={setHourInput}
            placeholder="Hour (0-23)"
            keyboardType="numeric"
            className="flex-1 border border-gray-300 rounded-lg p-3"
          />
          <TextInput
            value={minuteInput}
            onChangeText={setMinuteInput}
            placeholder="Minute (0-59)"
            keyboardType="numeric"
            className="flex-1 border border-gray-300 rounded-lg p-3"
          />
        </View>
        <Text className="text-sm text-gray-600 mt-2 mb-2">
          Current: {notificationTime.hour}:{notificationTime.minute.toString().padStart(2, '0')}
        </Text>
        <Button title="Update Time" onPress={handleUpdateTime} />
      </View>

      {/* Test Button */}
      <Button
        title="Send Test Notification"
        onPress={handleTestNotification}
      />
    </View>
  );
}
```

---

## 📱 Test on Device

1. Make sure notifications are enabled in device settings
2. Run the app on your physical device (notifications don't work well in simulator)
3. Use the test buttons to trigger notifications
4. Check notification tray for results

---

## 🐛 Debugging

If notifications don't appear:

1. **Check permissions:**
```typescript
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission:', status);
```

2. **Check if notification was scheduled:**
```typescript
const scheduled = await Notifications.getAllScheduledNotificationsAsync();
console.log('Scheduled notifications:', scheduled.length);
```

3. **Check Android notification settings:**
   - Go to device Settings → Apps → HabitGuard → Notifications
   - Make sure notifications are enabled

4. **Check console logs:**
   - All notification methods log their status
   - Look for ✅ success or ❌ error messages

---

## ⚡ Quick Test Sequence

Run this sequence to test all notifications in order:

```typescript
// 1. Login
await NotificationService.sendLoginSuccessNotification('Test User');
await new Promise(resolve => setTimeout(resolve, 2000));

// 2. Daily watchtime - Excellent
await NotificationService.sendDailyWatchtimeNotification(90, 180, true);
await new Promise(resolve => setTimeout(resolve, 2000));

// 3. Data sync success
await NotificationService.sendDataSyncNotification(true);
await new Promise(resolve => setTimeout(resolve, 2000));

// 4. Streak notification
await NotificationService.sendStreakNotification(7, 'screen_time');
await new Promise(resolve => setTimeout(resolve, 2000));

// 5. Milestone
await NotificationService.sendMilestoneNotification('First Week!', 'Great job!');
await new Promise(resolve => setTimeout(resolve, 2000));

// 6. Logout
await NotificationService.sendLogoutNotification();
```

---

**Happy Testing! 🚀**
