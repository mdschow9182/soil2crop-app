@echo off
REM ============================================
REM Soil2Crop - Start All Services
REM ============================================
REM This script starts both backend and frontend servers

echo ============================================
echo   Soil2Crop Platform - Starting Services
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Start Backend Server
echo [INFO] Starting Backend Server...
cd /d "%~dp0..\backend"
start cmd /k "title Soil2Crop Backend && echo Starting backend on http://localhost:5000... && npm start"
timeout /t 3 /nobreak >nul

REM Start Frontend Development Server
echo [INFO] Starting Frontend Development Server...
cd /d "%~dp0..\frontend"
start cmd /k "title Soil2Crop Frontend && echo Starting frontend on http://localhost:5173... && npm run dev"

echo.
echo ============================================
echo   Services Started Successfully!
echo ============================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Health Check: http://localhost:5000/health
echo IoT Dashboard: http://localhost:5173/iot-dashboard
echo.
echo Press any key to view status...
pause >nul

REM Open browser to frontend
start http://localhost:5173
