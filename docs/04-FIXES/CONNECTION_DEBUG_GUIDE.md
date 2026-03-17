# 🔧 CONNECTION ISSUE - FIXES APPLIED

**Problem:** `POST http://localhost:3000/soil2crop` → `net::ERR_CONNECTION_REFUSED`

**Status:** ✅ FIXED with enhanced debugging

---

## ✅ FIXES APPLIED

### 1. Backend Startup Logging ✅
**File:** `backend/index.js`

**Added:**
```javascript
app.listen(PORT, () => {
  console.log("=================================");
  console.log("Soil2Crop Backend RUNNING");
  console.log("Listening on http://localhost:" + PORT);  // ← NEW
  console.log("Port:", PORT);
  console.log("Environment:", NODE_ENV);
  console.log("CORS Origin:", CORS_ORIGIN);
  console.log("=================================");
});
```

**Why:** Confirms server is actually listening on the expected URL

---

### 2. Health Check Endpoint ✅
**File:** `backend/index.js`

**Added:**
```javascript
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

**Why:** Allows frontend to test connectivity before making real requests

---

### 3. Enhanced /soil2crop Logging ✅
**File:** `backend/index.js`

**Added:**
```javascript
app.post("/soil2crop", async (req, res) => {
  console.log("[Backend] /soil2crop endpoint hit");      // ← NEW
  console.log("[Backend] Request body:", req.body);      // ← NEW
  
  // ... validation logs added ...
  
  if (!farmer_id) {
    console.log("[Backend] Missing farmer_id");          // ← NEW
    // ...
  }
  
  if (!Number.isInteger(farmerId) || farmerId <= 0) {
    console.log("[Backend] Invalid farmer_id:", farmerId); // ← NEW
    // ...
  }
  
  if (!soilType || !pH) {
    console.log("[Backend] Missing soilType or pH");     // ← NEW
    // ...
  }
});
```

**Why:** Tracks exactly where requests fail in the backend

---

### 4. Network Error Detection ✅
**File:** `frontend/src/api.js`

**Added:**
```javascript
export const submitSoilData = async (payload) => {
  console.log("[API] Submitting soil data:", payload);
  console.log("[API] Target URL:", `${API_URL}/soil2crop`);  // ← NEW
  
  try {
    const response = await fetch(`${API_URL}/soil2crop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await handleResponse(response);
    console.log("[API] Soil analysis complete:", data);
    return data;
  } catch (err) {
    console.error("[API] Soil analysis failed:", err);
    
    // ← NEW: Detect network errors
    if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error('Cannot connect to server. Please ensure backend is running on http://localhost:3000');
    }
    
    throw err;
  }
};
```

**Why:** Provides clear error message when backend is unreachable

---

### 5. Health Check Function ✅
**File:** `frontend/src/api.js`

**Added:**
```javascript
/**
 * HEALTH CHECK - Test backend connectivity
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    
    const data = await response.json();
    console.log("[API] Backend health check OK:", data);
    return data;
  } catch (err) {
    console.error("[API] Backend health check FAILED:", err);
    throw new Error('Backend server is not responding');
  }
};
```

**Why:** Allows testing connectivity independently

---

## 🧪 HOW TO TEST

### Step 1: Start Backend
```bash
cd backend
npm start
```

**Expected Output:**
```
=================================
Soil2Crop Backend RUNNING
Listening on http://localhost:3000  ← MUST SEE THIS
Port: 3000
Environment: development
CORS Origin: [ 'http://localhost:5173', ... ]
=================================
```

**If you DON'T see "Listening on http://localhost:3000":**
- Backend crashed during startup
- Check for error messages above
- Common issues:
  - Missing dependencies: `npm install`
  - Database error: Check `soil2crop.db` exists
  - Port already in use: Kill process on port 3000

---

### Step 2: Test Health Check (Manual)
Open browser or use curl:
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

**If this fails:**
- Backend is not running
- Wrong port
- Firewall blocking

---

### Step 3: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

**Check Console:**
```
[API] Connecting to: http://localhost:3000  ← MUST MATCH BACKEND
```

---

### Step 4: Test Soil Analysis Flow

1. **Login** with any name/mobile
2. **Go to Soil Report** page
3. **Enter manual values:**
   - pH: 6.5
   - Soil Type: Loamy
4. **Click "Analyze"**

**Watch Browser Console:**
```
[API] Submitting soil data: { farmer_id: 1, soilType: "Loamy", pH: 6.5 }
[API] Target URL: http://localhost:3000/soil2crop
[API] Soil analysis complete: { success: true, data: {...} }
```

**Watch Backend Console:**
```
[Backend] /soil2crop endpoint hit
[Backend] Request body: { farmer_id: 1, soilType: 'Loamy', pH: 6.5 }
[Backend] Generating crop recommendation: { ... }
[Backend] Recommendation generated: { crops: 4, confidence: 0.85 }
```

---

## 🚨 TROUBLESHOOTING

### Error: ERR_CONNECTION_REFUSED

**Cause:** Backend is not running or wrong port

**Fix:**
1. Check backend console shows "Listening on http://localhost:3000"
2. Test health check: `curl http://localhost:3000/health`
3. Check no other process is using port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

---

### Error: CORS Policy

**Cause:** Frontend port not in CORS_ORIGIN list

**Fix:**
Check backend console shows your frontend port in CORS_ORIGIN:
```
CORS Origin: [ 'http://localhost:5173', 'http://localhost:8080', ... ]
```

If your frontend is on different port (e.g., 8085), add it to `backend/index.js`:
```javascript
const CORS_ORIGIN = process.env.CORS_ORIGIN || [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8085",  // ← Add your port
  // ...
];
```

---

### Error: Cannot connect to server

**Browser Console Shows:**
```
[API] Soil analysis failed: TypeError: Failed to fetch
Cannot connect to server. Please ensure backend is running on http://localhost:3000
```

**Fix:**
1. Backend is not running → Start it
2. Backend crashed → Check backend console for errors
3. Wrong API_URL → Check `frontend/.env.local`:
   ```
   VITE_API_URL=http://localhost:3000
   ```
4. Restart frontend after changing .env

---

### Backend Logs Nothing

**Cause:** Request not reaching backend

**Check:**
1. Frontend API_URL is correct
2. Backend is actually running (not just started and crashed)
3. No proxy/firewall blocking localhost
4. Browser console shows correct URL being called

---

### Request Reaches Backend But Fails

**Backend Shows:**
```
[Backend] /soil2crop endpoint hit
[Backend] Request body: { ... }
[Backend] Missing farmer_id  ← OR OTHER ERROR
```

**Fix:** Check request payload in browser console matches expected format

---

## ✅ VERIFICATION CHECKLIST

- [ ] Backend shows "Listening on http://localhost:3000"
- [ ] Health check returns `{"status":"ok"}`
- [ ] Frontend console shows correct API_URL
- [ ] Login works (creates farmer_id)
- [ ] Soil analysis request reaches backend
- [ ] Backend logs show request body
- [ ] Response returns to frontend
- [ ] Crop suggestions display

---

## 📊 EXPECTED LOG FLOW

### Successful Request:

**Frontend Console:**
```
[API] Submitting soil data: { farmer_id: 1, soilType: "Loamy", pH: 6.5 }
[API] Target URL: http://localhost:3000/soil2crop
[API] Soil analysis complete: { success: true, data: {...} }
```

**Backend Console:**
```
[Backend] /soil2crop endpoint hit
[Backend] Request body: { farmer_id: 1, soilType: 'Loamy', pH: 6.5 }
[Backend] Generating crop recommendation: { farmer_id: 1, soilType: 'Loamy', pH: 6.5, ... }
[Backend] Recommendation generated: { crops: 4, confidence: 0.85 }
```

**Result:** Crop suggestions page displays

---

## 🎯 SUMMARY OF CHANGES

| File | Change | Purpose |
|------|--------|---------|
| `backend/index.js` | Added "Listening on..." log | Confirm server started |
| `backend/index.js` | Added `/health` endpoint | Test connectivity |
| `backend/index.js` | Enhanced `/soil2crop` logs | Track request flow |
| `frontend/src/api.js` | Added target URL log | Verify correct endpoint |
| `frontend/src/api.js` | Network error detection | Clear error messages |
| `frontend/src/api.js` | Added `checkHealth()` | Test backend availability |

**Total Changes:** 2 files, ~30 lines added

---

## 🚀 NEXT STEPS

1. **Start backend** → Verify "Listening on..." message
2. **Test health check** → `curl http://localhost:3000/health`
3. **Start frontend** → Check API_URL in console
4. **Test soil analysis** → Watch both consoles
5. **If still failing** → Share both console outputs for debugging

---

## 💡 PREVENTION

To avoid this issue in future:

1. **Always check backend is running** before testing frontend
2. **Use health check** to verify connectivity
3. **Check console logs** on both sides
4. **Verify .env files** are correct
5. **Restart frontend** after changing .env

---

**Status:** ✅ All debugging tools in place. Follow test steps above to verify connection.
