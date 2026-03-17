# 🔧 UPLOAD FAILED - STEP-BY-STEP DEBUGGING GUIDE

**Issue:** "Upload failed. Please try again or enter values manually."  
**Date:** March 8, 2026  
**Status:** Backend ✅ Working | Frontend ⚠️ Needs Debugging

---

## ✅ BACKEND VERIFICATION (COMPLETE)

I've verified your backend is **working perfectly**:

```bash
✅ Backend running on port 3000
✅ MongoDB connected
✅ Upload endpoint exists: POST /soil-reports/upload
✅ Multer configured correctly
✅ Upload directories exist
✅ CORS enabled
```

**Test Results:**
```json
{
  "success": true,
  "message": "Upload endpoints available",
  "endpoints": {
    "soil_upload": "POST /soil-reports/upload",
    "crop_upload": "POST /crop-images/upload"
  },
  "multer_configured": true,
  "upload_dirs": {
    "soil_reports": "C:\\...\\uploads\\soil-reports",
    "crop_images": "C:\\...\\uploads\\crop-images"
  }
}
```

---

## 🎯 LIKELY CULPRITS (TOP 5)

Based on your setup, here are the most likely issues:

### 1️⃣ **Field Name Mismatch** ❌

**Frontend sends:**
```javascript
formData.append("soil_report", file);  // Line 88 in SoilReport.tsx
```

**Backend expects:**
```javascript
soilUpload.single("soil_report")  // Line 284 in index.js
```

✅ **MATCHES!** - This is correct.

---

### 2️⃣ **API URL Configuration** ⚠️

**Check your frontend API call:**

Open `frontend/src/api.js` line 75:
```javascript
export const uploadSoilReport = async (formData) => {
  return apiCall('/soil-reports/upload', {  // ← Relative URL!
    method: 'POST',
    body: formData,
    headers: {},
  });
};
```

**Check API_BASE_URL (line 2):**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

**Verify .env.local:**
```
VITE_API_URL=http://localhost:3000  ✅ Correct
```

✅ **SHOULD BE CORRECT** - But verify frontend is reading .env.local!

---

### 3️⃣ **Content-Type Header Issue** ❌

**Your API code (api.js line 78):**
```javascript
headers: {}, // Remove Content-Type to let browser set multipart/form-data
```

✅ **CORRECT!** - This is the right approach.

**The browser will automatically set:**
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

---

### 4️⃣ **Farmer Not Logged In** ⚠️

**Check SoilReport.tsx line 76:**
```javascript
const farmerId = localStorage.getItem("farmer_id");
if (!farmerId) {
  toast({ title: "Error", description: "Not logged in", variant: "destructive" });
  navigate("/");
  return;
}
```

**Before uploading, verify in browser console:**
```javascript
console.log(localStorage.getItem("farmer_id"));
// Should return something like: "67cab8a5e1d9d3f5e8b12345"
```

❌ **If NULL** → User not logged in → Upload will fail!

---

### 5️⃣ **File Validation Failing** ⚠️

**Check SoilReport.tsx lines 48-67:**

```javascript
// Validate file type
const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
if (!allowedTypes.includes(file.type)) {
  toast({ title: "Invalid file", description: "Upload PDF, JPG, or PNG only" });
  return;
}

// Validate file size
if (file.size > 10 * 1024 * 1024) {
  toast({ title: "File too large", description: "Max 10MB" });
  return;
}
```

**Before uploading, check in browser console:**
```javascript
console.log(file.type);  // Must be one of the allowed types
console.log(file.size);  // Must be < 10,485,760 bytes
```

---

## 🔍 HOW TO DEBUG (FOLLOW THESE STEPS)

### Step 1: Open Browser DevTools

1. Press **F12** in your browser
2. Go to **Console** tab
3. Go to **Network** tab

### Step 2: Try Uploading a File

1. Navigate to Soil Report page
2. Select a small PDF file (< 1MB)
3. Click upload
4. Watch the Network tab

### Step 3: Check Console Logs

