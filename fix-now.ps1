# HabitGuard Student Pages Fix Script
# Simple version without special characters

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " HabitGuard - Student Pages Quick Fix" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Get current IP
Write-Host "[1/5] Checking your IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -and $_.IPAddress -notlike "169.254.*" }).IPAddress

if ($ipAddress) {
    Write-Host "   Current IP: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Could not detect IP" -ForegroundColor Red
    exit 1
}

# Check .env
Write-Host ""
Write-Host "[2/5] Checking .env configuration..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw
$currentApiUrl = ($envContent -split "`n" | Select-String "^API_URL=" | ForEach-Object { ($_ -split "=")[1] }).Trim()
$expectedUrl = "http://${ipAddress}:3000/api"

Write-Host "   Current:  $currentApiUrl" -ForegroundColor Gray
Write-Host "   Expected: $expectedUrl" -ForegroundColor Gray

if ($currentApiUrl -ne $expectedUrl) {
    Write-Host "   Status: NEEDS UPDATE" -ForegroundColor Yellow
    $envContent = $envContent -replace "API_URL=.+", "API_URL=$expectedUrl"
    Set-Content -Path ".env" -Value $envContent -NoNewline
    Write-Host "   Updated .env file" -ForegroundColor Green
} else {
    Write-Host "   Status: OK" -ForegroundColor Green
}

# Test backend
Write-Host ""
Write-Host "[3/5] Testing backend server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://${ipAddress}:3000/api/health" -Method GET -TimeoutSec 5
    if ($health.success) {
        Write-Host "   Backend: RUNNING" -ForegroundColor Green
    }
} catch {
    Write-Host "   Backend: NOT ACCESSIBLE" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please start backend:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   node server.js" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Test endpoints
Write-Host ""
Write-Host "[4/5] Testing student endpoints..." -ForegroundColor Yellow
try {
    $courses = Invoke-RestMethod -Uri "http://${ipAddress}:3000/api/student/courses" -Method GET -TimeoutSec 5
    if ($courses.success) {
        Write-Host "   Courses endpoint: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "   Courses endpoint: FAILED" -ForegroundColor Red
}

# Restart Expo
Write-Host ""
Write-Host "[5/5] Restarting Expo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Stopping Node processes..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done" -ForegroundColor Green
Write-Host ""

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " Starting Expo with cleared cache..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After Expo starts:" -ForegroundColor Yellow
Write-Host "  1. Press 'r' to reload app" -ForegroundColor Gray
Write-Host "  2. Navigate to Student Profile" -ForegroundColor Gray
Write-Host "  3. Check if courses/quizzes load" -ForegroundColor Gray
Write-Host ""

npx expo start --clear
