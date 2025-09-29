# HabitGuard - USB Android Development Setup

## Quick Setup for USB Debugging

### Step 1: Install Android Studio (Required)
1. Download Android Studio from: https://developer.android.com/studio
2. Install with these components:
   - Android SDK
   - Android SDK Platform-Tools
   - Intel x86 Emulator (optional)

### Step 2: Set Environment Variables
Add these to Windows Environment Variables:
```
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools\bin
```

### Step 3: Enable Developer Options on Your Phone
1. Go to **Settings** → **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** → **Developer Options**
4. Enable **USB Debugging**
5. Enable **Install via USB** (if available)

### Step 4: Connect Your Device
1. Connect your Android device via USB
2. Allow USB debugging when prompted on phone
3. Run: `adb devices` to verify connection

### Step 5: Build Development APK (Recommended)
Since you need usage access permissions, use EAS Build for development:

```bash
# This creates a development build that can access real device data
npx eas build --platform android --profile development --local
```

### Alternative: Direct USB Install (After Android Studio Setup)
```bash
# Install development build directly to USB device
npx expo run:android --device
```

## Current Issue
The error occurs because:
- Android SDK is not installed (`adb` command not found)
- Expo CLI can't communicate with Android devices
- Missing development build configuration

## Recommended Solution
**Use EAS Build for development** - it's faster and handles all Android complexities:

1. **Build development APK**:
```bash
npx eas build --platform android --profile development
```

2. **Download and install** the APK from the EAS dashboard

3. **Enable usage access** in Android settings

This approach:
- ✅ Works without local Android SDK setup
- ✅ Provides real device usage access
- ✅ Handles signing and permissions automatically
- ✅ Much faster than setting up full Android environment

## If You Prefer Local Development
Install Android Studio first, then restart your terminal and run:
```bash
npx expo run:android --device
```