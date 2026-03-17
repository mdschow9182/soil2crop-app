# 🔧 Soil Report Upload Fix - Implementation Guide

## Problem Analysis

The frontend sends FormData with a soil report file, but the backend returns HTTP 500. After analyzing the codebase, I identified several potential issues:

### Root Causes:
1. **Multer Error Handling**: No error handling for multer-specific errors
2. **Missing Field Validation**: No check if `req.file` exists before processing
3. **File System Issues**: Directory might not exist or permissions issues
4. **Content-Type Header**: Frontend might be setting Content-Type incorrectly (from memory)

---

## ✅ Complete Fix

### **Fix 1: Enhanced Multer Configuration**

**Location:** `backend/index.js` (Lines 129-140)

**Current Code:**
```javascript
const soilUpload = multer({
  dest: soilReportsDir,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const cropUpload = multer({
  dest: cropImagesDir,
  limits: { fileSize: 10 * 1024 * 1024 }
});
```

**Replace With:**
```javascript
// ================================
// MULTER CONFIG (ENHANCED)
// ================================
const soilUpload = multer({
  dest: soilReportsDir,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and images only
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      console.log('[Multer] File type accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.error('[Multer] Invalid file type:', file.mimetype);
      cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
  }
});

const cropUpload = multer({
  dest: cropImagesDir,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      console.log('[Multer] File type accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.error('[Multer] Invalid file type:', file.mimetype);
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});
```

---

### **Fix 2: Add Multer Error Handler Middleware**

**Add after the upload route definition** (around line 405):

```javascript
// Multer error handler for soil reports
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.error('[Soil/Upload] File size limit exceeded');
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILES') {
    logger.error('[Soil/Upload] Too many files uploaded');
    return res.status(400).json({
      success: false,
      message: 'Only one file allowed per upload.'
    });
  }
  
  if (err.message && err.message.includes('fileFilter')) {
    logger.error('[Soil/Upload] File type rejected:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Pass other errors to next handler
  next(err);
});
```

---

### **Fix 3: Enhanced Upload Route with Better Logging**

**Location:** `backend/index.js` (Lines 284-405)

**Current route is good, but add more detailed logging at the start:**

```javascript
app.post(
  "/soil-reports/upload",
  soilUpload.single("soil_report"),
  async (req, res) => {
    try {
      // DETAILED LOGGING
      logger.info("[Soil/Upload] ====== UPLOAD REQUEST STARTED ======");
      logger.info("[Soil/Upload] Request headers:", JSON.stringify(req.headers, null, 2));
      logger.info("[Soil/Upload] Request body:", JSON.stringify(req.body, null, 2));
      logger.info("[Soil/Upload] Has file:", !!req.file);
      
      if (req.file) {
        logger.info("[Soil/Upload] File details:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          filename: req.file.filename
        });
      }
      
      if (!req.file || !req.body.farmer_id) {
        logger.warn("[Soil/Upload] Missing file or farmer_id", { 
          hasFile: !!req.file, 
          hasFarmerId: !!req.body.farmer_id 
        });
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "File and farmer_id required" 
        });
      }

      // ... rest of existing code continues unchanged
```

---

### **Fix 4: Ensure Upload Directories Exist**

**Location:** `backend/index.js` (Lines 119-127)

**Current code is good, but add logging:**

```javascript
// ================================
// UPLOAD DIRECTORIES
// ================================
const uploadsDir = path.join(__dirname, "uploads");
const soilReportsDir = path.join(uploadsDir, "soil-reports");
const cropImagesDir = path.join(uploadsDir, "crop-images");

console.log('[Startup] Creating upload directories...');
[uploadsDir, soilReportsDir, cropImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log('[Startup] Creating directory:', dir);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log('[Startup] Directory exists:', dir);
  }
});
console.log('[Startup] Upload directories ready');
```

---

### **Fix 5: Frontend API Fix (CRITICAL)**

Based on the memory about FormData Content-Type issues, check `frontend/src/api.js`:

**Location:** `frontend/src/api.js`

**Make sure the upload function does NOT set Content-Type header:**

```javascript
export const uploadSoilReport = async (formData) => {
  console.log('[API] Starting soil report upload...');
  
  try {
    const result = await apiCall('/soil-reports/upload', {
      method: 'POST',
      body: formData,
      headers: {} // IMPORTANT: Let browser set multipart/form-data automatically
    });
    
    console.log('[API] Upload successful:', result);
    return result;
  } catch (error) {
    console.error('[API] Upload failed:', error.message);
    throw error;
  }
};
```

