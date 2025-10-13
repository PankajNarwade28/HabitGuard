# 🐛 Debug Guide - App Not Showing Permissions or Login

## 🔍 Current Issue

The app is not asking for permissions or showing login screen on startup.

## ✅ What Was Fixed

### 1. **Rendering Priority Order Fixed**

**Problem:** The old code checked authentication BEFORE onboarding in the render logic:
```tsx
// OLD - WRONG ORDER
if (!isAuthenticated) return <Login />
if (showOnboarding) return <Onboarding />
```

**Solution:** Now checks onboarding FIRST:
```tsx
// NEW - CORRECT ORDER
if (showOnboarding) return <Onboarding />
if (!isAuthenticated) return <Login />
```

### 2. **Added Debug Logging**

Added comprehensive console logs to track the flow:
- Permission status
- Notification permission
- Usage access permission
- Authentication status
- Which screen will be shown

## 🧪 How to Test

### Test 1: Fresh Install (First Time User)

1. **Clear app data:**
   ```bash
   # Android
   adb shell pm clear com.habitguard.wellbeing
   
   # Or manually: Settings > Apps > HabitGuard > Storage > Clear Data
   ```

2. **Open the app**

3. **Expected behavior:**
   ```
   Console logs:
   🚀 App starting - checking state...
   📋 Permission status: { isFirstLaunch: true, hasCompletedOnboarding: false, ... }
   ⚠️ Permissions missing or onboarding incomplete - showing onboarding
   
   Screen shown: ONBOARDING (Welcome screen)
   ```

4. **Grant permissions:**
   - Step through onboarding
   - Grant notifications
   - Grant usage access

5. **After onboarding completes:**
   ```
   Console logs:
   🔐 Authentication status: false
   ⚠️ Not authenticated - will show login screen
   
   Screen shown: LOGIN
   ```

### Test 2: Check Console Logs

Run the app and look for these logs in order:

```
1. 🚀 App starting - checking state...
2. 📋 Permission status: { ... }
3. 🔔 Notification permission: true/false
4. 📊 Usage access permission: true/false
5. Either:
   - ⚠️ Permissions missing... → Shows Onboarding
   - ✅ All permissions granted... → Checks auth
6. 🔐 Authentication status: true/false
7. Either:
   - ⚠️ Not authenticated → Shows Login
   - ✅ Authenticated → Shows Main App
```

### Test 3: Reset to Test Again

To test the flow multiple times:

```javascript
// Clear AsyncStorage keys
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear all app data
await AsyncStorage.multiRemove([
  'habitguard_permissions',
  'habitguard_first_launch',
  'habitguard_onboarding_complete',
  'auth_token',
  'user_data'
]);

// Then reload app
```

## 🔍 Check These Things

### 1. **Check AsyncStorage**

If nothing is showing, check what's stored:

```javascript
// Add this temporarily to app/_layout.tsx
useEffect(() => {
  async function debugStorage() {
    const keys = await AsyncStorage.getAllKeys();
    console.log('All storage keys:', keys);
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`${key}:`, value);
    }
  }
  debugStorage();
}, []);
```

### 2. **Check Services Are Imported**

Verify imports at top of `app/_layout.tsx`:
```tsx
import { permissionService } from '@/services/PermissionService';
import { authService } from '@/services/AuthService';
```

### 3. **Check Login Screen Exists**

Verify these files exist:
- ✅ `app/login.tsx`
- ✅ `app/signup.tsx`
- ✅ `components/OnboardingScreen.tsx`

## 🔧 Manual Reset

If app seems stuck, manually clear everything:

### Option 1: Code-based Reset

Add this button temporarily to test:

```tsx
// In any screen
import AsyncStorage from '@react-native-async-storage/async-storage';

<Button 
  title="RESET APP" 
  onPress={async () => {
    await AsyncStorage.clear();
    console.log('✅ Cleared all data');
    // Reload app
  }}
/>
```

### Option 2: ADB Command

```bash
# Clear app data via ADB
adb shell pm clear com.habitguard.wellbeing

# Restart app
adb shell am start -n com.habitguard.wellbeing/.MainActivity
```

