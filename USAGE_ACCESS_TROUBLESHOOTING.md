# HabitGuard - Usage Access Troubleshooting Guide

## 🎉 Good News: Your App IS Working!
Your logs show the app is running and connected to your device successfully.

## ⚠️ Issue: Usage Access Permission Not Properly Enabled

### The Problem
The repeated log message `Please manually enable usage access in device settings` indicates the usage access permission isn't fully enabled.

## 🔧 Step-by-Step Fix

### Method 1: Complete Permission Setup
1. **Open Android Settings**
2. **Go to Apps** (or Application Manager)
3. **Find HabitGuard** in the app list
4. **Tap on HabitGuard**
5. **Look for "Permissions" or "App permissions"**
6. **Enable ALL permissions** (Storage, etc.)
7. **Go back to main Settings**
8. **Navigate to**: Settings → **Apps** → **Special access** → **Usage access**
9. **Find HabitGuard**
10. **Toggle it ON** (make sure it shows "Permitted")

### Method 2: Alternative Path
1. **Settings** → **Privacy**
2. **Special permissions** or **Advanced**
3. **Usage access** or **Device usage**
4. **Find HabitGuard** and **enable it**

### Method 3: Direct Access (Some Android versions)
1. **Settings** → **Security & Privacy**
2. **Privacy** → **Special access**
3. **Usage access**
4. **HabitGuard** → **Allow**

## 🔍 Verification Steps

### Check if Permission is Working
1. **Open HabitGuard app**
2. **Look for real app names** (Instagram, YouTube, etc.) instead of generic names
3. **Check if usage times** show real data instead of mock data

### If Still Not Working
1. **Completely uninstall** HabitGuard
2. **Restart your Android device**
3. **Reinstall** the APK
4. **Enable usage access BEFORE** opening the app for the first time

## 📱 Android Version Specific Instructions

### Android 13+ (Most Recent)
- Settings → Apps → Special app access → Usage access → HabitGuard → Allow

### Android 11-12
- Settings → Apps & notifications → Special app access → Usage access → HabitGuard → Allow

### Android 10 and below
- Settings → Apps → Advanced → Special app access → Usage access → HabitGuard → Allow

## 🚨 Common Issues & Solutions

### Issue: "Usage access" option not found
- **Solution**: Look for "Device usage", "App usage", or "Usage statistics" instead

### Issue: HabitGuard not in the usage access list
- **Solution**: 
  1. Open HabitGuard app first
  2. Go back to settings
  3. The app should now appear in the list

### Issue: Permission enabled but still showing mock data
- **Solution**:
  1. Force close HabitGuard app
  2. Clear app cache (Settings → Apps → HabitGuard → Storage → Clear Cache)
  3. Reopen the app

## 🔄 Test Real Data

Once properly enabled, you should see:
- **Real app names** (Instagram, WhatsApp, Chrome, etc.)
- **Actual usage times** from your device
- **Real unlock counts**
- **Proper daily/weekly statistics**

## 🆘 Emergency Fallback

If nothing works:
1. **Use in demo mode** - the app works with mock data
2. **Try a different Android device** if available
3. **Check Android version compatibility** (works best on Android 9+)

Your app is working correctly - it's just waiting for the proper usage access permission!