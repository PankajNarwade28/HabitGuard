# 📱 HabitGuard - Complete USB Android Setup Guide

## 🎉 Your Development APK is Ready!

**Latest Build URL**: https://expo.dev/artifacts/eas/srrWwhqjRhEGcC4nWvm5zT.apk
**Build ID**: d61b2f7e-9563-4373-b309-faae0fc266ad

---

## 🚀 Method 1: Direct USB Installation (Recommended)

### Step 1: Download APK to Computer
```bash
# Option A: Download via browser
# Go to: https://expo.dev/artifacts/eas/srrWwhqjRhEGcC4nWvm5zT.apk

# Option B: Download via command line (if curl is available)
curl -o HabitGuard-dev.apk https://expo.dev/artifacts/eas/srrWwhqjRhEGcC4nWvm5zT.apk
```

### Step 2: Prepare Android Device
1. **Enable Developer Options**:
   - Settings → About Phone → Tap "Build Number" 7 times
   
2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging → ON
   
3. **Allow Installation from Unknown Sources**:
   - Settings → Security → Unknown Sources → ON
   - OR Settings → Apps → Special Access → Install Unknown Apps

### Step 3: Transfer via USB
1. **Connect your Android device** to computer via USB cable
2. **Select "File Transfer" mode** when prompted on device
3. **Copy the APK file** to your device's:
   - Downloads folder, OR
   - Internal Storage root, OR
   - Any easily accessible folder

### Step 4: Install on Device
1. **Open File Manager** on your Android device
2. **Navigate to** where you copied the APK
3. **Tap the APK file** to install
4. **Allow installation** when prompted
5. **Wait for installation** to complete

### Step 5: Enable Usage Access Permission
1. **Settings → Apps → Special access → Usage access**
2. **Find "HabitGuard"** in the list
3. **Toggle it ON** (should show "Permitted")
4. **Alternative path**: Settings → Privacy → Special permissions → Usage access

### Step 6: Start Development Server
```bash
# Navigate to project directory
cd C:\Projects\HabitGuard

# Start development server
npx expo start --dev-client
```

### Step 7: Connect Device to Dev Server
1. **Open HabitGuard app** on your device
2. **Shake the device** to open developer menu
3. **Tap "Connect to Dev Server"**
4. **Scan QR code** from your terminal OR
5. **Enter URL manually**: `habitguard://expo-development-client/?url=http://192.168.0.105:8081`

---

## 🔧 Method 2: ADB Installation (Advanced)

### Prerequisites
- Android Studio installed with ADB
- USB Debugging enabled on device

### Steps
```bash
# Verify device connection
adb devices

# Install APK directly via ADB
adb install HabitGuard-dev.apk

# Launch the app
adb shell am start -n com.habitguard/.MainActivity
```

---

## 🐛 Troubleshooting

### Issue: "App not installed" Error
**Solutions**:
- Uninstall any previous version of HabitGuard
- Clear Package Installer cache
- Try installing from different folder location

### Issue: "Unknown sources blocked"
**Solutions**:
- Enable "Install unknown apps" for your file manager
- Use a different file manager app
- Install via ADB instead

### Issue: Usage Access not working
**Solutions**:
- Restart device after enabling permission
- Clear HabitGuard app cache and data
- Try alternative permission path: Settings → Digital Wellbeing → Usage access

### Issue: Dev server connection fails
**Solutions**:
- Ensure device and computer on same WiFi network
- Check Windows Firewall isn't blocking port 8081
- Try entering IP address manually in app

---

## ✅ Verification Steps

### 1. Check App Installation
- HabitGuard should appear in your app drawer
- App icon should be visible

### 2. Check Usage Access
- Go to Settings → Apps → Special access → Usage access
- HabitGuard should show "Permitted"

### 3. Check Real Data
- Open HabitGuard
- Home screen should show real app names (not just mock data)
- Usage times should reflect your actual device usage

### 4. Check Dev Connection
- App should connect to development server
- Code changes should hot-reload on device
- Console logs should appear in terminal

---

## 🎯 Expected Results

Once properly set up, you should have:
- ✅ **Real device testing** with actual usage statistics
- ✅ **Hot reload** functionality for development
- ✅ **Full debugging** capabilities
- ✅ **Usage access permissions** working correctly
- ✅ **Live development** environment on physical device

---

## 🔄 Development Workflow

After initial setup:
1. **Make code changes** in VS Code
2. **Save files** (auto hot-reload)
3. **See changes instantly** on your device
4. **Debug via Chrome DevTools** if needed
5. **Test real usage access** functionality

This gives you the complete USB Android development experience with real device capabilities!