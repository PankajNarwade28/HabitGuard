@echo off
echo ============================================
echo Finding and Killing Process on Port 3000
echo ============================================
echo.

echo Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
)

if defined PID (
    echo Found process on port 3000: PID %PID%
    echo.
    echo Killing process %PID%...
    taskkill /F /PID %PID%
    echo.
    echo [SUCCESS] Process killed!
    echo Port 3000 is now free.
) else (
    echo [INFO] No process found on port 3000
    echo Port is already free.
)

echo.
echo ============================================
echo You can now start the backend server.
echo Run: npm start
echo ============================================
pause
