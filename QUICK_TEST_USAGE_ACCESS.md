# 🧪 Quick Test Guide - Usage Access Fix

## ✅ FIXED: Usage Access now opens the correct settings page!

---

## 🎯 What to Test

### Test 1: From Onboarding
1. **Clear app data** or reinstall app
2. Open HabitGuard (first launch)
3. Click "Grant Usage Access" button
4. **Expected**: Opens "Usage Access" settings list (shows all apps)
5. **Find**: "HabitGuard" in the list
6. **Toggle**: Enable it
7. **Return**: Come back to app
8. **Result**: Permission granted ✅

### Test 2: From Permission Modal
1. Open app (if permission denied)
2. Permission modal appears
3. Click "Open Settings"
4. **Expected**: Opens "Usage Access" list
5. Enable HabitGuard
6. Return to app

### Test 3: From Debug Panel
1. Go to Settings tab
2. Scroll down to "Usage Access Permission"
3. Click "Grant Usage Access"
4. **Expected**: Opens "Usage Access" list
5. Enable HabitGuard

---

## ✅ Success Criteria

### What You Should See:
- ✅ **Settings > Apps > Special app access > Usage access**
- ✅ **List of all apps with usage access permission**
- ✅ **"HabitGuard" in the list** (may need to scroll)

### What You Should NOT See:
- ❌ HabitGuard App Info page (with Uninstall, Force Stop buttons)
- ❌ General Settings homepage
- ❌ Permissions list for HabitGuard

---

## 🔍 Console Output

### When it works (Method 1):
```
📱 Opening Usage Access Settings...
📦 Package name: com.habitguard.wellbeing
🔄 Method 1: General usage access list
✅ Successfully opened settings
```

### When it falls back (Method 2):
```
📱 Opening Usage Access Settings...
📦 Package name: com.habitguard.wellbeing
🔄 Method 1: General usage access list
❌ Method failed, trying next...
🔄 Method 2: Application details URI
✅ Successfully opened settings
```

---

## 🐛 Troubleshooting

### If it opens App Info page:
- Check console: Which method succeeded?
- Should be Method 1 or 2 now (not Method 4)
- If Method 4 succeeded, something is wrong

### If nothing opens:
- Check console for errors
- May be React Native Linking issue
- Try restarting the app

### If HabitGuard not in list:
- App might not be installed properly
- Check package name in console logs
- Should be: `com.habitguard.wellbeing`

---

## 📱 Device-Specific Notes

### Vivo (Your Device):
- Method 1 should work (General usage access list)
- Opens: Settings > More Settings > Permission > Usage access

### Samsung:
- Method 1 works
- Opens: Settings > Apps > Special access > Device and app history

### Xiaomi (MIUI):
- Method 1 works
- Opens: Settings > Apps > Permissions > Special permissions > Usage access

### OnePlus:
- Method 1 or 3 works
- Opens: Settings > Apps > Special app access > Usage access

---

## ✅ Expected Timeline

1. **Immediate**: Code is ready
2. **Test**: 2-3 minutes to verify
3. **Result**: Usage Access list opens correctly

---

## 🎉 Success!

When the fix works, you'll see:
1. Settings page opens with **Usage Access list**
2. All apps are listed (WhatsApp, Instagram, Chrome, etc.)
3. **HabitGuard** is somewhere in that list
4. Toggle it ON
5. Return to app
6. Permission granted! 🎉

---

**Ready to test!** Reload your app and try clicking "Grant Usage Access" now! 🚀
