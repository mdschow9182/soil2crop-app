# 🚀 Soil Report Upload - Quick Start Guide

## Problem Solved ✅

**Error:** `POST http://localhost:3000/soil-reports/upload - Failed to fetch`  
**Cause:** Backend server not running or CORS misconfiguration

---

## ⚡ Quick Fix (2 Steps)

### Step 1: Start the Upload Server

```bash
cd backend
node server-soil-upload.js
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║     🌱 SOIL2CROP UPLOAD SERVER RUNNING                  ║
╚══════════════════════════════════════════════════════════╝

📍 Server URL: http://localhost:3000
🔗 Test Endpoint: http://localhost:3000/test
📤 Upload Endpoint: http://localhost:3000/soil-reports/upload

✅ CORS enabled for:
   - http://localhost:8080
   - http://localhost:5173
   - http://localhost:3000
```

### Step 2: Test the Upload

**Option A: Use the HTML Test Page**
```bash
# Open in browser
backend/test-upload.html
```

**Option B: Use cURL**
```bash
curl -X POST http://localhost:3000/soil-reports/upload \
  -F "soil_report=@sample-report.pdf" \
  -F "farmer_id=test123"
```

**Option C: From React Frontend**
```typescript
const formData = new FormData();
formData.append('soil_report', fileInput.files[0]);
formData.append('farmer_id', '69b1980e8fbc2ab6ba7b0519');

const response = await fetch('http://localhost:3000/soil-reports/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

---

## 📋 API Documentation

### Endpoints

#### 1. **GET /test** - Health Check

**Request:**
```
GET http://localhost:3000/test
```

**Response:**
```json
{
  "success": true,
  "message": "Backend running successfully",
  "timestamp": "2026-03-12T10:30:45.123Z",
  "port": 3000
}
```

#### 2. **POST /soil-reports/upload** - Upload File

**Request:**
```
POST http://localhost:3000/soil-reports/upload
Content-Type: multipart/form-data

FormData:
- soil_report (file): PDF or image file
- farmer_id (string, optional): Farmer ID
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Soil report uploaded successfully",
  "file": {
    "filename": "soil_report-1710234567890-123456789.pdf",
    "originalname": "sample-report.pdf",
    "path": "C:\\...\\uploads\\soil-reports\\soil_report-1710234567890-123456789.pdf",
    "size": 245678,
    "mimetype": "application/pdf"
  },
  "farmer_id": "69b1980e8fbc2ab6ba7b0519"
}
```

**Error Response (400) - No File:**
```json
{
  "success": false,
  "message": "No file uploaded. Please attach a soil report file."
}
```

**Error Response (400) - File Too Large:**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB."
}
```

**Error Response (400) - Invalid Type:**
```json
{
  "success": false,
  "message": "Invalid file type: application/x-exe. Only PDF and images are allowed."
}
```

---

## 🔧 Configuration

### Allowed File Types
- ✅ PDF (`application/pdf`)
- ✅ JPG (`image/jpeg`)
- ✅ JPEG (`image/jpg`)
- ✅ PNG (`image/png`)

### File Size Limit
- Maximum: **10 MB**

### CORS Origins
By default, allows requests from:
- `http://localhost:8080`
- `http://localhost:5173` (Vite default)
- `http://localhost:3000`

To add more origins, edit `server-soil-upload.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'YOUR_NEW_ORIGIN'
  ]
}));
```

---

## 🐛 Troubleshooting

### Issue 1: "Failed to fetch" or "Connection refused"

**Symptoms:**
```
POST http://localhost:3000/soil-reports/upload
net::ERR_CONNECTION_RESET
```

**Solution:**
1. Make sure the backend server is running
2. Check if port 3000 is already in use
3. Run: `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Mac/Linux)

**Fix:**
```bash
# Kill process on port 3000 (Windows)
taskkill /F /IM node.exe

