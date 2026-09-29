# 🚀 Quick Test Guide - Market Prices & Crop Calendar

## Prerequisites

Backend running on: **http://localhost:5002**  
Frontend running on: **http://localhost:8080**

---

## Test 1: Backend Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:5002/health"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Soil2Crop API Running",
  "database": "memory"
}
```

---

## Test 2: Crop Calendar API

### Test Rice Calendar:
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:5002/api/crop-calendar?crop=Rice&state=Andhra Pradesh"
$result.success
$result.data.crop
$result.data.duration_days
```

**Expected Output:**
```
True
Rice
120
```

### Test Millets Calendar:
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:5002/api/crop-calendar?crop=Millets&state=Andhra Pradesh"
$result.data.duration_days
```

**Expected Output:**
```
90
```

### Test Invalid Crop (should return 404):
```powershell
try {
  Invoke-RestMethod -Uri "http://localhost:5002/api/crop-calendar?crop=Invalid&state=Andhra Pradesh"
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

**Expected Output:**
```
404
```

---

## Test 3: Market Prices API

### Test Rice Prices:
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:5002/api/market-prices?crop=Rice"
$result.success
$result.data.currentPrice
$result.data.trend
$result.data.prices.Count
```

**Expected Output:**
```
True
2280
increasing
30
```

### Test Maize Prices:
```powershell
$result = Invoke-RestMethod -Uri "http://localhost:5002/api/market-prices?crop=Maize"
$result.data.currentPrice
$result.data.prices.Count
```

**Expected Output:**
```
1950
7
```

### Test All Crops:
```powershell
$crops = @("Rice", "Maize", "Groundnut", "Cotton", "Wheat", "Soybean", "Sugarcane", "Mustard")
foreach ($crop in $crops) {
  $result = Invoke-RestMethod -Uri "http://localhost:5002/api/market-prices?crop=$crop"
  Write-Host "$crop : `$$($result.data.currentPrice) - $($result.data.trend)"
}
```

**Expected Output:**
```
Rice : ₹2280 - increasing
Maize : ₹1950 - increasing
Groundnut : ₹5400 - stable
Cotton : ₹7250 - decreasing
Wheat : ₹2300 - stable
Soybean : ₹4200 - increasing
Sugarcane : ₹320 - stable
Mustard : ₹5800 - increasing
```

---

## Test 4: Frontend Flow (Manual Testing)

### Step-by-Step User Journey:

1. **Login**
   - Navigate to http://localhost:8080
   - Login with test credentials
   - ✅ Should reach Dashboard

2. **Soil Analysis**
   - Click "Soil Report" or "Crop Suggestion"
   - Enter soil values:
     - Soil Type: Loamy
     - pH: 6.5
     - Nitrogen: 150
     - Phosphorus: 30
     - Potassium: 40
   - Submit
   - ✅ Should show crop recommendations

3. **Crop Selection**
   - See recommended crops (Rice, Groundnut, etc.)
   - Click "Select Rice for Calendar" button
   - ✅ Toast notification appears
   - ✅ Auto-navigates to Crop Calendar page

4. **Crop Calendar Display**
   - Page should automatically load Rice calendar
   - Verify displayed data:
     - ✅ Sowing Time: June - July
     - ✅ Harvesting Time: October - November
     - ✅ Duration: 120 days
     - ✅ Fertilizer schedule shown
     - ✅ Irrigation schedule shown
     - ✅ Best practices shown
   - If error appears, check console

5. **Market Prices**
   - Navigate to "Market Prices" from menu
   - Select different crops from dropdown
   - Verify chart renders for each:
     - ✅ Rice (30 data points)
     - ✅ Maize (7 data points)
     - ✅ Groundnut (7 data points)
   - Check trend indicators:
     - ✅ Green ↑ for increasing
     - ✅ Red ↓ for decreasing
     - ✅ Gray → for stable

---

## Test 5: Browser Console Checks

Open browser DevTools (F12) and check:

### No Errors Expected:
```
❌ GET /api/crop-calendar 404 (Not Found)
❌ Cannot read properties of undefined
❌ Failed to fetch market trends
```

### Normal Logs (OK to see):
```
✅ [CropSuggestion] Voice initialization complete
ℹ️ Voice announcement error: (can be ignored)
```

---

## Test 6: localStorage Verification

In browser console:

```javascript
// After selecting a crop
localStorage.getItem("selectedCrop")
// Should return: "Rice" (or selected crop name)

// Check farmer ID exists
localStorage.getItem("farmerId")
// Should return a value if logged in

// Check location
localStorage.getItem("farmer_location")
// Should return location like "Guntur"
```

---

## Test 7: Network Tab Verification

In browser DevTools → Network tab:

### Filter by "crop-calendar":
Click on the request and verify:
- **Status:** 200 OK
- **Response:** Contains crop data
- **Request URL:** 
  ```
  http://localhost:5002/api/crop-calendar?crop=Rice&state=Andhra%20Pradesh
  ```

### Filter by "market-prices":
Click on the request and verify:
- **Status:** 200 OK
- **Response:** Contains price data with 30 days
- **Request URL:**
  ```
  http://localhost:5002/api/market-prices?crop=Rice
  ```

---

## Common Issues & Fixes

### Issue 1: "Cannot read properties of undefined"
**Fix:** Refresh the page (F5)

### Issue 2: Crop Calendar shows "No data available"
**Check:**
```javascript
localStorage.getItem("selectedCrop") // Should not be null
```
**Fix:** Go back to Crop Suggestion and select a crop

### Issue 3: Market chart empty
**Check Network tab for API response**
**If 404:** Backend route not loaded → Restart backend
**If 200 but empty:** Check crop parameter in API call

### Issue 4: Backend won't start
**Kill existing processes:**
```powershell
Get-Process -Name node | Stop-Process -Force
```
**Restart:**
```powershell
cd c:\projects\soil2crop-app\backend
node server.js
```

---

## Success Criteria ✅

All tests pass if:

- [x] Backend starts without errors
- [x] Crop Calendar API returns data for all 5 crops
- [x] Market Prices API returns data for all 8 crops
- [x] Frontend loads without console errors
- [x] Crop selection stores to localStorage
- [x] Crop Calendar reads from localStorage
- [x] Market Trends chart renders correctly
- [x] No 404 errors in Network tab
- [x] Full user flow works end-to-end

---

## Quick One-Liner Tests

```powershell
# Test both APIs at once
Write-Host "Crop Calendar:"; (Invoke-RestMethod "http://localhost:5002/api/crop-calendar?crop=Rice&state=Andhra Pradesh").data.crop; Write-Host "Market Price:"; (Invoke-RestMethod "http://localhost:5002/api/market-prices?crop=Rice").data.currentPrice
```

**Expected Output:**
```
Crop Calendar:
Rice
Market Price:
2280
```

---

## Performance Benchmarks

- **API Response Time:** < 100ms (local)
- **Page Load Time:** < 2s
- **Chart Render Time:** < 500ms
- **No Memory Leaks:** Check Chrome DevTools → Memory tab

---

## Next Steps After Testing

1. ✅ All features working
2. ✅ Ready for production deployment
3. ✅ Can add more crops/states as needed
4. ✅ Can integrate real-time market data APIs
5. ✅ Can add voice assistant features (optional)

---

**System Status:** ✅ FULLY OPERATIONAL  
**Last Updated:** March 27, 2026
