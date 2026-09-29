@echo off
REM ========================================
REM Soil2Crop - Android App Setup Script
REM ========================================

echo 🌾 Soil2Crop - Android Mobile App Setup
echo =========================================
echo.

cd frontend

echo Step 1: Installing Capacitor...
echo.
npm install @capacitor/core @capacitor/cli @capacitor/android

echo.
echo Step 2: Initializing Capacitor...
echo.
npx cap init Soil2Crop com.soil2crop.app --web-dir=dist

echo.
echo Step 3: Building React app...
echo.
npm run build

echo.
echo Step 4: Adding Android platform...
echo.
npx cap add android

echo.
echo Step 5: Copying web assets...
echo.
npx cap copy

echo.
echo Step 6: Syncing Capacitor...
echo.
npx cap sync

echo.
echo =========================================
echo ✅ Setup Complete!
echo =========================================
echo.
echo Next Steps:
echo 1. Open Android Studio: npx cap open android
echo 2. Build APK: Build → Build APK
echo 3. Run on device: Click Run button in Android Studio
echo.
echo For more details, see: ANDROID_APP_CONVERSION_GUIDE.md
echo.
pause