# Then restart
node server-soil-upload.js
```

### Issue 2: CORS Error

**Symptoms:**
```
Access to fetch at 'http://localhost:3000/soil-reports/upload' 
from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solution:**
1. Verify your frontend is running on one of the allowed origins
2. Check CORS configuration in `server-soil-upload.js`
3. Make sure you're calling `http://localhost:3000` (not `https` or different port)

### Issue 3: "File too large"

**Symptoms:**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB."
}
```

**Solution:**
- Compress your PDF or resize images
- Or increase limit in code (not recommended for production):
```javascript
const upload = multer({
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});
```

### Issue 4: "Invalid file type"

**Symptoms:**
```json
{
  "success": false,
  "message": "Invalid file type: application/x-msdownload. Only PDF and images are allowed."
}
```

**Solution:**
- Only upload PDF, JPG, JPEG, or PNG files
- Convert other formats to PDF first

---

## 💻 Integration with Existing Backend

If you want to integrate this into your existing `index.js`:

### 1. Add the Multer Configuration

```javascript
// In your index.js
const uploadsDir = path.join(__dirname, 'uploads');
const soilReportsDir = path.join(uploadsDir, 'soil-reports');

if (!fs.existsSync(soilReportsDir)) {
  fs.mkdirSync(soilReportsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, soilReportsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});
```

### 2. Add the Upload Route

```javascript
app.post('/soil-reports/upload', upload.single('soil_report'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('Upload received:', req.file.originalname);

    res.json({
      success: true,
      message: 'Soil report uploaded successfully',
      file: req.file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 📊 Server Logs

When a file is uploaded, you'll see:

```
===== SOIL REPORT UPLOAD RECEIVED =====
✓ File uploaded successfully:
  - Original Name: soil-report.pdf
  - MIME Type: application/pdf
  - Size: 245.67 KB
  - Saved Path: C:\...\uploads\soil-reports\soil_report-1710234567890-123456789.pdf
  - Field Name: soil_report
  - Farmer ID: 69b1980e8fbc2ab6ba7b0519
=====================================
```

---

## 🧪 Testing Checklist

- [ ] Backend server is running on port 3000
- [ ] Frontend is running on port 8080
- [ ] Can access `http://localhost:3000/test` in browser
- [ ] Can upload a small PDF (< 1MB)
- [ ] Can upload a JPG image
- [ ] Get appropriate error for file > 10MB
- [ ] Get appropriate error for invalid file type (.exe, .txt, etc.)
- [ ] Files are saved in `backend/uploads/soil-reports/`

---

## 📁 File Structure

After setup, your structure should be:

```
backend/
├── server-soil-upload.js          # ← New upload server
├── test-upload.html                # ← Test page
├── uploads/
│   └── soil-reports/
│       ├── soil_report-1710234567890-123456789.pdf
│       └── soil_report-1710234567891-987654321.jpg
├── index.js                        # ← Your main backend
└── package.json
```

---

## 🎯 Next Steps

### For Development:
1. ✅ Start upload server: `node server-soil-upload.js`
2. ✅ Test with HTML page or cURL
3. ✅ Integrate with React frontend

### For Production:
1. ⚠️ Add authentication middleware
2. ⚠️ Implement virus scanning
3. ⚠️ Add cloud storage (AWS S3, Azure Blob)
4. ⚠️ Set up CDN for file delivery
5. ⚠️ Implement rate limiting per user

---

## 🆘 Need Help?

### Common Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Server not running | Start backend: `node server-soil-upload.js` |
| `CORS policy` | Origin mismatch | Check CORS origins in server config |
| `LIMIT_FILE_SIZE` | File > 10MB | Compress file or increase limit |
| `ENOENT` | Directory missing | Server creates it automatically on first run |

---

## 📞 Quick Commands

### Start Server
```bash
cd backend
node server-soil-upload.js
```

### Test Endpoint
```bash
curl http://localhost:3000/test
```

### Upload File
```bash
curl -X POST http://localhost:3000/soil-reports/upload \
  -F "soil_report=@test.pdf" \
  -F "farmer_id=123"
```

### Check Port Usage
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

---

**Status:** ✅ Ready to Use  
**Version:** 1.0.0  
**Last Updated:** March 12, 2026
