@echo off
echo Installing minimal Android SDK for Expo development...

echo.
echo Step 1: Download Android Command Line Tools
echo Go to: https://developer.android.com/studio#command-tools
echo Download: commandlinetools-win-11076708_latest.zip

echo.
echo Step 2: Extract and setup
echo 1. Extract to C:\Android\cmdline-tools\latest\
echo 2. Set environment variables:

echo.
echo ANDROID_HOME=C:\Android
echo PATH=%PATH%;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools

echo.
echo Step 3: Install required packages
echo Run these commands after setting up:
echo.
echo sdkmanager "platform-tools"
echo sdkmanager "platforms;android-34"
echo sdkmanager "build-tools;34.0.0"

echo.
echo Step 4: Verify installation
echo adb --version

echo.
echo Step 5: Then you can run:
echo npx expo run:android

pause