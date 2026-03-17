# Soil2Crop - Security & Quality Fixes Reference Guide

## Quick Start After Pull

### Backend Setup
```bash
cd backend

# 1. Copy environment template
cp .env.example .env

# 2. Configure environment (optional for demo)
# Default values work for local development
# nano .env

# 3. Install dependencies (if fresh clone)
npm install

# 4. Start server
npm run dev
# Output: Soil2Crop Backend RUNNING, Port: 3000, Environment: development
```

### Frontend Setup
```bash
cd frontend

# .env.example already exists with good defaults
# Ensure .env.local has:
VITE_API_URL=http://localhost:3000

# Start dev server
npm run dev
```

---

## What's New

### Security Improvements

#### 1. **Input Validation** ✅
- All ID parameters validated before processing
- Invalid IDs return: `400 { success: false, message: "Invalid ID..." }`

**Middleware Used**:
```javascript
app.get("/alerts/:farmer_id", validateId("farmer_id"), handler);
```

#### 2. **Environment Configuration** ✅
- Remove hardcoded values from code
- Configuration via `.env` file
- Supported vars: `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `TWILIO_*`

**Example**:
```bash
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

#### 3. **File Upload Security** ✅
- Strict MIME type validation
- Extension checking
- Automatic cleanup on error
- NOT served as public static files

**Allowed**:
- Images: `jpg, jpeg, png, gif`
- PDFs: `pdf`

#### 4. **Standardized Responses** ✅
All API endpoints return:
```json
{
  "success": true/false,
  "message": "Human readable message",
  "data": {}  // optional
}
```

#### 5. **Environment-Based API URL** ✅
Frontend reads API URL from environment:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

---

## Testing Security

### Test Invalid ID
```bash
curl -X GET http://localhost:3000/alerts/abc
# Expected 400: { success: false, message: "Invalid farmer_id: must be a positive integer" }
```

### Test File Upload
```bash
# Try uploading executable
curl -X POST http://localhost:3000/crop-images/upload \
  -F "crop_image=@virus.exe" \
  -F "farmer_id=1"
# Expected 400: Invalid file type
```

### Test Environment Variables
```bash
PORT=3001 npm run dev  # Backend starts on 3001
```

### Test Frontend API URL
```bash
# In frontend/.env.local
VITE_API_URL=http://different-api.com

# Frontend will use that URL
```

---

## Key Files

### New Files
- ✅ `backend/middleware/validation.js` - ID validation middleware
- ✅ `backend/middleware/auth.js` - Basic auth middleware
- ✅ `backend/utils/fileValidation.js` - File type validation
- ✅ `backend/.env.example` - Environment template
- ✅ `SECURITY_FIXES.md` - Detailed security documentation

### Modified Files
- ✅ `backend/index.js` - Integrated all security fixes
- ✅ `frontend/src/api.js` - Environment-based URL + error handling
- ✅ `frontend/src/pages/SoilReport.tsx` - Handle new response format
- ✅ `frontend/src/pages/CropMonitoring.tsx` - Handle new response format
- ✅ `frontend/src/pages/Alerts.tsx` - Handle new response format

---

## Response Format Changes

### Before
```json
// Error
{ "error": "Upload failed" }

// Success (inconsistent)
{ "extracted_values": {}, "success": true }
```

### After (Standardized)
```json
// Error
{ "success": false, "message": "Upload failed" }

// Success
{ "success": true, "message": "Upload successful", "data": { "extracted_values": {} } }
```

### Frontend Compatibility
```javascript
// New code handles both formats
const responseData = result.data || result;
```

---

## API Endpoint Changes

### Input Validation Applied To
- ✅ `GET /alerts/:farmer_id`
- ✅ `PUT /alerts/:alert_id/read`
- ✅ `PUT /alerts/farmer/:farmer_id/read-all`
- ✅ `DELETE /alerts/:alert_id`
- ✅ `PUT /farmers/:id/language`
- ✅ `POST /soil-reports/upload` (farmer_id in body)
- ✅ `POST /crop-images/upload` (farmer_id in body)
- ✅ `POST /soil2crop` (farmer_id in body)
- ✅ `POST /sms/test` (farmer_id in body)

### File Validation Applied To
- ✅ `POST /soil-reports/upload` - PDF/Image files
- ✅ `POST /crop-images/upload` - Image files

---

## Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Database
DB_PATH=./soil2crop.db

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_EXTENSIONS=jpg,jpeg,png,gif
ALLOWED_PDF_EXTENSIONS=pdf
```

### Frontend (.env.local)
```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

---

## Demo Readiness

✅ All existing functionality preserved
✅ No breaking changes to UI
✅ Backward compatible API responses
✅ Simple 1-line setup (.env files)
✅ Security-hardened but not over-engineered
✅ Demo-ready for immediate deployment

---

## Future Enhancements (Out of Scope)

- JWT authentication tokens
- Rate limiting
- HTTPS/TLS enforcement
- Advanced logging & monitoring
- Prepared statement enforcement
- CSRF protection tokens
- Content Security Policy headers

---

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :3000

# Use different port
PORT=3001 npm run dev
```

### Frontend API calls fail
```bash
# Verify VITE_API_URL in .env.local
cat frontend/.env.local

# Check backend is running
curl http://localhost:3000
```

### File upload fails
```bash
# Verify file type is allowed
# Allowed: jpg, jpeg, png, gif (images), pdf (documents)

# Check backend logs for validation errors
```

### ID validation errors
```bash
# IDs must be positive integers > 0
# Invalid: "abc", "0", "-1", "1.5"
# Valid: "1", "2", "123"
```

---

## Questions?

Refer to `SECURITY_FIXES.md` for comprehensive documentation.

---

*Last Updated: February 14, 2026*
*Security-focused Demo Version 2.0.0*
