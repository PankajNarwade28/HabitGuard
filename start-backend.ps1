# HabitGuard Backend Server Starter

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HabitGuard Backend Server Starter" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

Write-Host "Checking if dependencies are installed..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Server will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start
