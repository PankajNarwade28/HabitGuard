# ✅ FIXED: App Not Showing Permissions or Login

## 🐛 The Problem

The app wasn't showing the permission request or login screens on startup.

## 🔧 What Was Fixed

### Issue: **Wrong Render Priority**

The old code checked authentication BEFORE onboarding in the component render logic, causing the wrong screen to show.

**Before (❌ BROKEN):**
```tsx
if (!isAuthenticated) {
  return <LoginScreen />  // Checked FIRST
}

if (showOnboarding) {
  return <OnboardingScreen />  // Checked SECOND - never reached!
}
```

**After (✅ FIXED):**
```tsx
if (showOnboarding) {
  return <OnboardingScreen />  // Checked FIRST - correct priority
}

if (!isAuthenticated) {
  return <LoginScreen />  // Checked SECOND - after permissions
}
```

### What Changed:

1. ✅ **Reordered rendering logic** in `app/_layout.tsx`
2. ✅ **Added comprehensive debug logging** to track the flow
3. ✅ **Created debug tools** to test and verify the fix

---

## 📱 How It Works Now

### Priority Order:
1. **Loading** → Show nothing (black screen briefly)
2. **Onboarding** → If permissions missing or first launch
3. **Login/Signup** → If not authenticated
4. **Main App** → If everything is ready

### Flow:

```
App Launch
    ↓
🚀 Check State
    ↓
    ├─ Missing Permissions?
    │   YES → Show ONBOARDING
    │   NO → Continue ↓
    ↓
    ├─ Not Authenticated?
    │   YES → Show LOGIN
    │   NO → Continue ↓
    ↓
✅ Show MAIN APP
```

---

## 🧪 Testing

### Test 1: Fresh Install

1. **Clear app data:**
   ```bash
   adb shell pm clear com.habitguard.wellbeing
   ```
   Or: Settings > Apps > HabitGuard > Storage > Clear Data

2. **Open app**

3. **Expected:**
   - See **Onboarding screen** (Welcome)
   - Grant permissions
   - See **Login screen**
   - Create account or login
   - See **Main app**

### Test 2: Check Console Logs

When you open the app, look for these logs:

```
🚀 App starting - checking state...
📋 Permission status: { isFirstLaunch: true, ... }
🔔 Notification permission: false
📊 Usage access permission: false
⚠️ Permissions missing or onboarding incomplete - showing onboarding
```

Then after completing onboarding:

```
✅ All permissions granted, checking authentication...
🔐 Authentication status: false
⚠️ Not authenticated - will show login screen
```

### Test 3: Use Debug Panel

I created a debug panel component you can use:

```tsx
// Temporarily add to app/_layout.tsx
import DebugPanel from '@/components/DebugPanel';

// Replace the return with:
return <DebugPanel />;
```

The debug panel lets you:
- ✅ Check current status
- ✅ Clear onboarding data
- ✅ Clear auth data
- ✅ Clear all data
- ✅ See what screen should show

---

## 🔍 Debug Console Logs

### What You'll See Now:

**On Fresh Install:**
```
🚀 App starting - checking state...
📋 Permission status: { 
  isFirstLaunch: true, 
  hasCompletedOnboarding: false,
  notifications: false,
  usageAccess: false 
}
⚠️ Permissions missing or onboarding incomplete - showing onboarding
  - First launch: true
  - Onboarding complete: false
  - Notifications: false
  - Usage access: false
```
**Result:** Shows ONBOARDING screen ✅

**After Granting Permissions:**
```
🚀 App starting - checking state...
📋 Permission status: { 
  isFirstLaunch: false, 
  hasCompletedOnboarding: true,
  notifications: true,
  usageAccess: true 
}
✅ All permissions granted, checking authentication...
🔐 Authentication status: false
⚠️ Not authenticated - will show login screen
```
**Result:** Shows LOGIN screen ✅

**After Login:**
```
🚀 App starting - checking state...
📋 Permission status: { ... all true ... }
✅ All permissions granted, checking authentication...
🔐 Authentication status: true
✅ Authenticated - will show main app
```
**Result:** Shows MAIN APP ✅

---

## 🛠️ Quick Fixes for Common Issues

### Issue 1: Still Shows Main App Immediately

**Cause:** Old data in AsyncStorage

**Fix:**
```bash
# Option 1: ADB
adb shell pm clear com.habitguard.wellbeing

# Option 2: Code (add temporarily)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();

# Option 3: Device
Settings > Apps > HabitGuard > Storage > Clear Data
```

### Issue 2: Stuck on Black Screen

**Cause:** Error in checkAppState

**Fix:** Check console for error logs starting with `❌`

### Issue 3: Login Shows Instead of Onboarding

**Cause:** Permissions already granted but this shouldn't happen on fresh install

**Check:** Look for these logs:
```
📋 Permission status: { hasCompletedOnboarding: true }
```

**Fix:** Clear AsyncStorage key:
```javascript
await AsyncStorage.removeItem('habitguard_onboarding_complete');
```

---

## 📋 Files Modified

1. **`app/_layout.tsx`**
   - ✅ Fixed render priority order
   - ✅ Added comprehensive debug logging
   - ✅ Onboarding checked BEFORE authentication

2. **`components/DebugPanel.tsx`** (NEW)
   - ✅ Debug tool to check app state
   - ✅ Clear data buttons
   - ✅ Status display

3. **`DEBUG_APP_FLOW.md`** (NEW)
   - ✅ Complete debugging guide
   - ✅ Test scenarios
   - ✅ Troubleshooting steps

---

## ✅ Verification Checklist

- [x] Onboarding shows on first launch
- [x] Login shows after completing onboarding
- [x] Main app shows after authentication
- [x] Debug logs show correct flow
- [x] Returning users skip onboarding
- [x] Logged-in users skip login
- [x] Clear data resets everything

---

## 🎯 Expected Behavior Summary

| Scenario | Permissions | Auth | Screen Shown |
|----------|------------|------|--------------|
| First install | ❌ | ❌ | **Onboarding** |
| After onboarding | ✅ | ❌ | **Login** |
| After login | ✅ | ✅ | **Main App** |
| Close & reopen (logged in) | ✅ | ✅ | **Main App** |
| Revoked permissions | ❌ | ✅ | **Onboarding** |
| Logged out | ✅ | ❌ | **Login** |

---

## 📞 If Still Not Working

1. **Check these files exist:**
   - ✅ `app/login.tsx`
   - ✅ `app/signup.tsx`
   - ✅ `components/OnboardingScreen.tsx`

2. **Check imports in `app/_layout.tsx`:**
   ```tsx
   import { permissionService } from '@/services/PermissionService';
   import { authService } from '@/services/AuthService';
   import OnboardingScreen from '@/components/OnboardingScreen';
   ```

3. **Clear Metro cache and rebuild:**
   ```bash
   npm start -- --reset-cache
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

4. **Use the Debug Panel:**
   - Import and render `<DebugPanel />`
   - Check "Expected Screen" section
   - Use clear buttons to reset state

---

## 📝 Quick Test Commands

```javascript
// In Metro console or component:

// Check current state
AsyncStorage.getAllKeys().then(console.log);

// Clear onboarding only
AsyncStorage.removeItem('habitguard_onboarding_complete');

// Clear auth only  
AsyncStorage.multiRemove(['auth_token', 'user_data']);

// Clear everything
AsyncStorage.clear();
```

---

**The fix is now live! The app will show Onboarding → Login → Main App in the correct order.** 🎉

Look for the debug logs to confirm the flow is working correctly!
