# 🔄 Updated App Flow - Permissions First, Then Authentication

## 📋 What Changed

The app flow has been updated to prioritize **permission requests (usage access)** before authentication. This ensures users grant necessary permissions before they can create an account or log in.

---

## 🎯 New App Flow

### On App Launch:

```
1. App Starts
   ↓
2. Check Usage Access Permission
   ↓
   ├─ NO → Show Onboarding (Request Permissions)
   │         ↓
   │    User Grants Permissions
   │         ↓
   │    Onboarding Complete
   │         ↓
   │    Check Authentication
   │         ↓
   │         ├─ NO → Show Login/Signup
   │         │        ↓
   │         │   User Logs In/Signs Up
   │         │        ↓
   │         └─ YES → Show Main App
   │
   └─ YES → Check Authentication
             ↓
             ├─ NO → Show Login/Signup
             │        ↓
             │   User Logs In/Signs Up
             │        ↓
             └─ YES → Show Main App
```

---

## 🔄 Detailed Flow

### First Time User (Never Opened App)

1. **App Opens**
   - Shows **Onboarding Screen**
   - Step 1: Welcome message

2. **Permission Request**
   - Step 2: Request Notification Permission
   - Step 3: Request Usage Access Permission (Required)

3. **After Permissions Granted**
   - Onboarding marks as complete
   - Checks if user is authenticated
   - Since new user: **Redirects to Login Screen**

4. **User Actions**
   - Can click "Sign Up" to create account
   - Or enter existing credentials to login

5. **After Login/Signup**
   - Token is stored
   - User redirected to **Main App (Tabs)**

### Returning User (Has Permissions, Not Logged In)

1. **App Opens**
   - Checks permissions: ✅ Already granted
   - Checks authentication: ❌ No token found

2. **Redirect to Login**
   - Shows **Login Screen** directly
   - User enters credentials

3. **After Login**
   - Redirected to **Main App (Tabs)**

### Returning User (Has Permissions, Logged In)

1. **App Opens**
   - Checks permissions: ✅ Already granted
   - Checks authentication: ✅ Token found

2. **Direct to Main App**
   - Shows **Main App (Tabs)** immediately
   - No onboarding, no login required

### User Who Denied Permissions Previously

1. **App Opens**
   - Checks permissions: ❌ Not granted
   - Shows **Onboarding Screen** again

2. **Request Permissions**
   - Must grant usage access to proceed
   - Can't skip usage access (required)

3. **After Permissions Granted**
   - Checks authentication
   - Redirects to Login if not authenticated
   - Or Main App if authenticated

---

## 🔧 Technical Changes

### 1. Updated `app/_layout.tsx`

**Before:**
```typescript
// Check authentication first
const authenticated = await authService.isAuthenticated();
if (!authenticated) {
  // Show login immediately
  return;
}
// Then check permissions
```

**After:**
```typescript
// Check permissions first
const hasPermissions = await checkPermissions();
if (!hasPermissions) {
  // Show onboarding immediately
  return;
}
// Then check authentication
const authenticated = await authService.isAuthenticated();
if (!authenticated) {
  // Show login
  return;
}
```

### 2. Updated `OnboardingScreen.tsx`

**Added:**
- Import `authService`
- Check authentication after completing onboarding
- Redirect to login if not authenticated
- Redirect to main app if authenticated

**Modified `completeOnboarding()` function:**
```typescript
async function completeOnboarding() {
  // ... mark onboarding complete
  
  // Check authentication
  const isAuthenticated = await authService.isAuthenticated();
  
  if (isAuthenticated) {
    router.replace('/(tabs)');  // Go to main app
  } else {
    router.replace('/login');   // Go to login
  }
}
```

---

## ✅ Benefits of This Approach

### 1. **Better User Experience**
- Users grant permissions before investing time in creating an account
- Prevents frustration of signing up, then discovering app can't work without permissions

### 2. **Logical Flow**
- Permissions are fundamental to app functionality
- Authentication is secondary (just for user data)
- Makes sense to request critical permissions first

### 3. **Prevents Incomplete Setup**
- Users can't access main app without both permissions AND authentication
- Ensures app always has necessary permissions to function

### 4. **Clear Progression**
1. ✅ Grant Permissions (App Can Work)
2. ✅ Login/Signup (User Identity)
3. ✅ Use App (Everything Ready)

---

## 🎨 User Journey Examples

### Example 1: Brand New User

