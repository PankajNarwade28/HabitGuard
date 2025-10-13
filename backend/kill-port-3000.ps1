# Kill Process on Port 3000

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Finding and Killing Process on Port 3000" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking for processes on port 3000..." -ForegroundColor Yellow

$connections = netstat -ano | Select-String ":3000"

if ($connections) {
    Write-Host "Found process(es) on port 3000:" -ForegroundColor Yellow
    Write-Host ""
    
    # Extract unique PIDs
    $pids = @()
    foreach ($line in $connections) {
        if ($line -match '\s+(\d+)\s*$') {
            $pid = $matches[1]
            if ($pids -notcontains $pid) {
                $pids += $pid
            }
        }
    }
    
    foreach ($pid in $pids) {
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "  PID: $pid - Process: $($process.Name)" -ForegroundColor White
            
            Write-Host "  Killing process $pid..." -ForegroundColor Red
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "  [SUCCESS] Process $pid killed!" -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Could not kill process $pid" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] Port 3000 is now free!" -ForegroundColor Green
} else {
    Write-Host "[INFO] No process found on port 3000" -ForegroundColor Yellow
    Write-Host "Port is already free." -ForegroundColor Green
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "You can now start the backend server." -ForegroundColor White
Write-Host "Run: npm start" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
