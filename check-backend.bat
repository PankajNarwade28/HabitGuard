@echo off
echo ============================================
echo HabitGuard Backend Status Checker
echo ============================================
echo.

echo Checking if backend is running on port 3000...
netstat -ano | findstr :3000 >nul

if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 3000
    echo.
    echo Testing backend health endpoint...
    curl -s http://localhost:3000/api/health
    echo.
    echo.
    echo [SUCCESS] Backend is working correctly!
) else (
    echo [ERROR] Backend is NOT running!
    echo.
    echo To start the backend:
    echo   1. Open a new terminal
    echo   2. cd backend
    echo   3. npm start
    echo.
    echo Or simply run: start-backend.bat
    pause
)

echo.
echo ============================================
pause