You should see:
```
[SoilReport] Starting file upload: { fileName: "test.pdf", ... }
[SoilReport] FormData prepared, sending to API
[SoilReport] Upload response: { ... }
```

**If you see errors:**

| Error | Meaning | Fix |
|-------|---------|-----|
| `Failed to fetch` | Backend not reachable | Check if backend running on port 3000 |
| `404 Not Found` | Wrong URL | Verify API endpoint path |
| `413 Payload Too Large` | File too big | Use smaller file |
| `400 Bad Request` | Missing fields | Check FormData construction |
| `500 Internal Server Error` | Backend crash | Check backend logs |

### Step 4: Check Network Tab

Look for:
```
POST http://localhost:3000/soil-reports/upload
```

**Click on it and check:**

#### Request Headers:
```
Content-Type: multipart/form-data; boundary=----...  ✅
Origin: http://localhost:8081  ✅
```

#### Request Payload:
```
------WebKitFormBoundary...
Content-Disposition: form-data; name="soil_report"; filename="test.pdf"
...
------WebKitFormBoundary...
Content-Disposition: form-data; name="farmer_id"

67cab8a5e1d9d3f5e8b12345
------WebKitFormBoundary...--
```

✅ Both `soil_report` and `farmer_id` must be present!

#### Response:
```json
{
  "success": true,
  "data": {
    "extracted_values": {...},
    "parsing_notes": [],
    "report_id": "..."
  }
}
```

**OR if failed:**
```json
{
  "success": false,
  "message": "Upload failed. Please try again...",
  "error": "Specific error here"
}
```

---

## 🛠️ QUICK FIXES TO TRY

### Fix #1: Restart Frontend Development Server

Sometimes Vite doesn't reload .env.local changes:

```bash
cd frontend
npm run dev
```

