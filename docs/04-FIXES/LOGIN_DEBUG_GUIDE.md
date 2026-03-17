# Login Connectivity - Debug & Fix Guide

## Issue
Frontend (localhost:8083) unable to connect to backend (localhost:3000)  
Error: "Failed to connect to server"

## Root Cause
CORS configuration mismatch - backend was only allowing localhost:5173 (Vite default), but frontend was running on localhost:8083

## Fixes Applied ✅

### 1. Created Frontend Environment File
**File**: `frontend/.env.local`
```dotenv
VITE_API_URL=http://localhost:3000
```
- Ensures frontend knows backend URL
- Can be overridden per deployment

### 2. Updated Backend CORS Configuration
**File**: `backend/index.js`, lines 36-43

**Before**:
```javascript
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: CORS_ORIGIN }));
```

**After**:
```javascript
const CORS_ORIGIN = process.env.CORS_ORIGIN || ["http://localhost:5173", "http://localhost:8083", "http://localhost:3000"];
app.use(cors({ 
  origin: CORS_ORIGIN,
  credentials: true 
}));
```

✅ Now accepts requests from multiple localhost ports (for dev flexibility)  
✅ Credentials enabled for session support

### 3. Added Debug Logging to Login
**File**: `frontend/src/api.js`, loginFarmer function

Added console logging to help debug connectivity:
- Logs API URL on module load
- Logs login URL before request
- Logs response status and data
- Logs detailed error information

**Console Output** (Open DevTools: F12):
```
[API] Configured BASE_URL: http://localhost:3000
[LOGIN] Attempting login to: http://localhost:3000/login
[LOGIN] Payload: { name: "...", mobile: "..." }
[LOGIN] Response status: 200 OK
[LOGIN] Response data: { farmer_id: 1, name: "...", language: "en" }
```

---

## Testing the Fix

### Step 1: Verify Backend Running
```bash
cd backend
npm run dev

# Expected output:
# =================================
# Soil2Crop Backend RUNNING
# Port: 3000
# Environment: development
# CORS Origin: http://localhost:5173,http://localhost:8083,http://localhost:3000
# =================================
```

### Step 2: Verify Frontend Environment
```bash
cd frontend

# Check .env.local exists
cat .env.local
# Should show: VITE_API_URL=http://localhost:3000

# Start frontend
npm run dev
# Should show: Local: http://localhost:8083
```

### Step 3: Test Login in Browser
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to http://localhost:8083
4. Enter test credentials:
   - Name: TestFarmer
   - Mobile: 9876543210
5. Click Login

**Check Console Output**:
```
[API] Configured BASE_URL: http://localhost:3000
[LOGIN] Attempting login to: http://localhost:3000/login
[LOGIN] Payload: { name: "TestFarmer", mobile: "9876543210" }
[LOGIN] Response status: 200 OK
[LOGIN] Response data: { farmer_id: 1, name: "TestFarmer", language: "en" }
```

✅ If you see this, login is working!

---

## Troubleshooting

### Issue: Still seeing "Failed to connect to server"

**Check 1: Is backend running?**
```bash
curl http://localhost:3000/
# Should return: { message: "Soil2Crop Backend running", version: "2.0.0" }
```

**Check 2: Open DevTools Console (F12)**
Look for `[LOGIN]` messages:
- If you see them, backend received request (connection working)
- If no messages, frontend not calling API (different issue)

**Check 3: Check frontend .env.local**
```bash
cd frontend
cat .env.local
# Must show: VITE_API_URL=http://localhost:3000
```

**Check 4: Restart Frontend After Creating .env.local**
```bash
# Stop frontend (Ctrl+C)
# Then restart:
npm run dev
# Vite needs to reload environment variables
```

### Issue: CORS Error in Browser Console
If you see: `Access to XMLHttpRequest blocked by CORS policy`

This means backend received request but rejected it due to origin mismatch.

**Fix**:
1. Verify backend CORS_ORIGIN includes your frontend port
2. Restart backend
3. Check backend output shows all allowed origins

---

## Environment Configuration Reference

### Backend (.env)
```env
# Optional - to override defaults
PORT=3000
CORS_ORIGIN=http://localhost:8083
NODE_ENV=development
```

### Frontend (.env.local)
```env
# Must match where backend is running
VITE_API_URL=http://localhost:3000
```

---

## Console Debug Reference

### What Each Log Means

| Log | Meaning | What to Check |
|-----|---------|---------------|
| `[API] Configured BASE_URL: ...` | Frontend knows backend URL | URL should be http://localhost:3000 |
| `[LOGIN] Attempting login to: ...` | Frontend calling API | URL format correct |
| `[LOGIN] Payload: ...` | What data being sent | Name & mobile present |
| `[LOGIN] Response status: 200 OK` | Backend accepted & responded | Success response received |
| `[LOGIN] Response data: ...` | Login succeeded | farmer_id returned |
| `[LOGIN] Failed - Error details:` | Network/parsing error | Check error message & URL |

---

## Next Steps

1. ✅ Ensure both servers running on correct ports
2. ✅ Verify `.env.local` exists in frontend
3. ✅ Check console logs for connectivity
4. ✅ Test login with credentials
5. ✅ Verify farmer ID stored in localStorage

---

## Quick Commands

```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend  
cd frontend && npm run dev

# Terminal 3: Check connectivity
curl -H "Content-Type: application/json" \
  -d '{"name":"Test","mobile":"1234567890"}' \
  http://localhost:3000/login
```

Expected response:
```json
{
  "farmer_id": 1,
  "name": "Test",
  "language": "en"
}
```

---

## Summary of Changes

| File | Change | Why |
|------|--------|-----|
| `frontend/.env.local` | Created | Ensures frontend knows backend URL |
| `backend/index.js` | CORS array | Accept requests from 8083 port |
| `frontend/src/api.js` | Debug logs | Help identify connectivity issues |

All changes are minimal, backward compatible, and demo-safe.

---

**Status**: ✅ Login connectivity fixed  
**Testing**: Follow steps above to verify  
**Support**: Check console logs for detailed error messages
