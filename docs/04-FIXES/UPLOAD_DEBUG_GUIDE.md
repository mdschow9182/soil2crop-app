# Soil Report Upload Debug Guide

## Overview
Enhanced logging has been added to help diagnose soil report upload issues. Follow these steps to test and debug.

## Test Steps

### 1. Start Backend with Logging
```powershell
cd backend
node index.js
```

Watch for console output:
- `[Backend] Soil upload received - file: true, body: { farmer_id: '1' }`
- `[Backend] Processing upload for farmer: 1, file: myfile.pdf`
- `[Backend] Extracted values: { ph: 7.5, soil_type: 'Loamy', ... }`
- `[Backend] Soil report created with ID: 1`

### 2. Start Frontend in New Terminal
```powershell
cd frontend
npm run dev
```

### 3. Test Upload Flow
1. Navigate to login, enter any name/mobile
2. Click "Upload Report" on soil input page
3. Select a PDF or image file
4. Watch browser **DevTools Console** for logs:
   - `[SoilReport] Starting file upload: { fileName: 'report.pdf', ... }`
   - `[SoilReport] Upload response: { success: true, data: { ... } }`

### 4. Check Backend Console
- Look for `[Backend] Soil upload received`
- Error messages will show exact issue (file validation, DB insert, etc.)

## Common Issues & Solutions

### Issue: "File and farmer_id required"
**Solution**: Ensure FormData has both fields:
- `formData.append("soil_report", file)`  
- `formData.append("farmer_id", farmerId)`

### Issue: "Invalid file type"
**Allowed types**: PDF, JPEG, PNG only
- Check file extension matches MIME type
- Corrupted files might have wrong MIME type

### Issue: "Upload failed" with no extraction
**Expected behavior**: 
- PDFs should extract values automatically
- Images require manual entry (no OCR in demo)

### Issue: No log output in backend console
**Check**:
1. Backend actually running (`[Backend] Login request received` should appear)
2. Request reaching `/soil-reports/upload` endpoint
3. Network tab in DevTools to see request/response

## File Locations
- Frontend logs: Browser DevTools Console
- Backend logs: Terminal running `node index.js`
- Uploaded files: `backend/uploads/soil-reports/` (on disk)
- Database: `backend/soil2crop.db` (SQLite, use SQLite Browser to inspect)

## Response Format
**Success (PDF with extracted values)**:
```json
{
  "success": true,
  "data": {
    "extracted_values": {
      "ph": 7.5,
      "soil_type": "Loamy",
      "nitrogen": 20,
      "phosphorus": 15,
      "potassium": 25
    },
    "parsing_notes": [
      "Extracted from PDF successfully"
    ],
    "report_id": 1
  }
}
```

**Success (Image - no extraction)**:
```json
{
  "success": true,
  "data": {
    "extracted_values": {},
    "parsing_notes": [
      "Image upload successful. Please enter values manually."
    ],
    "report_id": 2
  }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Invalid file type. Allowed: image/jpeg, image/png, image/gif, image/jpg"
}
```

## Quick Verify Checklist
- [ ] Backend starts without errors
- [ ] CORS allows `http://localhost:5173`
- [ ] Upload folder exists: `backend/uploads/soil-reports/`
- [ ] Database `farmers` table has logged-in farmer
- [ ] DevTools shows request to `/soil-reports/upload`
- [ ] Response status is 200 (success) or 400/500 (error)
- [ ] File appears in `backend/uploads/soil-reports/` after upload
