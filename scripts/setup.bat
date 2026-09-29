@echo off
REM ============================================
REM Soil2Crop Setup Script
REM Installs all dependencies for backend and frontend
REM ============================================

echo ========================================
echo Soil2Crop - Setting up project
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/3] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Root installation failed!
    exit /b %errorlevel%
)

echo.
echo [2/3] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    exit /b %errorlevel%
)

echo.
echo [3/3] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    exit /b %errorlevel%
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application, run:
echo   npm start
echo.
echo Or start individually:
echo   Backend:  cd backend ^&^& npm run dev
echo   Frontend: cd frontend ^&^& npm run dev
echo.

pause