### Option 3: Device Settings

1. Go to Settings > Apps
2. Find "HabitGuard" 
3. Tap "Storage"
4. Tap "Clear Data"
5. Reopen app

## 📊 Expected Flow Chart

```
App Launch
    ↓
Load _layout.tsx
    ↓
useEffect → checkAppState()
    ↓
Check AsyncStorage
    ↓
Get permission status
    ↓
    ├─ First Launch? YES
    │   ↓
    │   Show ONBOARDING
    │   
    ├─ Onboarding Not Complete? YES
    │   ↓
    │   Show ONBOARDING
    │
    ├─ Missing Permissions? YES
    │   ↓
    │   Show ONBOARDING
    │
    └─ All Permissions OK? YES
        ↓
        Check Authentication
        ↓
        ├─ Not Authenticated? YES
        │   ↓
        │   Show LOGIN
        │
        └─ Authenticated? YES
            ↓
            Show MAIN APP
```

## 🎯 What to Look For in Logs

### Good Flow (First Time):
```
🚀 App starting - checking state...
📋 Permission status: { isFirstLaunch: true, hasCompletedOnboarding: false }
🔔 Notification permission: false
📊 Usage access permission: false
⚠️ Permissions missing or onboarding incomplete - showing onboarding
  - First launch: true
  - Onboarding complete: false
  - Notifications: false
  - Usage access: false
```

### Good Flow (After Permissions):
```
🚀 App starting - checking state...
📋 Permission status: { isFirstLaunch: false, hasCompletedOnboarding: true }
🔔 Notification permission: true
📊 Usage access permission: true
✅ All permissions granted, checking authentication...
🔐 Authentication status: false
⚠️ Not authenticated - will show login screen
```

### Good Flow (Logged In):
```
🚀 App starting - checking state...
📋 Permission status: { isFirstLaunch: false, hasCompletedOnboarding: true }
🔔 Notification permission: true
📊 Usage access permission: true
✅ All permissions granted, checking authentication...
🔐 Authentication status: true
✅ Authenticated - will show main app
```

## ❌ Common Issues

### Issue 1: Stuck on Black Screen
**Cause:** Error in checkAppState
**Check:** Look for error logs: `❌ Error checking app state:`
**Fix:** Check that services are properly imported

### Issue 2: Shows Main App Immediately
**Cause:** AsyncStorage has old data
**Check:** Look for stored keys
**Fix:** Clear app data

### Issue 3: Onboarding Doesn't Show
**Cause:** hasCompletedOnboarding is true
**Check:** Log shows `Onboarding complete: true`
**Fix:** Clear AsyncStorage key `habitguard_onboarding_complete`

### Issue 4: Login Doesn't Show After Onboarding
**Cause:** isAuthenticated is true somehow
**Check:** Log shows `Authentication status: true`
**Fix:** Clear AsyncStorage key `auth_token`

## 🔄 Quick Test Script

Copy this into Metro bundler console:

```javascript
// TEST 1: Check current storage
AsyncStorage.getAllKeys().then(keys => console.log('Keys:', keys));

// TEST 2: Check specific values
AsyncStorage.multiGet([
  'habitguard_first_launch',
  'habitguard_onboarding_complete', 
  'habitguard_permissions',
  'auth_token'
]).then(values => console.log('Values:', values));

// TEST 3: Reset everything
AsyncStorage.clear().then(() => console.log('Cleared!'));
```

## ✅ Success Criteria

After fix, you should see:

1. **First open:** Onboarding screen
2. **After onboarding:** Login screen
3. **After login:** Main app
4. **Close & reopen:** Main app directly (no onboarding/login)

## 📞 Still Not Working?

Check these in order:

1. ✅ Metro bundler is running
2. ✅ No red error screens
3. ✅ Console shows the logs
4. ✅ Files exist: login.tsx, signup.tsx, OnboardingScreen.tsx
5. ✅ Services are imported correctly
6. ✅ No TypeScript errors

If still stuck, run:
```bash
# Clear all
cd android && ./gradlew clean && cd ..
npm start -- --reset-cache
```

Then uninstall and reinstall the app.
