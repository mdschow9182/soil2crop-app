@echo off
REM ========================================
REM Soil2Crop Backend Startup Script
REM ========================================

echo ╔══════════════════════════════════════════════════════════╗
echo ║     🌱 SOIL2CROP BACKEND SERVER STARTUP                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo ⚠️  Dependencies not installed. Installing now...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Dependencies installed
)

echo.
echo ════════════════════════════════════════════════════════════
echo 🚀 Starting backend server...
echo ════════════════════════════════════════════════════════════
echo.
echo 📍 Server will start on: http://localhost:3000
echo 🔗 API Test URL: http://localhost:3000/test
echo 💾 Uploads folder: .\uploads\soil-reports\
echo.
echo ⏰ Press Ctrl+C to stop the server
echo.

REM Start the server
node index.js

pause