**DO NOT DO THIS:**
```javascript
// ❌ WRONG - Don't set Content-Type manually
headers: {
  'Content-Type': 'multipart/form-data'
}
```

**DO THIS:**
```javascript
// ✅ CORRECT - Let browser handle it
headers: {} // Browser will automatically set correct multipart/form-data with boundary
```

---

## 🧪 Testing Steps

### **Step 1: Restart Backend**
```bash
cd backend
npm start
```

Look for these logs:
```
[Startup] Creating upload directories...
[Startup] Directory exists: c:\...\backend\uploads
[Startup] Directory exists: c:\...\backend\uploads\soil-reports
[Startup] Directory exists: c:\...\backend\uploads\crop-images
[Startup] Upload directories ready
```

### **Step 2: Test Upload from Frontend**

1. Open frontend: http://localhost:5173
2. Login as a farmer
3. Go to "Soil Report" page
4. Select a PDF or image file
5. Click "Upload"

### **Step 3: Check Backend Logs**

You should see:
```
[Soil/Upload] ====== UPLOAD REQUEST STARTED ======
[Soil/Upload] Has file: true
[Soil/Upload] File details: { originalname: "test.pdf", mimetype: "application/pdf", ... }
[Soil/Upload] Processing { farmerId: "...", filename: "test.pdf" }
[Soil/Upload] Parsing PDF
[Soil/Upload] Report created { reportId: "..." }
```

### **Step 4: Verify File Created**

Check if file exists:
```
c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\backend\uploads\soil-reports\<random-filename>
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: "req.file is undefined"**

**Cause:** Multer didn't process the file

**Solutions:**
1. Check field name matches: `upload.single("soil_report")` must match FormData key
2. Check Content-Type is NOT set manually in frontend
3. Check file type is allowed (PDF or image)

**Frontend Code Example:**
```javascript
const formData = new FormData();
formData.append("soil_report", fileInput.files[0]); // Must match "soil_report"
formData.append("farmer_id", farmerId);

await fetch('/soil-reports/upload', {
  method: 'POST',
  body: formData
  // NO headers: { 'Content-Type': ... } !!!
});
```

---

### **Issue 2: HTTP 400 - "File and farmer_id required"**

**Cause:** Missing file or farmer_id in request

**Solution:**
- Ensure FormData has both fields
- Check field names are exactly: `"soil_report"` and `"farmer_id"`

---

### **Issue 3: HTTP 413 - "File too large"**

**Cause:** File exceeds 10MB limit

**Solution:**
- Compress file or reduce size
- Or increase limit in multer config (not recommended for production)

---

### **Issue 4: Permission Denied Errors**

**Cause:** Can't write to uploads directory

**Solution:**
```bash
# Windows (run as Administrator)
icacls "c:\Users\mdsch\OneDrive\Desktop\soil2crop-app\backend\uploads" /grant Users:F
```

---

## 📊 Expected Response

### **Success Response:**
```json
{
  "success": true,
  "data": {
    "extracted_values": {
      "ph": 7.2,
      "nitrogen": 45,
      "phosphorus": 30,
      "potassium": 200,
      "soil_type": "Clay Loam"
    },
    "parsing_notes": ["PDF parsed successfully"],
    "report_id": "67cabcd1234ef567890abcde"
  }
}
```

### **Error Response (Bad Request):**
```json
{
  "success": false,
  "message": "File and farmer_id required"
}
```

### **Error Response (Server Error):**
```json
{
  "success": false,
  "message": "Upload failed. Please try again or enter values manually.",
  "error": "Detailed error message here",
  "debug": "Stack trace in development mode"
}
```

---

## ✅ Verification Checklist

- [ ] Multer config includes fileFilter
- [ ] Upload directories exist
- [ ] Backend logs show detailed upload info
- [ ] Frontend does NOT set Content-Type header
- [ ] FormData field name is "soil_report"
- [ ] farmer_id is included in FormData
- [ ] File appears in uploads/soil-reports folder
- [ ] Database record is created
- [ ] Success response returned to frontend

---

## 🎯 Quick Fix Summary

**If you need ONE quick fix right now:**

1. **Backend:** Add enhanced logging to upload route (Fix #3)
2. **Frontend:** Remove any manual Content-Type headers from api.js
3. **Test:** Upload a small PDF (<1MB) first

This will give you detailed logs to identify the exact issue!

---

**Created:** March 7, 2026  
**Status:** Ready to implement  
**Estimated Time:** 15 minutes
