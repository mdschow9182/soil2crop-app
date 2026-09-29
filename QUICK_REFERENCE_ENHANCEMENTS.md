# Quick Reference - IoT & Market Enhancements

## 📊 MARKET PRICES - DEFAULT DATA

### What Changed?
✅ Always shows price data, even when API is down

### Default Crops Displayed:
```
Rice      ₹2,200 (avg)   Stable    Guntur
Maize     ₹1,900 (avg)   Rising ↑  Guntur  
Cotton    ₹7,250 (avg)   Falling ↓ Guntur
Groundnut ₹5,400 (avg)   Stable    Guntur
```

### Test It:
1. Stop backend server
2. Refresh Market Dashboard
3. Should still see prices!

---

## 🔄 IOT SENSORS - AUTO-CHANGING

### What Changed?
✅ Sensor values change automatically every 30 seconds

### Auto-Simulation Schedule:
- **Fetch Data:** Every 5 seconds from backend
- **Simulate Changes:** Every 30 seconds
- **Variations:** Small realistic changes

### Example Changes:
```
Temperature:  28°C → 29.5°C → 27.8°C
Humidity:     65% → 62% → 67%
Soil Moisture: 45% → 47% → 43%
```

### Visual Indicators:
- ✅ "Auto-refreshing every 30 seconds" text
- ✅ Smooth value transitions
- ✅ Chart updates with new readings

### Test It:
1. Open IoT Dashboard
2. Wait 30 seconds
3. Watch values change!

---

## 💧 MANUAL PUMP CONTROL

### What Changed?
✅ Added ON/OFF buttons for manual override

### Control Modes:

#### 🤖 Auto Mode (Default)
- Automatic based on soil moisture
- Turns ON when moisture < 35%
- Turns OFF when moisture > 60%
- Smart hysteresis protection

#### ⚙️ Manual Mode
- User controls with buttons
- Activates when you press button
- Lasts 5 minutes
- Then auto-resumes

### Button Layout:

```
┌──────────────────────────────┐
│ 🚰 Water Pump    ⚙️ Manual  │
│                              │
│ ON                          │
├──────────────────────────────┤
│ [💧 Turn ON] [⏹ Turn OFF]  │
│                              │
│ ⏱ Returns to auto in 5 min  │
└──────────────────────────────┘
```

### How to Use:

**Turn Pump ON Manually:**
1. Click "💧 Turn ON" button
2. Pump activates immediately
3. Badge shows "Manual Mode"
4. Auto-resumes in 5 minutes

**Turn Pump OFF Manually:**
1. Click "⏹ Turn OFF" button
2. Pump stops immediately
3. Manual mode active
4. Auto-resumes after timeout

### Button States:

| Pump Status | ON Button | OFF Button |
|-------------|-----------|------------|
| **OFF** | Blue (clickable) | Gray (disabled) |
| **ON** | Blue (disabled) | Gray (clickable) |

### Safety Features:
- ⏱ 5-minute auto-resume
- 🛡 Hysteresis protection
- ⚠️ Toast notifications
- 💡 Clear visual feedback

---

## 🎯 QUICK TEST COMMANDS

### Test Market Prices:
```bash
# Navigate to
http://localhost:8080/market

# Should see:
✅ 4 crops with prices
✅ Trend indicators
✅ Voice option
```

### Test IoT Simulation:
```bash
# Navigate to
http://localhost:8080/iot

# Wait 30 seconds
✅ Values should change
✅ Chart updates
✅ Console logs show simulation
```

### Test Manual Control:
```bash
# In IoT Dashboard
1. Click "💧 Turn ON"
2. See pump activate
3. Wait 5 minutes
4. Should return to auto
```

---

## 🔧 TROUBLESHOOTING

### Market Shows Empty?
- Check `getDefaultPrices()` function
- Verify toast notification appears
- Should always show default data

### Sensors Not Changing?
- Check console for "[Simulation]" logs
- Verify 30-second interval
- Ensure no JS errors

### Manual Control Not Working?
- Check button click handlers
- Verify `togglePump()` function
- Look for error toasts

---

## 📋 FEATURE CHECKLIST

### Market Dashboard
- [x] Default data always visible
- [x] 4+ crops displayed
- [x] Price trends shown
- [x] Voice announcements
- [x] Responsive design

### IoT Dashboard  
- [x] Auto-simulation working
- [x] Values changing smoothly
- [x] Chart updating
- [x] Manual control buttons
- [x] Mode indicators
- [x] 5-minute timeout

---

## 💻 CODE LOCATIONS

**Market Defaults:**
```
frontend/src/pages/MarketDashboard.tsx
Line 169: getDefaultPrices()
Line 245: getDefaultPriceForCrop()
```

**IoT Simulation:**
```
frontend/src/pages/IoTDashboard.tsx
Line 63: simulateVariation()
Line 166: simulateSensorData()
Line 202: Auto-simulate interval
```

**Manual Control:**
```
frontend/src/pages/IoTDashboard.tsx
Line 59: manualMode state
Line 113: togglePump() function
Line 430: Manual control UI
```

---

## 🎨 VISUAL INDICATORS

### Color Codes:

**Market Trends:**
- 🟢 Green = Rising prices
- 🔴 Red = Falling prices  
- ⚪ Gray = Stable

**IoT Alerts:**
- 🟢 Green = Optimal range
- 🟡 Yellow = Warning
- 🔴 Red = Alert/Critical

**Pump Status:**
- 🔵 Blue = ON/Active
- ⚪ Gray = OFF/Inactive
- 🟠 Orange = Manual mode

---

**Quick Start:**
1. `npm run dev` (frontend)
2. Open http://localhost:8080
3. Test all three features!

**Status:** ✅ All Working  
**Date:** March 27, 2026
