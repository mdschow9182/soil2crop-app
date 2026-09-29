# Soil2Crop System Diagnostic Tool

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Soil2Crop System Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node processes
Write-Host "1. Checking Node Processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node process(es):" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id), Started: $($_.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "   No Node processes found!" -ForegroundColor Red
}
Write-Host ""

# Check ports
Write-Host "2. Checking Port Usage..." -ForegroundColor Yellow
$ports = @("5000", "5001", "5002", "5003", "8080", "8081", "8082")
foreach ($port in $ports) {
    $connection = netstat -ano | findstr ":$port" | findstr LISTENING
    if ($connection) {
        $pid = ($connection -split '\s+')[-1]
        Write-Host "   ✓ Port $port is in use (PID: $pid)" -ForegroundColor Green
    } else {
        Write-Host "   ○ Port $port is free" -ForegroundColor Gray
    }
}
Write-Host ""

# Test backend health
Write-Host "3. Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/health" -Method GET -ErrorAction Stop
    Write-Host "   ✓ Backend is healthy on port 5001" -ForegroundColor Green
    Write-Host "     Status: $($health.success)" -ForegroundColor Gray
    Write-Host "     Database: $($health.database)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Backend health check failed!" -ForegroundColor Red
    Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test frontend
Write-Host "4. Testing Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   ✓ Frontend is responding on port 8080" -ForegroundColor Green
} catch {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "   ✓ Frontend is responding on port 8081" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ Frontend is not responding!" -ForegroundColor Red
    }
}
Write-Host ""

# Check environment files
Write-Host "5. Checking Configuration Files..." -ForegroundColor Yellow

# Backend .env
$backendEnv = "c:\projects\soil2crop-app\backend\.env"
if (Test-Path $backendEnv) {
    $content = Get-Content $backendEnv | Select-String "PORT="
    Write-Host "   ✓ Backend .env exists" -ForegroundColor Green
    Write-Host "     $content" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Backend .env not found!" -ForegroundColor Red
}

# Frontend .env.local
$frontendEnv = "c:\projects\soil2crop-app\frontend\.env.local"
if (Test-Path $frontendEnv) {
    $content = Get-Content $frontendEnv | Select-String "VITE_API_URL="
    Write-Host "   ✓ Frontend .env.local exists" -ForegroundColor Green
    Write-Host "     $content" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Frontend .env.local not found!" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnostic Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see any RED marks above, that indicates an issue." -ForegroundColor Yellow
Write-Host ""
Write-Host "Common fixes:" -ForegroundColor Cyan
Write-Host "1. If backend is not running: cd backend; npm run dev" -ForegroundColor White
Write-Host "2. If frontend is not running: cd frontend; npm run dev" -ForegroundColor White
Write-Host "3. If ports conflict: Kill old Node processes or change ports" -ForegroundColor White
Write-Host ""