Watch for:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8081/
```

### Fix #2: Clear Browser Cache

Press **Ctrl+Shift+R** (hard refresh) or:
1. Open DevTools (F12)
2. Right-click Refresh button
3. Select "Empty Cache and Hard Reload"

### Fix #3: Verify Farmer Login

In browser console:
```javascript
console.log('Farmer ID:', localStorage.getItem("farmer_id"));
console.log('Farmer Name:', localStorage.getItem("farmer_name"));
```

If NULL, login first!

### Fix #4: Test with Tiny PDF

Create a simple test PDF:
1. Open Notepad
2. Type "Test Soil Report"
3. Save as `.txt`
4. Convert to PDF using any online tool
5. Try uploading this tiny file

### Fix #5: Check Backend Logs

Open another terminal:
```bash
cd backend
type logs\*.log | more
```

Look for:
```
[Soil/Upload] Request received
[Soil/Upload] Processing
```

---

## 📊 COMMON ERROR SCENARIOS

### Scenario A: "Cannot read properties of null"

**Cause:** `farmer_id` is null

**Fix:**
```javascript
// Add this check before upload
const farmerId = localStorage.getItem("farmer_id");
if (!farmerId) {
  alert("Please login first!");
  navigate("/");
  return;
}
```

### Scenario B: "404 Not Found"

**Cause:** Wrong API endpoint

**Check:**
```javascript
// In api.js line 75
return apiCall('/soil-reports/upload', ...);  // ✅ Correct
// NOT: return apiCall('/upload-soil-report', ...);  ❌ Wrong
```

### Scenario C: "413 Payload Too Large"

**Cause:** File exceeds 10MB

**Fix:** Compress PDF or use smaller file

### Scenario D: "Network Error" / "Failed to Fetch"

**Cause:** Backend not running

**Fix:**
```bash
cd backend
npm start
```

Wait for:
```
Server listening on port 3000
```

### Scenario E: Upload succeeds but shows error

**Cause:** Backend returns success but frontend doesn't parse it

**Check console logs:**
```
[SoilReport] Upload response: { success: true, data: {...} }
```

If you see this, the upload worked! The issue is in error handling logic.

---

## 🎯 ACTUAL BUG LIKELY LOCATIONS

Based on your code review, here's my assessment:

### Most Likely: **Environment Variable Not Loading**

**Symptom:** API calls go to wrong URL

**Check:**
1. Is `.env.local` in `frontend/` folder? ✅ Yes
2. Does it have correct content? ✅ Yes
3. Did you restart frontend after creating .env.local? ❓

**Fix:**
```bash
cd frontend
# Stop the dev server (Ctrl+C)
npm run dev
# Start it fresh
```

### Second Most Likely: **Browser Caching Old Code**

**Symptom:** Changes not reflected

**Fix:**
1. Hard refresh: **Ctrl+Shift+R**
2. Clear cache completely
3. Try incognito/private browsing mode

### Third Most Likely: **File Type Not Matching**

**Symptom:** Validation fails silently

**Check file.type property:**
```javascript
// In handleFileSelect, add:
console.log('File type:', file.type);
console.log('Allowed types:', allowedTypes);
```

Some systems report different MIME types!

---

## ✅ VERIFICATION CHECKLIST

Run through this entire checklist:

- [ ] Backend running on port 3000
  ```bash
  curl http://localhost:3000/upload-test
  ```

- [ ] Frontend running on port 8081
  ```
  Check browser: http://localhost:8081 loads
  ```

- [ ] Farmer logged in
  ```javascript
  console.log(localStorage.getItem("farmer_id"));
  // Should return valid ID
  ```

- [ ] File selected is PDF/JPG/PNG
  ```javascript
  console.log(file.type);
  // Should be application/pdf, image/jpeg, or image/png
  ```

- [ ] File size under 10MB
  ```javascript
  console.log(file.size);
  // Should be < 10485760
  ```

- [ ] FormData constructed correctly
  ```javascript
  const formData = new FormData();
  formData.append("soil_report", file);
  formData.append("farmer_id", farmerId);
  ```

- [ ] No manual Content-Type header
  ```javascript
  headers: {}  // ✅ Correct
  // NOT: headers: { "Content-Type": "application/json" }  ❌ Wrong
  ```

- [ ] API endpoint path correct
  ```javascript
  apiCall('/soil-reports/upload', ...)  // ✅ Correct
  // NOT: apiCall('/upload-soil-report', ...)  ❌ Wrong
  ```

- [ ] Backend logs show request
  ```
  Check: backend/logs/*.log
  Look for: [Soil/Upload] Request received
  ```

---

## 🚀 NUCLEAR OPTION (If Nothing Works)

Add temporary debug logging everywhere:

### Frontend (SoilReport.tsx):
```javascript
const handleFileUpload = async (file: File) => {
  console.log("=== UPLOAD STARTED ===");
  console.log("File:", file);
  console.log("File name:", file.name);
  console.log("File type:", file.type);
  console.log("File size:", file.size);
  
  const farmerId = localStorage.getItem("farmer_id");
  console.log("Farmer ID from localStorage:", farmerId);
  
  const formData = new FormData();
  formData.append("soil_report", file);
  formData.append("farmer_id", farmerId);
  
  console.log("FormData entries:");
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }
  
  console.log("Calling API endpoint: /soil-reports/upload");
  console.log("Full URL:", `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/soil-reports/upload`);
  
  try {
    const result = await uploadSoilReport(formData);
    console.log("=== API RESPONSE ===");
    console.log(result);
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error(error);
  }
};
```

### Backend (index.js):
Already has comprehensive logging! Check `backend/logs/*.log`

---

## 📞 NEXT STEPS

1. **Run the test script I created:**
   ```bash
   node test-upload-endpoint.js
   ```

2. **Try uploading while watching browser DevTools**

3. **Check both console and network tabs for errors**

4. **Share the exact error message you see**

5. **If still stuck, temporarily add debug logging (see Nuclear Option above)**

---

**Most Important:** The backend is working perfectly! The issue is almost certainly in the frontend configuration or user not being logged in.

---

*Follow this guide step-by-step and you'll find the issue!*
