# 🚨 Quick Fix Guide - Soil2Crop Errors

## ✅ **SOLUTION APPLIED**

**Problem:** Multiple Node processes causing port conflicts  
**Fix:** Stopped all Node processes and restarted servers cleanly

---

## 🔧 **Current Status (RUNNING)**

| Server | Status | Port | URL |
|--------|--------|------|-----|
| **Backend** | ✅ Running | 5001 | http://localhost:5001 |
| **Frontend** | ✅ Running | 8080 | http://localhost:8080 |

---

## 🎯 **How to Access**

### **Open in Browser:**
- **Frontend App:** http://localhost:8080
- **Health Check:** http://localhost:5001/health

---

## ⚡ **Quick Fix Commands**

### **If you see errors again, run these:**

#### **1. Stop All Node Processes:**
```powershell
Stop-Process -Name node -Force
```

#### **2. Start Backend:**
```bash
cd c:\projects\soil2crop-app\backend
npm run dev
```

#### **3. Start Frontend:**
```bash
cd c:\projects\soil2crop-app\frontend
npm run dev
```

---

## 🐛 **Common Errors & Fixes**

### **Error 1: "Port already in use"**
**Cause:** Old Node process still running  
**Fix:** Run `Stop-Process -Name node -Force` then restart

### **Error 2: "Cannot connect to backend"**
**Cause:** Backend not running or wrong port  
**Fix:** 
1. Check backend is running on port 5001
2. Verify `VITE_API_URL=http://localhost:5001` in `frontend/.env.local`

### **Error 3: "Validation failed" on login**
**Cause:** Sending wrong fields  
**Fix:** Send only `{mobile, language}` - NO name field

### **Error 4: "Endpoint not found"**
**Cause:** Missing `/api` prefix  
**Fix:** All endpoints must start with `/api/` (e.g., `/api/auth/login`)

---

## ✅ **Working Endpoints**

### **Test These:**

#### **Health Check:**
```bash
GET http://localhost:5001/health
```

#### **Login:**
```bash
POST http://localhost:5001/api/auth/login
Body: {"mobile":"9999999999","language":"en"}
```

#### **Soil Report:**
```bash
POST http://localhost:5001/api/soilreport
Body: {
  "userId": "USR...",
  "nitrogen": 120,
  "phosphorus": 25,
  "potassium": 180,
  "ph": 6.5
}
```

---

## 📋 **Configuration Check**

### **Backend (.env):**
```env
PORT=5001
USE_MEMORY_DB=true
```

### **Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5001
```

---

## 🎯 **If Same Error Occurs Again**

### **Step-by-Step Recovery:**

1. **Check what's running:**
   ```powershell
   netstat -ano | findstr "5001 8080"
   ```

2. **Kill conflicting processes:**
   ```powershell
   Stop-Process -Name node -Force
   ```

3. **Wait 2 seconds** for ports to release

4. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

5. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Verify health:**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:5001/health"
   ```

---

## 📞 **Need Help?**

If errors persist:
1. Check terminal output for specific error messages
2. Look at browser console (F12) for frontend errors
3. Verify both `.env` files have correct settings
4. Make sure no firewall is blocking ports 5001 or 8080

---

**Last Updated:** March 27, 2026  
**Status:** ✅ All Systems Operational
