# Login Flow - Troubleshooting & Testing Guide

## Login Flow Overview

```
User enters name + mobile
         ↓
Click "Login" button
         ↓
loginFarmer() API call to POST /login
         ↓
Backend creates or fetches farmer in database
         ↓
Backend returns { success: true, farmer_id, data: {...} }
         ↓
Frontend extracts farmer_id
         ↓
Frontend stores farmer_id in localStorage
         ↓
Frontend navigates to /soil-report
         ↓
Login complete ✅
```

---

## Testing Steps

### 1. Start Backend
```bash
cd backend
npm run dev

# Expected output:
# Soil2Crop Backend RUNNING
# Port: 3000
# Environment: development
```

### 2. Start Frontend
```bash
cd frontend
npm run dev

# Expected output:
# Local: http://localhost:8083
```

### 3. Test Login

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Navigate to** http://localhost:8083 (Login page should load)
4. **Enter test credentials:**
   - Name: `TestFarmer`
   - Mobile: `9876543210`
5. **Click Login button**
6. **Monitor Console Output**

---

## Console Debugging - What You'll See

### Successful Login Flow

```
[API] Configured BASE_URL: http://localhost:3000
[Login] Starting login process...
[Login] Calling loginFarmer API...
[LOGIN] Attempting login to: http://localhost:3000/login
[LOGIN] Payload: { name: 'TestFarmer', mobile: '9876543210' }
[LOGIN] Sending fetch request...
[LOGIN] Response received - Status: 200 OK
[LOGIN] Response headers Content-Type: application/json; charset=utf-8
[LOGIN] Parsed JSON response: {success: true, message: 'Login successful', farmer_id: 1, data: {…}}
[LOGIN] Response success flag: true
[LOGIN] Response farmer_id fields: {root: 1, data: 1}
[LOGIN] API call successful, returning result
[Login] API response received: {success: true, message: 'Login successful', farmer_id: 1, data: {…}}
[Login] Extracted farmer_id: 1
[Login] Login successful with farmer_id: 1
[Login] Stored credentials in localStorage:
[Login]   farmer_id = 1
[Login]   farmer_name = TestFarmer
[Login] Now navigating to /soil-report...
[Login] Navigation command executed
```

✅ **Result**: Page redirects to Soil Report

---

### Failed Login - Network Error

```
[Login] Starting login process...
[LOGIN] Attempting login to: http://localhost:3000/login
[LOGIN] Payload: {name: 'TestFarmer', mobile: '9876543210'}
[LOGIN] Sending fetch request...
[LOGIN] Failed - Error details: {message: 'Failed to fetch', stack: '...', url: 'http://localhost:3000/login'}
[Login] Error during login: Error: Failed to fetch
```

**Possible causes:**
- Backend not running
- CORS misconfiguration
- Wrong API URL in .env.local

**Fix:**
```bash
# Check backend is running on port 3000
curl http://localhost:3000/
# Should return: { message: "Soil2Crop Backend running", version: "2.0.0" }

# Check .env.local
cat frontend/.env.local
# Should show: VITE_API_URL=http://localhost:3000
```

---

### Failed Login - Backend Error

```
[LOGIN] Response received - Status: 400 Bad Request
[LOGIN] Parsed JSON response: {success: false, message: 'Name and mobile required'}
[LOGIN] HTTP error response: {status: 400, statusText: 'Bad Request', body: {…}}
[LOGIN] Failed - Error details: {message: 'Name and mobile required', …}
[Login] Error during login: Error: Name and mobile required
```

**Possible causes:**
- Empty name or mobile field
- Mobile number not 10 digits
- Request body not sent correctly

**Check:**
- Verify inputs are not empty
- Mobile must be exactly 10 digits
- Check console logs show correct payload

---

### Failed Login - Response Parsing Issue

```
[LOGIN] Response received - Status: 200 OK
[LOGIN] Parsed JSON response: {success: true, message: 'Login successful', farmer_id: 1, data: {…}}
[LOGIN] Response success flag: true
[LOGIN] Response farmer_id fields: {root: 1, data: 1}
[LOGIN] API call successful, returning result
[Login] API response received: {success: true, message: 'Login successful', farmer_id: 1, data: {…}}
[Login] Extracted farmer_id: 1
[Login] Login successful with farmer_id: 1
[Login] Stored credentials in localStorage:
[Login]   farmer_id = 1
[Login]   farmer_name = TestFarmer
[Login] Now navigating to /soil-report...
```

