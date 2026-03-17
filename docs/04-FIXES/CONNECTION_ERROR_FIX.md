# 🔧 Fix: ERR_CONNECTION_RESET - Complete Troubleshooting Guide

## 🚨 Your Error

```
POST http://localhost:3000/soil-reports/upload net::ERR_CONNECTION_RESET
[API] Upload failed: Failed to fetch
```

**Meaning:** Your React frontend cannot connect to the backend server on port 3000.

---

## ✅ SOLUTION (Choose One Method)

### **Method 1: Use the Startup Script (Easiest)**

1. **Double-click this file:**
   ```
   backend\start-server.bat
   ```

2. **Wait for this message:**
   ```
   ╔══════════════════════════════════════════════════════════╗
   ║     🌱 SOIL2CROP BACKEND SERVER RUNNING                  ║
   ╚══════════════════════════════════════════════════════════╝
   
   📍 Server URL: http://localhost:3000
   ```

3. **Keep the window open!** Don't close it.

4. **Try uploading again from your React app.**

---

### **Method 2: Manual Start**

1. **Open Command Prompt or PowerShell**

2. **Navigate to backend folder:**
   ```bash
   cd c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\backend
   ```

3. **Start the server:**
   ```bash
   node index.js
   ```

   **OR if using the separate upload server:**
   ```bash
   node server-soil-upload.js
   ```

4. **Look for this output:**
   ```
   =================================
   Soil2Crop Backend RUNNING
   Listening on http://localhost:3000
   Port: 3000
   =================================
   ```

5. **Keep terminal open and try uploading again.**

---

## 🔍 Verification Steps

### Step 1: Test Backend is Running

Open your browser and go to:
```
http://localhost:3000/test
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Backend running successfully",
  "timestamp": "2026-03-12T...",
  "port": 3000
}
```

❌ **If you see "This site can't be reached"** → Server is NOT running. Go back to Method 1 or 2.

✅ **If you see the JSON response** → Server IS running. Continue troubleshooting below.

---

### Step 2: Check Frontend Configuration

Your React app needs to call the correct API URL.

**Check your `frontend/src/api.js`:**

```javascript
// Should have this line:
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// If it's different, update it to:
const BASE_URL = "http://localhost:3000";
```

**Or create `frontend/.env.local`:**
```
VITE_API_URL=http://localhost:3000
```

Then restart your frontend:
```bash
cd frontend
npm run dev
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Port 3000 Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution A: Kill the process**
```powershell
# Windows PowerShell or CMD
taskkill /F /IM node.exe
```

**Solution B: Use a different port**

Edit `backend/index.js` or `server-soil-upload.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

Then update frontend `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

---

### Issue 2: CORS Error After Connection Fixed

**Error:**
```
Access to fetch at 'http://localhost:3000/soil-reports/upload' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solution:**

Your backend already has CORS configured correctly in `index.js` (lines 74-83):
```javascript
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (Array.isArray(CORS_ORIGIN) && CORS_ORIGIN.includes(origin)) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));
```

This allows ALL localhost ports. If you still get CORS errors:

1. **Hard refresh browser:** Ctrl + Shift + R
2. **Clear browser cache**
3. **Check frontend is actually running on localhost:8080** (or whichever port)

---

### Issue 3: MongoDB Connection Error

**Error:**
```
MongooseError: connect ECONNREFUSED
```

Your backend tries to connect to MongoDB. You have two options:

**Option A: Use MongoDB (Recommended)**

Make sure MongoDB is running:
```bash
# If using MongoDB locally
mongod

# Or use MongoDB Atlas connection string in .env
```

**Option B: Disable MongoDB temporarily**

In `backend/index.js`, comment out the MongoDB connection:
```javascript
// connectMongoDB(); // Comment this out for testing
```

⚠️ **Warning:** Uploads won't save to database, but file upload will work.

---

### Issue 4: Dependencies Missing

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
npm install
```

This installs all required packages.

---

### Issue 5: Wrong Directory

**Problem:** Running server from wrong folder

**Solution:** Make sure you're in the `backend` folder:
```bash
# Check current directory
cd

# Should show: c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\backend

