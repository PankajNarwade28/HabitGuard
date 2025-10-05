# 🧪 Quick Test Guide - Three New Features

## ✅ Features to Test

1. **Direct App-Specific Usage Access** - Opens HabitGuard's toggle directly
2. **Mandatory Notification Permission** - Cannot skip
3. **Setup Complete Notification** - Acknowledgment message

---

## 🎯 Test 1: Direct App-Specific Navigation

### Steps:
1. Open HabitGuard app
2. Go to onboarding (or permission modal)
3. Click **"Grant Usage Access"**

### Expected Result:
**Method 1 Success (Best Case):**
```
✅ Opens: HabitGuard's usage access toggle directly
✅ See: Toggle switch for HabitGuard
✅ Action: Just toggle it ON
✅ No need to search in list
```

**Method 4 Fallback (Still Good):**
```
✅ Opens: Usage Access list
✅ See: List of all apps
✅ Action: Find HabitGuard, toggle ON
```

### Console Output:
```
📱 Opening HabitGuard-specific Usage Access Settings...
📦 Package name: com.habitguard.wellbeing
🔄 Method 1: Direct app-specific usage access
✅ Successfully opened settings
```

### Pass Criteria:
- [ ] Settings page opens
- [ ] Can find HabitGuard easily
- [ ] Can enable the toggle
- [ ] Returns to app after enabling
- [ ] Permission granted ✅

---

## 🎯 Test 2: Mandatory Notification Permission

### Steps:
1. Open HabitGuard app
2. Go to onboarding (first step)
3. Click **"Grant Notifications"**
4. **Deny** the system permission prompt

### Expected Result:
```
❌ Permission denied
    ↓
Alert appears:
┌─────────────────────────────────────┐
│  Permission Required                │
├─────────────────────────────────────┤
│  Notifications are required to keep │
│  you informed about your screen     │
│  time goals and send helpful        │
│  reminders. Please grant permission │
│  to continue.                       │
│                                     │
│  [Cancel]         [Try Again]       │
└─────────────────────────────────────┘

NO "Skip" or "Continue" button! ✅
```

### Then:
5. Click **"Try Again"**
6. **Allow** the permission this time

### Expected Result:
```
✅ Permission granted
✅ Moves to next step (Usage Access)
```

### Pass Criteria:
- [ ] Cannot skip notification permission
- [ ] No "Continue" button when denied
- [ ] Only shows "Cancel" and "Try Again"
- [ ] Must grant permission to proceed
- [ ] Moves to next step after granting ✅

---

## 🎯 Test 3: Setup Complete Notification

### Steps:
1. Open HabitGuard app
2. Complete onboarding:
   - Grant notification permission ✅
   - Grant usage access permission ✅
3. Click **"Complete Setup"** or **"Start My Wellness Journey"**

### Expected Result:
```
Notification appears immediately:

┌─────────────────────────────────────┐
│  🎉 HabitGuard Setup Complete!      │
├─────────────────────────────────────┤
│  All permissions granted! We're now │
│  tracking your screen time to help  │
│  you build better digital habits.   │
└─────────────────────────────────────┘
```

### Notification Properties:
- ✅ **Visible**: Shows in notification shade
- ✅ **Dismissable**: Can swipe away
- ✅ **Sound**: Plays notification sound
- ✅ **Priority**: High (appears at top)

### Pass Criteria:
- [ ] Notification appears after setup complete
- [ ] Shows correct title and message
- [ ] Has emoji (🎉)
- [ ] Can be dismissed/swiped away
- [ ] Plays sound
- [ ] Visible in notification shade ✅

---

## 📊 Full Test Flow

### Complete User Journey:
```
1. Open app (first launch)
   ↓
2. Welcome screen
   ↓
3. Notification Permission
   → Click "Grant Notifications"
   → System prompt appears
   → Try denying: See "Permission Required" alert
   → No skip button ✅
   → Click "Try Again"
   → Allow permission ✅
   ↓
4. Usage Access Permission
   → Click "Grant Usage Access"
   → Opens HabitGuard's toggle directly ✅
   → Toggle it ON
   → Return to app
   ↓
5. Setup Complete
   → Click "Complete Setup"
   → Notification appears: "🎉 Setup Complete!" ✅
   → Can dismiss notification
   ↓
6. App home screen
   → Start using HabitGuard! 🎉
```

---

## 🔍 What to Check

### Console Logs:
```bash
# Direct Navigation
📱 Opening HabitGuard-specific Usage Access Settings...
📦 Package name: com.habitguard.wellbeing
🔄 Method 1: Direct app-specific usage access
✅ Successfully opened settings

# Setup Complete
✅ Setup complete notification sent
```

### Notification Shade:
- Pull down notification shade
- Should see: "🎉 HabitGuard Setup Complete!"
- Can swipe to dismiss

### Alert Messages:
- **When denying notification**: "Permission Required" (NOT "Permission Denied")
- **Buttons**: "Cancel" and "Try Again" (NO "Skip" or "Continue")

---

## ✅ Success Checklist

### Feature 1: Direct Navigation
- [ ] Opens HabitGuard's toggle directly (Method 1-3)
- [ ] OR opens usage access list (Method 4)
- [ ] Can easily find and enable HabitGuard
- [ ] Permission granted successfully

### Feature 2: Mandatory Permission
- [ ] Cannot skip notification permission
- [ ] Must grant to proceed
- [ ] Alert shows "Try Again" (not "Skip")
- [ ] Moves forward only after granting

### Feature 3: Acknowledgment Notification
- [ ] Notification appears after setup
- [ ] Shows correct message
- [ ] Is dismissable
- [ ] Plays sound

---

## 🐛 Troubleshooting

### If Usage Access doesn't open to HabitGuard:
- **Check console**: Which method succeeded?
- **Method 1-3 failed**: Device may not support app-specific navigation
- **Method 4 succeeded**: Opens list (still works, just need to find HabitGuard)
- **All methods failed**: Very rare, check console for errors

### If notification permission can be skipped:
- **Check**: OnboardingScreen.tsx line 92-110
- **Should NOT have**: "Continue" button
- **Should have**: "Cancel" and "Try Again"

### If setup notification doesn't appear:
- **Check**: Notification permission is granted
- **Check console**: "✅ Setup complete notification sent"
- **Try**: Pull down notification shade manually
- **Wait**: May take 1-2 seconds to appear

---

## 🎉 Expected Results

### All Tests Passing:
- ✅ Usage Access opens to HabitGuard (or list)
- ✅ Cannot skip notification permission
- ✅ Notification appears after setup
- ✅ Notification is dismissable
- ✅ Console logs are clean
- ✅ User journey is smooth

### Ready for Production! 🚀

**Time to test**: ~5-7 minutes
**Difficulty**: Easy
**Impact**: High (better UX, higher completion rate)

---

## 📝 Quick Test Script

```bash
1. Clear app data (or uninstall/reinstall)
2. Open HabitGuard
3. Deny notification → See "Try Again" ✅
4. Grant notification → Moves to next step ✅
5. Grant usage access → Opens HabitGuard toggle ✅
6. Complete setup → Notification appears ✅
7. Dismiss notification → Works ✅

Total time: 3-5 minutes
```

**All features working? You're ready to go!** 🎉
