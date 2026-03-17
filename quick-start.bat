@echo off
REM Soil2Crop Quick Start Script
REM This script helps you start both backend and frontend quickly

echo.
echo ========================================
echo   Soil2Crop - Quick Start
echo ========================================
echo.

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo [1/4] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
) else (
    echo [1/4] Backend dependencies OK
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [2/4] Frontend dependencies OK
)

echo [3/4] Starting backend server...
start "Soil2Crop Backend" cmd /k "cd backend && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak > nul

echo [4/4] Starting frontend...
start "Soil2Crop Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Soil2Crop Started!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8080 (or check console)
echo.
echo Press any key to run system verification...
pause > nul

REM Wait a bit more for servers to fully start
timeout /t 2 /nobreak > nul

echo.
echo Running system verification...
node verify-system.js

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Open your browser to the frontend URL shown above.
echo.
echo To stop servers: Close the terminal windows
echo.
pause
