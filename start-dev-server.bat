@echo off
REM HabitGuard Development Server Start Script for Windows

echo 🚀 Starting HabitGuard Development Server for USB Device
echo.
echo 📋 Prerequisites:
echo   ✅ Development APK installed on your Android device
echo   ✅ Device connected to same WiFi network
echo   ✅ USB debugging enabled (optional)
echo.
echo 🔄 Starting Expo dev server...
echo.

REM Start Expo development client server
npx expo start --dev-client

echo.
echo 📱 To connect your device:
echo   1. Open HabitGuard app on your device
echo   2. Shake device to open developer menu
echo   3. Tap 'Connect to Dev Server'
echo   4. Scan QR code or enter URL manually
echo.
echo 💡 Your device and computer must be on the same WiFi network
pause