Then nothing happens (page doesn't redirect).

**Possible causes:**
- Navigation not working (React Router issue)
- Browser blocking redirect
- Component dismounted before navigation

**Fix:**
- Check browser console for errors
- Verify React Router is setup correctly
- Try manual navigation in console: `window.location.href = '/soil-report'`

---

## Backend Console Debugging

### What Backend Logs Show

```
[Backend] Login request received: { name: 'TestFarmer', mobile: '9876543210' }
[Backend] Farmer created/fetched: {
  id: 1,
  name: 'TestFarmer',
  mobile: '9876543210',
  language: 'en',
  created_at: '2025-02-14T...'
}
[Backend] Sending login response: {
  success: true,
  message: 'Login successful',
  farmer_id: 1,
  data: { farmer_id: 1, name: 'TestFarmer', language: 'en' }
}
```

---

## Common Issues & Fixes

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Backend not running** | "Failed to fetch" in console | Start backend: `npm run dev` |
| **Wrong port** | Connection refused | Check VITE_API_URL in .env.local |
| **CORS blocked** | "Access to XMLHttpRequest blocked" | Restart backend after CORS config |
| **Empty fields** | "Name and mobile required" error | Enter valid name and 10-digit mobile |
| **Invalid mobile** | Validation error in UI | Mobile must be exactly 10 digits |
| **Navigation not working** | Login succeeds but page doesn't change | Check React Router setup |
| **localStorage not set** | Check DevTools Application tab | Look for farmer_id in Storage > localStorage |

---

## localStorage Verification

After successful login:

1. **Open DevTools** (F12)
2. **Go to Storage tab** (or Application tab)
3. **Expand localStorage**
4. **Find your domain** (http://localhost:8083)
5. **Check for:**
   - `farmer_id` = "1" (or assigned ID)
   - `farmer_name` = "TestFarmer"

**Command line check:**
```javascript
// In DevTools Console:
localStorage.getItem('farmer_id')    // Should show: "1"
localStorage.getItem('farmer_name')  // Should show: "TestFarmer"
```

---

## Response Format Reference

### Backend Response (New Format)
```json
{
  "success": true,
  "message": "Login successful",
  "farmer_id": 1,
  "data": {
    "farmer_id": 1,
    "name": "TestFarmer",
    "language": "en"
  }
}
```

### Frontend Extract Logic
```javascript
const farmerId = response.farmer_id || response.data?.farmer_id;
// farmerId = 1 (extracted from either root or data wrapper)
```

---

## Database Check

To verify farmer was created in database:

```bash
# Open SQLite database
sqlite3 backend/soil2crop.db

# List all farmers
SELECT id, name, mobile, language, created_at FROM farmers;

# Expected output:
# 1|TestFarmer|9876543210|en|2025-02-14 ...
```

---

## Complete Manual Test Script

```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend
cd frontend && npm run dev

# Browser:
# 1. Open http://localhost:8083
# 2. Open DevTools (F12) → Console tab
# 3. Enter: name=TestFarmer, mobile=9876543210
# 4. Click Login
# 5. Check console for [Login] messages
# 6. Verify page redirects to /soil-report
# 7. Check localStorage has farmer_id
# 8. Verify console shows no errors

# Manual API test:
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"name":"TestFarmer","mobile":"9876543210"}'

# Expected response:
# {"success":true,"message":"Login successful","farmer_id":1,"data":{"farmer_id":1,"name":"TestFarmer","language":"en"}}
```

---

## Expected Behavior

### ✅ Successful Login
1. Enter credentials
2. Click Login
3. See "Logged in successfully" toast
4. Page redirects to Soil Report page
5. farmer_id in localStorage
6. Can upload soil reports and proceed

### ❌ Failed Login
1. Enter credentials
2. Click Login
3. See error toast with reason
4. Page stays on login
5. Can retry with different credentials

---

## Summary

| Component | File | Role |
|-----------|------|------|
| **Login Form** | `frontend/src/pages/Login.tsx` | Collects credentials, calls API, stores data, navigates |
| **API Client** | `frontend/src/api.js` | Sends POST /login request, returns response |
| **Backend Endpoint** | `backend/index.js` | Creates/fetches farmer, returns standardized response |
| **Database** | `backend/soil2crop.db` | Stores farmer data |

All components have detailed console logging to help debug issues.

---

## Quick Troubleshooting Checklist

- [ ] Backend running on localhost:3000
- [ ] Frontend running on localhost:8083  
- [ ] .env.local exists with VITE_API_URL
- [ ] Name field has value
- [ ] Mobile is exactly 10 digits
- [ ] DevTools console shows [Login] messages
- [ ] No CORS errors in console
- [ ] farmer_id in localStorage after login
- [ ] Page redirects to /soil-report
- [ ] Soil Report page can fetch farmer_id

---

**Status**: Login flow complete with full debugging support  
**Last Updated**: February 14, 2026
