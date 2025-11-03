@echo off
echo ============================================
echo  HabitGuard - Clear Cache and Restart
echo ============================================
echo.

echo [1/4] Clearing Expo cache...
npx expo start --clear

echo.
echo ============================================
echo If still showing old IP:
echo   1. Stop Expo (Ctrl+C)
echo   2. Delete .expo folder manually
echo   3. Run: npx expo start --clear
echo ============================================
