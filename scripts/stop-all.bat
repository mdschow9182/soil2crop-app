@echo off
REM ============================================
REM Soil2Crop - Stop All Services
REM ============================================
REM This script stops both backend and frontend servers

echo ============================================
echo   Soil2Crop Platform - Stopping Services
echo ============================================
echo.

echo [INFO] Stopping all Node.js processes...

REM Kill backend processes (Node.js on port 5000)
echo [INFO] Stopping backend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Killing PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill frontend processes (Node.js on port 5173)
echo [INFO] Stopping frontend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Killing PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Alternative method - kill by process name
echo [INFO] Cleaning up remaining node processes...
taskkill /IM node.exe /F >nul 2>&1

timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo   All Services Stopped
echo ============================================
echo.
echo You can now restart the services using:
echo   scripts\start-all.bat
echo.
pause
