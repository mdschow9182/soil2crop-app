# 🌾 Soil2Crop Android App - Quick Start

## ⚡ Fastest Way to Build Your Android App

---

## Option 1: Automated Setup (Recommended)

**Run the setup script:**

```bash
setup-android-app.bat
```

This will:
1. Install Capacitor
2. Initialize project
3. Build React app
4. Add Android platform
5. Sync everything

**Then:**
```bash
npx cap open android
```

---

## Option 2: Manual Setup

### Step-by-Step Commands

```bash
# Navigate to frontend
cd frontend

# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init Soil2Crop com.soil2crop.app --web-dir=dist

# 3. Build React app
npm run build

# 4. Add Android platform
npx cap add android

# 5. Copy web assets
npx cap copy

# 6. Sync
npx cap sync

# 7. Open Android Studio
npx cap open android
```

---

## Build APK

### In Android Studio:

1. **File → Project Structure → SDK Location** → Download if needed
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build to complete
4. Click **"locate"** when done

**APK Location:**
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Run on Device

### USB Debugging Setup:

1. **Enable Developer Options** on phone:
   - Settings → About Phone
   - Tap "Build Number" 7 times
   
2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Turn on "USB Debugging"

3. **Connect via USB**

4. **In Android Studio:**
   - Click green **Run** button (▶️)
   - Select your device
   - App installs and runs!

---

## Live Reload (Development)

### For testing without rebuilding:

**1. Update capacitor.config.ts:**
```typescript
server: {
  url: 'http://192.168.1.XXX:8080', // Your computer's IP
  cleartext: true
}
```

**2. Start servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**3. Sync and run:**
```bash
npx cap sync
npx cap open android
```

Now changes in your code update instantly!

---

## Production Build

### For final APK:

```bash
# 1. Build React app
cd frontend
npm run build

# 2. Copy to Android
npx cap copy

# 3. Open Android Studio
npx cap open android
```

**Then in Android Studio:**
- Build → Generate Signed Bundle / APK
- Choose APK
- Create or use existing keystore
- Build release APK

---

## Features Checklist

All features work in mobile app:

✅ Dashboard - Full functionality  
✅ Soil Report Upload - Works with camera/filesystem  
✅ Crop Advice - Full functionality  
✅ Alerts - Push notifications supported  
✅ IoT Dashboard Simulation - Full functionality  
✅ Bottom Navigation - Native feel  
✅ Responsive UI - Mobile optimized  

---

## Common Issues & Fixes

### Issue: "No installed SDK"

**Fix:**
1. Open Android Studio
2. Tools → SDK Manager
3. Download Android SDK Platform

### Issue: "Port 8080 already in use"

**Fix:**
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Issue: White screen

**Check:**
- Backend is running (`npm run dev` in backend folder)
- CORS configured correctly
- No console errors (use Chrome DevTools)

### Issue: Build fails

**Fix:**
```bash
cd frontend/android
./gradlew clean
./gradlew build
```

---

## App Configuration

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.soil2crop.app',
  appName: 'Soil2Crop',
  webDir: 'dist',
  server: {
    url: 'http://localhost:8080',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#4CAF50",
      showSpinner: false,
      launchAutoHide: true
    }
  }
};

export default config;
```

---

## Required Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

---

## Testing Checklist

Before releasing:

- [ ] App installs successfully
- [ ] Login works
- [ ] Dashboard displays
- [ ] Soil report upload works
- [ ] Crop advice shows
- [ ] Alerts display
- [ ] IoT dashboard updates
- [ ] Bottom navigation works
- [ ] Back button works
- [ ] No console errors
- [ ] Responsive on different screens
- [ ] Works offline (if applicable)

---

## Distribution

### Share APK Directly

Send `app-debug.apk` to users. They can install via:
```bash
adb install app-debug.apk
```

### Google Play Store

1. Create signed release APK
2. Create Google Play Console account ($25 one-time)
3. Fill app details
4. Upload screenshots
5. Submit for review

---

## Useful Plugins

```bash
# Camera (for soil photos)
npm install @capacitor/camera

# Filesystem (local storage)
npm install @capacitor/filesystem

# Push Notifications (alerts)
npm install @capacitor/push-notifications

# Status Bar
npm install @capacitor/status-bar

# Splash Screen
npm install @capacitor/splash-screen
```

---

## Performance Tips

### Optimize Bundle Size

```bash
# Analyze bundle
npm run build -- --stats
npx vite-bundle-visualizer
```

### Lazy Load Routes

```typescript
import { lazy } from 'react';

const IoTDashboard = lazy(() => import("./pages/IoTDashboard"));
```

### Enable ProGuard

In `android/app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start React dev server |
| `npm run build` | Build production app |
| `npx cap init` | Initialize Capacitor |
| `npx cap add android` | Add Android platform |
| `npx cap copy` | Copy web assets |
| `npx cap sync` | Full sync |
| `npx cap open android` | Open Android Studio |
| `npx cap run android` | Run on device |

---

## File Locations

```
Project Root:
├── frontend/
│   ├── dist/                    # Built web app
│   ├── android/                 # Native Android project
│   │   └── app/build/outputs/apk/
│   │       └── debug/           # Debug APK here
│   │       └── release/         # Release APK here (after signing)
│   ├── capacitor.config.ts      # Config file
│   └── package.json
└── ANDROID_APP_CONVERSION_GUIDE.md  # Full guide
```

---

## Estimated Times

- **Initial Setup:** 15-20 minutes
- **First Build:** 5-10 minutes
- **Subsequent Builds:** 2-3 minutes (with live reload)
- **APK Generation:** 3-5 minutes

---

## Support

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Studio:** https://developer.android.com/studio/intro
- **Troubleshooting:** Check ANDROID_APP_CONVERSION_GUIDE.md

---

**Status:** Ready to build  
**Next Action:** Run `setup-android-app.bat`  
**Time to APK:** ~30 minutes