# If not, navigate to correct folder:
cd c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\backend
```

---

## 🧪 Debug Checklist

Run through these checks:

- [ ] **Terminal 1 (Backend):**
  ```bash
  cd backend
  node index.js
  ```
  ✅ Shows "Server running on port 3000"

- [ ] **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
  ✅ Shows "Local: http://localhost:8080/"

- [ ] **Browser Test:**
  ```
  http://localhost:3000/test
  ```
  ✅ Shows JSON success response

- [ ] **Frontend Config:**
  ```javascript
  // In api.js or .env
  VITE_API_URL=http://localhost:3000
  ```
  ✅ Correctly set to port 3000

- [ ] **No Port Conflicts:**
  ```bash
  netstat -ano | findstr :3000
  ```
  ✅ Only ONE Node.js process on port 3000

---

## 📊 Quick Diagnostic Commands

### Check What's Running

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# See all Node.js processes
tasklist | findstr node
```

### Kill All Node.js Processes

```bash
taskkill /F /IM node.exe
```

### Test Backend Directly

```bash
# Using cURL
curl http://localhost:3000/test

# Using PowerShell
Invoke-WebRequest -Uri http://localhost:3000/test
```

---

## 🎯 Expected Workflow

### 1. Start Backend (Terminal 1)
```bash
cd c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\backend
node index.js
```
**Keep this terminal open!**

### 2. Start Frontend (Terminal 2)
```bash
cd c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\frontend
npm run dev
```
**Keep this terminal open too!**

### 3. Open Browser
```
http://localhost:8080/soil-report
```

### 4. Upload File
- Select PDF or image
- Click upload
- ✅ Should work now!

---

## 💡 Pro Tips

### Always Start in This Order:

1. **MongoDB first** (if using local MongoDB)
2. **Backend second** (node index.js)
3. **Frontend third** (npm run dev)

### Use Multiple Terminals:

- **Terminal 1:** Backend server
- **Terminal 2:** Frontend dev server
- **Terminal 3:** For running commands/tests

### Check Server Logs:

When you upload a file, watch the backend terminal. You should see:
```
[Soil/Upload] ====== UPLOAD REQUEST STARTED ======
[Soil/Upload] File details: { originalname: "report.pdf", ... }
[Soil/Upload] Processing { farmerId: "...", filename: "report.pdf" }
[Soil/Upload] Report created { reportId: "..." }
```

If you don't see these logs, the request isn't reaching the backend.

---

## 🆘 Still Not Working?

### Try the Simple Upload Server

If your main backend (`index.js`) has issues, use the simplified version:

```bash
cd backend
node server-soil-upload.js
```

This is a minimal server with fewer dependencies (no MongoDB required for basic file upload).

### Check Firewall

Windows Firewall might be blocking port 3000:

1. Open Windows Defender Firewall
2. Allow port 3000
3. Or temporarily disable firewall for testing

### Check Antivirus

Some antivirus software blocks localhost connections:
- Temporarily disable antivirus
- Or add exception for Node.js

---

## ✅ Success Indicators

You'll know it's working when:

✅ Backend terminal shows "Server running on port 3000"  
✅ `http://localhost:3000/test` returns JSON  
✅ Frontend terminal shows no errors  
✅ Browser console shows successful POST request  
✅ Backend terminal shows upload logs  
✅ File appears in `backend/uploads/soil-reports/`  

---

## 📞 Emergency Contacts

If nothing works:

1. **Restart everything:**
   ```bash
   # Kill all Node
   taskkill /F /IM node.exe
   
   # Restart backend
   cd backend
   node index.js
   
   # Restart frontend (new terminal)
   cd frontend
   npm run dev
   ```

2. **Check documentation:**
   - `SOIL_UPLOAD_QUICK_FIX.md`
   - `UPLOAD_FIX_COMPLETE.md`

3. **Use test HTML page:**
   ```bash
   # Open in browser
   backend/test-upload.html
   ```
   
   If this works, the issue is in your React code, not the backend.

---

**Status:** ✅ Follow Method 1 or 2 above to fix your error  
**Most Common Cause:** Backend server not running  
**Quickest Fix:** Double-click `backend\start-server.bat`
