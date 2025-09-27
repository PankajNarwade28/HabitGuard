# HabitGuard - Build Instructions for Real Device Testing

## 🎯 **Why Build is Needed**

Expo Go cannot access:
- Android Usage Stats (screen time data)
- iOS Screen Time API
- System-level permissions

To test real usage access, you need to build a development APK.

## 🚀 **Method 1: EAS Build (Easiest)**

### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 2: Configure EAS
```bash
cd c:\Projects\HabitGuard\HabitGuard
eas login
eas build:configure
```

### Step 3: Build Development APK
```bash
# For Android development build
eas build --platform android --profile development

# For iOS development build (requires Apple Developer account)
eas build --platform ios --profile development
```

### Step 4: Install on Device
- Download the APK from the EAS dashboard
- Install on your Android device
- Grant Usage Access permission manually

## 🔧 **Method 2: Local Build with Expo Dev Client**

### Step 1: Create Development Build
```bash
# Install dev client
npx expo install expo-dev-client

# Create local build
npx expo run:android
```

### Step 2: Enable Usage Access
1. Install the development APK
2. Go to Settings → Apps → Special app access → Usage access
3. Find "HabitGuard" and enable it
4. Return to app - it will now show real data

## 📱 **Method 3: Production Build Testing**

### Step 1: Build for Production
```bash
# Build production APK
eas build --platform android --profile production
```

### Step 2: Test on Device
- Install production APK
- Grant all permissions
- Test full functionality

## 🛠️ **Alternative: Mock Real Data**

If you want to test the UI without building, you can:

1. **Enable Demo Mode with Realistic Data**
2. **Test Permission Flow UI**
3. **Verify Data Processing Logic**

Run this command to test:
```bash
node debug-permission-flow.js
```

## 📋 **Current Status**

- ✅ App UI/UX working perfectly
- ✅ Permission flow implemented
- ✅ Data processing ready
- ⚠️ Needs native build to access real usage data
- ⚠️ Expo Go cannot access system usage stats

## 🎯 **Recommended Next Steps**

1. **For UI Testing**: Continue with Expo Go + demo data
2. **For Real Data**: Build development APK with EAS
3. **For Production**: Build signed APK for distribution

Choose based on your testing needs!