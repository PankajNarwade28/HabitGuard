#!/usr/bin/env pwsh
# Quick Fix Script for HabitGuard Student Pages Not Loading
# This will verify and fix the API connection issue

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   HabitGuard - Student Pages Quick Fix" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current IP
Write-Host "Step 1: Checking your current IP address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -and $_.IPAddress -notlike "169.254.*" }).IPAddress

if ($ipAddress) {
    Write-Host "✅ Your current IP: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "❌ Could not detect WiFi IP address" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Check .env file
Write-Host "Step 2: Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content .env -Raw
    $currentApiUrl = ($envContent | Select-String -Pattern "API_URL=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
    
    Write-Host "   Current API_URL: $currentApiUrl" -ForegroundColor Gray
    
    $expectedUrl = "http://${ipAddress}:3000/api"
    
    if ($currentApiUrl -ne $expectedUrl) {
        Write-Host "⚠️  API URL needs updating!" -ForegroundColor Yellow
        Write-Host "   Expected: $expectedUrl" -ForegroundColor Gray
        Write-Host ""
        
        $update = Read-Host "Update .env file automatically? (y/n)"
        if ($update -eq "y") {
            $envContent = $envContent -replace "API_URL=.+", "API_URL=$expectedUrl"
            Set-Content -Path ".env" -Value $envContent
            Write-Host "✅ .env file updated!" -ForegroundColor Green
        } else {
            Write-Host "❌ Please update .env file manually" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ API URL is correct" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Test backend connection
Write-Host "Step 3: Testing backend server..." -ForegroundColor Yellow
$backendUrl = "http://${ipAddress}:3000"

try {
    $healthCheck = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET -TimeoutSec 5
    if ($healthCheck.success) {
        Write-Host "✅ Backend server is running!" -ForegroundColor Green
        Write-Host "   Message: $($healthCheck.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend server is not accessible!" -ForegroundColor Red
    Write-Host "   URL tested: $backendUrl/api/health" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 To fix:" -ForegroundColor Yellow
    Write-Host "   1. Open a new terminal in: C:\Projects\HabitGuard\backend" -ForegroundColor Gray
    Write-Host "   2. Run: node server.js  (or nodemon if installed)" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
Write-Host ""

# Step 4: Test student endpoints
Write-Host "Step 4: Testing student API endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{ Name = "Courses"; Path = "/api/student/courses" },
    @{ Name = "Health Check"; Path = "/api/health" }
)

$allPassed = $true
foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$backendUrl$($endpoint.Path)" -Method GET -TimeoutSec 5
        if ($response.success) {
            Write-Host "   [OK] $($endpoint.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   [FAIL] $($endpoint.Name) - Failed" -ForegroundColor Red
        $allPassed = $false
    }
}
Write-Host ""

if (-not $allPassed) {
    Write-Host "⚠️  Some endpoints failed. Backend may have issues." -ForegroundColor Yellow
    Write-Host ""
}

# Step 5: Restart instructions
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   IMPORTANT: Restart Required" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 To apply changes, you MUST restart Expo:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A - If Expo is running in another terminal:" -ForegroundColor White
Write-Host "   1. Press Ctrl+C to stop it" -ForegroundColor Gray
Write-Host "   2. Run: npx expo start --clear" -ForegroundColor Gray
Write-Host ""
Write-Host "Option B - Run restart script:" -ForegroundColor White
Write-Host "   .\restart-expo.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Option C - Let this script do it:" -ForegroundColor White
$restart = Read-Host "Stop all Node processes and restart Expo now? (y/n)"

if ($restart -eq "y") {
    Write-Host ""
    Write-Host "🛑 Stopping Node processes..." -ForegroundColor Cyan
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Stopped" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🚀 Starting Expo with cleared cache..." -ForegroundColor Cyan
    Write-Host ""
    npx expo start --clear
} else {
    Write-Host ""
    Write-Host "⚠️  Remember to restart Expo manually!" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   After Restart" -ForegroundColor Cyan  
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "On your device/emulator:" -ForegroundColor White
Write-Host "   1. Reload the app (shake device or press R)" -ForegroundColor Gray
Write-Host "   2. Or press r in the Expo terminal" -ForegroundColor Gray
Write-Host "   3. Navigate to Student Profile" -ForegroundColor Gray
Write-Host "   4. Verify courses, quizzes, and study plan load" -ForegroundColor Gray
Write-Host ""
Write-Host "[SUCCESS] All student pages should now work!" -ForegroundColor Green
Write-Host ""
