# HabitGuard - Restart Expo with new configuration
# This script will restart the Expo dev server with the updated API URL

Write-Host "🔄 Restarting HabitGuard Expo Dev Server..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your API URL" -ForegroundColor Yellow
    exit 1
}

# Read and display current API URL from .env
$apiUrl = Get-Content .env | Select-String "API_URL=" | ForEach-Object { $_ -replace "API_URL=", "" }
Write-Host "📡 Current API URL: $apiUrl" -ForegroundColor Green
Write-Host ""

# Test if backend is accessible
Write-Host "🔍 Testing backend connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/../health" -Method GET -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is accessible!" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Message: $($content.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ WARNING: Cannot reach backend at $apiUrl" -ForegroundColor Red
    Write-Host "   Make sure backend server is running on port 3000" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}
Write-Host ""

# Stop existing Expo processes
Write-Host "🛑 Stopping existing Node/Expo processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node processes" -ForegroundColor Gray
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processes stopped" -ForegroundColor Green
} else {
    Write-Host "   No Node processes found" -ForegroundColor Gray
}
Write-Host ""

# Clear Metro bundler cache
Write-Host "🧹 Clearing Metro bundler cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.cache") {
    Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache cleared" -ForegroundColor Green
} else {
    Write-Host "   No cache found (this is ok)" -ForegroundColor Gray
}
Write-Host ""

# Start Expo with clear cache
Write-Host "🚀 Starting Expo dev server with clear cache..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Wait for QR code to appear" -ForegroundColor Gray
Write-Host "   2. Press 'r' to reload the app on your device" -ForegroundColor Gray
Write-Host "   3. Or scan QR code if you need to reinstall" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 If you still see errors:" -ForegroundColor Yellow
Write-Host "   - Close the app completely on your device" -ForegroundColor Gray
Write-Host "   - Reopen it from the Expo Go app" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start Expo with clear flag
npx expo start --clear
