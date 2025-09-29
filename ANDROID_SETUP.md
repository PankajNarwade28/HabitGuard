# Android SDK Setup Guide

## 🎉 IMMEDIATE SOLUTION - Your APK is Ready!

**Your development build is complete! Download here:**
**https://expo.dev/artifacts/eas/s5QRTBAYiWvupq96hrXQge.apk**

### Quick USB Installation (5 minutes)
1. **Download APK** from link above
2. **Connect Android device** via USB
3. **Copy APK** to device Downloads folder
4. **Install** by tapping APK file
5. **Enable usage access**: Settings → Apps → Special access → Usage access → HabitGuard ON
6. **Run dev server**: `npx expo start --dev-client`
7. **Connect**: Shake device → Connect to Dev Server → Scan QR

---

## Issue
The error `'adb' is not recognized as an internal or external command` occurs because the Android SDK is not properly installed or configured.

## Fix Options

### Option 1: Use EAS Build (Recommended)
Instead of local Android development, use EAS Build which handles all Android compilation in the cloud:

```bash
# Build for development (with usage access)
npx eas build --platform android --profile development

# Build for production
npx eas build --platform android --profile production
```

### Option 2: Install Android Studio (Full Setup)
1. Download and install Android Studio from https://developer.android.com/studio
2. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Virtual Device (if you want emulator)

3. Set environment variables:
   ```bash
   # Add to Windows Environment Variables
   ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
   ```

4. Restart your terminal/VS Code

### Option 3: Quick SDK-only Install
1. Download Android command line tools from https://developer.android.com/studio#command-tools
2. Extract to a folder (e.g., C:\Android\cmdline-tools)
3. Set ANDROID_HOME environment variable
4. Install required packages:
   ```bash
   sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
   ```

## Recommended Approach
For this HabitGuard project, **use the ready development build** since it:
- ✅ Already built and ready to download
- ✅ Works without local Android SDK setup
- ✅ Provides real usage access permissions
- ✅ Includes development debugging features
- ✅ No 4GB+ Android Studio download needed

## Current Status
- ✅ App compiles successfully with Expo
- ✅ All dependencies resolved
- ✅ EAS Build configuration working
- ✅ **Development APK ready for download**
- ❌ Local Android development needs SDK setup (optional)

## Next Steps
1. For development: Continue using `npx expo start` with Expo Go
2. For APK builds: Use `npx eas build --platform android`
3. For local Android development: Install Android Studio (optional)