# HabitGuard Backend Status Checker

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "HabitGuard Backend Status Checker" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking if backend is running on port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":3000"

if ($portCheck) {
    Write-Host "[OK] Backend is running on port 3000" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Testing backend health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Cyan
        Write-Host "  Success: $($response.success)" -ForegroundColor Green
        Write-Host "  Message: $($response.message)" -ForegroundColor Green
        Write-Host "  Time: $($response.timestamp)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[SUCCESS] Backend is working correctly!" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Backend is running but not responding correctly" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] Backend is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the backend:" -ForegroundColor Yellow
    Write-Host "  1. Open a new terminal" -ForegroundColor White
    Write-Host "  2. cd backend" -ForegroundColor White
    Write-Host "  3. npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "Or simply run: .\start-backend.bat" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