```
Open App
  → Onboarding (Welcome)
  → Enable Notifications
  → Grant Usage Access ✅
  → See Login Screen
  → Click "Sign Up"
  → Fill Form & Submit
  → Account Created ✅
  → Redirected to Main App 🎉
```

### Example 2: Returning User (Logged Out)

```
Open App
  → Permissions Already Granted ✅
  → Not Authenticated ❌
  → See Login Screen
  → Enter Credentials
  → Login Successful ✅
  → Redirected to Main App 🎉
```

### Example 3: Active User

```
Open App
  → Permissions Already Granted ✅
  → Already Authenticated ✅
  → Directly to Main App 🎉
  (No onboarding, no login)
```

### Example 4: User Who Revoked Permissions

```
Open App
  → Check Permissions ❌
  → Back to Onboarding
  → Grant Permissions Again
  → Check Authentication ✅ (Still logged in)
  → Directly to Main App 🎉
```

---

## 🔐 Security & State Management

### Permission State
- Stored in: AsyncStorage
- Keys: `permission_status`, `onboarding_completed`
- Checked on: Every app launch

### Authentication State  
- Stored in: AsyncStorage
- Keys: `auth_token`, `user_data`
- Checked on: After permission check
- Validated: Token existence (can add expiry check)

### Priority Order
1. **Critical**: Usage Access Permission (App can't function without it)
2. **Important**: Notification Permission (Enhances experience)
3. **Required**: Authentication (User identification)

---

## 📱 Screen Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    APP LAUNCH                           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │ Check Permissions   │
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        Missing                   Granted
              │                     │
              ▼                     ▼
    ┌──────────────────┐   ┌──────────────────┐
    │  ONBOARDING      │   │ Check Auth       │
    │  SCREEN          │   └────────┬─────────┘
    │                  │            │
    │ 1. Welcome       │   ┌────────┴────────┐
    │ 2. Notifications │   │                 │
    │ 3. Usage Access  │  NO               YES
    │                  │   │                 │
    └────────┬─────────┘   │                 │
             │             │                 │
             ▼             ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ Permissions  │ │   LOGIN      │ │  MAIN APP    │
    │   Granted    │ │   SCREEN     │ │   (TABS)     │
    └──────┬───────┘ └──────┬───────┘ └──────────────┘
           │                │
           │                │
           ▼                │
    ┌──────────────┐       │
    │ Check Auth   │       │
    └──────┬───────┘       │
           │               │
    ┌──────┴───────┐       │
    │              │       │
   NO             YES      │
    │              │       │
    └──────┬───────┘       │
           │               │
           └───────┬───────┘
                   │
                   ▼
           ┌──────────────┐
           │   MAIN APP   │
           │    (TABS)    │
           └──────────────┘
```

---

## 🧪 Testing the New Flow

### Test Case 1: Fresh Install
1. Uninstall app (clear data)
2. Install and open app
3. **Expected**: See onboarding → Grant permissions → See login

### Test Case 2: After Granting Permissions
1. Grant all permissions
2. Complete onboarding
3. **Expected**: Redirected to login screen

### Test Case 3: After Signup/Login
1. Create account or login
2. **Expected**: Redirected to main app

### Test Case 4: Close and Reopen (Logged In)
1. Close app
2. Reopen app
3. **Expected**: Directly to main app (no onboarding, no login)

### Test Case 5: Logout
1. Logout from settings
2. Close and reopen app
3. **Expected**: See login screen (permissions already granted)

### Test Case 6: Revoke Permissions
1. Go to Android settings → Revoke usage access
2. Reopen app
3. **Expected**: Back to onboarding

---

## 📝 Summary

### What Happens Now:

1. **First Priority**: Get usage access permission (required for app to work)
2. **Second Priority**: Get user authentication (required for user data)
3. **Final Step**: Access main app features

### Key Points:

✅ Permissions requested BEFORE authentication  
✅ Can't skip usage access (it's required)  
✅ After permissions, checks if user needs to login  
✅ Smooth redirect flow from onboarding → login → main app  
✅ Returning users with permissions go straight to login  
✅ Returning users with permissions + auth go straight to main app  

### Files Modified:

1. `app/_layout.tsx` - Check permissions first, then auth
2. `components/OnboardingScreen.tsx` - Redirect to login after onboarding if not authenticated

---

**The app now has a logical flow: Permissions → Authentication → App Access** 🎉
