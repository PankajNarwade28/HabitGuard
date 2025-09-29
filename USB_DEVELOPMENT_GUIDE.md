# HabitGuard - USB Android Development Guide

## 🚀 Current Status
✅ Development build is being created with EAS Build  
✅ expo-dev-client installed for real device development  
✅ Real usage access permissions will work in this build  

## 📱 Method 1: EAS Development Build (Recommended)

### What's Happening Now
Your development APK is being built in the cloud. Once complete:

1. **Download the APK** from the EAS build URL
2. **Enable USB File Transfer** on your Android device
3. **Transfer APK** to your device via USB cable
4. **Install** by tapping the APK file
5. **Enable usage access** in Android Settings → Apps → Special Access → Usage Access

### Benefits
- ✅ No local Android SDK setup required
- ✅ Real usage access permissions work
- ✅ Development debugging capabilities
- ✅ Hot reload and development features
- ✅ Works on any device without complexity

## 📱 Method 2: Local USB Development (Advanced)

If you want to run `npx expo run:android --device`, you need:

### Prerequisites
1. **Install Android Studio** (4GB+ download)
2. **Configure Android SDK** and environment variables
3. **Enable USB Debugging** on your device
4. **Install device drivers** (if needed)

### Setup Steps
```bash
# 1. Install Android Studio from:
# https://developer.android.com/studio

# 2. Add to Windows Environment Variables:
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools

# 3. Restart terminal, then verify:
adb devices

# 4. Connect device and run:
npx expo run:android --device
```

## 🎯 Recommended Workflow

### For USB Testing (Easy Way)
1. **Wait for EAS build** to complete (~5-10 minutes)
2. **Download APK** to your computer
3. **Copy via USB** to your device's Downloads folder
4. **Install APK** by tapping it
5. **Connect via dev server**: Open app → shake device → connect to dev server

### For Development
1. **Use the development build** installed on your device
2. **Run dev server**: `npx expo start --dev-client`
3. **Connect**: Scan QR or shake device to connect
4. **Code changes** will hot reload on your physical device

## 🔧 Current Build Progress

Your development build is currently being created. You can:

1. **Monitor progress**: Check your terminal for build completion
2. **Open EAS dashboard**: Visit https://expo.dev/accounts/pankaj2580/projects/habitguard-wellbeing/builds
3. **Download when ready**: The APK will be available for download

## 💡 Why This Approach is Better

Compared to local Android setup:
- ⚡ **Faster**: No 4GB+ Android Studio download
- 🔐 **Secure**: Proper signing and permissions
- 🚀 **Reliable**: Cloud build environment is consistent
- 🛠️ **Full features**: All development tools work
- 📱 **Real device**: True usage access permissions

## 🔄 Development Cycle

Once you have the development build installed:

1. **Make code changes** in VS Code
2. **Run**: `npx expo start --dev-client`
3. **Connect device** to dev server
4. **See changes instantly** via hot reload
5. **Test real usage access** permissions

This gives you the best of both worlds: real device testing with fast development iteration!