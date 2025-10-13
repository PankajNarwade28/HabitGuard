@echo off
echo ============================================
echo HabitGuard Backend Server Starter
echo ============================================
echo.

cd backend

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

echo Starting backend server...
echo Server will run on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
call npm start
