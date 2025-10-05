# APK Build Guide for HabitGuard

## Quick Build Instructions

### Prerequisites
1. **Expo CLI**: Make sure you have Expo CLI installed
2. **EAS CLI**: Install EAS (Expo Application Services) for building
3. **Expo Account**: Create an account at expo.dev

### Installation Commands
```powershell
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI globally  
npm install -g eas-cli

# Login to your Expo account
npx expo login
```

### Build APK Steps

#### 1. Configure EAS Build
```powershell
# Navigate to project directory
cd c:\Projects\HabitGuard

# Initialize EAS configuration
eas build:configure
```

#### 2. Build APK for Android
```powershell
# Build development APK (faster, includes dev tools)
eas build --platform android --profile development

# OR build production APK (optimized for release)
eas build --platform android --profile production
```

#### 3. Download APK
- Once build completes, EAS will provide a download link
- You can also check builds at: https://expo.dev/accounts/[username]/projects/habitguard/builds

### Alternative: Local Build (if preferred)
```powershell
# For development build locally
npx expo run:android

# For APK generation locally (requires Android Studio)
cd android
.\gradlew assembleDebug
```

## Current App Status

### ✅ Implemented Features
- **Complete onboarding flow** with permission requests
- **India Standard Time (IST)** support for proper timezone
- **Monday-based weekly calculations** for charts
- **Daily streak tracking** with achievements system
- **Comprehensive app filtering** (system apps excluded)
- **Original app icons** and proper names
- **ML analysis system** for usage patterns
- **Enhanced UI** with cards and proper styling

### ⚠️ Known Issues
1. **Usage Stats Library**: `react-native-usage-stats` has method undefined errors
   - App will run but may not collect real usage data
   - Fallback to demo data is implemented

2. **Permissions**: Some features require actual device testing
   - Usage access permission works only on real Android device
   - Notification permissions need device testing

### 📱 Testing Recommendations
1. **Install APK on Android device** for full functionality
2. **Grant all permissions** when prompted during onboarding
3. **Test usage tracking** - may need alternative library
4. **Verify timezone** - should show India time correctly

### 🔧 Build Configuration
The app is configured with:
- **Target SDK**: Android 13+ (API 33+)
- **Minimum SDK**: Android 7+ (API 24+)
- **Permissions**: Usage Access, Notifications, Storage
- **Architecture**: ARM64, ARMv7 support

### 📊 Expected APK Size
- **Development Build**: ~50-80 MB
- **Production Build**: ~20-40 MB (optimized)

### 🚀 Next Steps After Build
1. Install APK on Android device
2. Complete onboarding flow
3. Grant usage access permission
4. Test daily tracking and streak functionality
5. Verify timezone displays correctly (India time)
6. Check ML analysis features work

---

**Note**: Due to usage stats library issues, the app includes fallback demo data to ensure all UI features work properly while we resolve the data collection integration.