@echo off
REM ========================================
REM Quick Fix for ERR_CONNECTION_RESET
REM ========================================

color 0A
cls

echo ╔══════════════════════════════════════════════════════════╗
echo ║     🔧 FIXING CONNECTION ERROR - AUTOMATED               ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo Step 1: Checking if Node.js is installed...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found! Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo Step 2: Killing any existing Node.js processes...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Killed existing Node.js processes
) else (
    echo ℹ No Node.js processes were running
)
echo.

echo Step 3: Checking for port conflicts...
netstat -ano | findstr :3000 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 3000 is already in use!
    echo Do you want to kill the process? (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
            taskkill /F /PID %%a
        )
        echo ✓ Process killed
    )
) else (
    echo ✓ Port 3000 is free
)
echo.

echo Step 4: Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing dependencies... This may take a minute.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)
echo.

echo Step 5: Starting backend server...
echo.
echo ════════════════════════════════════════════════════════════
echo 🚀 Starting server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo ════════════════════════════════════════════════════════════
echo.

REM Start the server
node index.js

pause
