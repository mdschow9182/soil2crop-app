# 🧪 Farmer API - Quick Testing Guide

**Status:** ✅ Ready to Test  
**Time Required:** 5 minutes  

---

## Step 1: Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ MongoDB connected successfully
🚀 Soil2Crop Backend running on port 3000
Version: 3.0.0
```

---

## Step 2: Test All Endpoints

### Test 1: Login/Register Farmer (POST)

```bash
curl -X POST http://localhost:3000/api/farmers/login \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ramesh Kumar\",\"mobile\":\"9876543210\",\"language\":\"te\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "67cab8a5e1d9d3f5e8b12345",
    "id": "67cab8a5e1d9d3f5e8b12345",
    "name": "Ramesh Kumar",
    "mobile": "9876543210",
    "language": "te",
    "district": "Unknown",
    "createdAt": "2026-03-09T...",
    "updatedAt": "2026-03-09T..."
  }
}
```

**⚠️ Save the `_id` value for next tests!**

---

### Test 2: Get Farmer by ID (GET)

Replace `YOUR_FARMER_ID` with the ID from Test 1:

```bash
curl http://localhost:3000/api/farmers/YOUR_FARMER_ID
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Farmer retrieved successfully",
  "data": {
    "_id": "67cab8a5e1d9d3f5e8b12345",
    "name": "Ramesh Kumar",
    "mobile": "9876543210",
    "language": "te",
    "district": "Unknown"
  }
}
```

---

### Test 3: Update Language (PUT)

Replace `YOUR_FARMER_ID` with the ID from Test 1:

```bash
curl -X PUT http://localhost:3000/api/farmers/YOUR_FARMER_ID/language \
  -H "Content-Type: application/json" \
  -d "{\"language\":\"hi\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Language updated successfully",
  "data": {
    "id": "YOUR_FARMER_ID",
    "language": "hi"
  }
}
```

---

### Test 4: Verify Language Updated (GET)

```bash
curl http://localhost:3000/api/farmers/YOUR_FARMER_ID
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "67cab8a5e1d9d3f5e8b12345",
    "name": "Ramesh Kumar",
    "mobile": "9876543210",
    "language": "hi",  // ← Changed from 'te' to 'hi'
    "district": "Unknown"
  }
}
```

---

### Test 5: Get All Farmers (GET)

```bash
curl http://localhost:3000/api/farmers
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Farmers retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Ramesh Kumar",
      "mobile": "9876543210",
      "language": "hi"
    }
    // ... more farmers if they exist
  ]
}
```

---

### Test 6: Get Statistics (GET)

```bash
curl http://localhost:3000/api/farmers/stats
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalFarmers": 1,
    "languageDistribution": [
      {
        "language": "hi",
        "count": 1
      }
    ]
  }
}
```

---

## Error Testing

### Test Invalid ID Format

```bash
curl http://localhost:3000/api/farmers/invalid-id
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid id: must be a valid MongoDB ObjectId"
}
```

---

### Test Non-Existent Farmer

```bash
curl http://localhost:3000/api/farmers/000000000000000000000000
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Farmer not found"
}
```

---

### Test Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/farmers/login \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Name and mobile number are required"
}
```

---

### Test Invalid Mobile Number

```bash
curl -X POST http://localhost:3000/api/farmers/login \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"mobile\":\"123\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Mobile number must be a valid 10-digit number"
}
```

---

### Test Invalid Language

```bash
curl -X PUT http://localhost:3000/api/farmers/YOUR_FARMER_ID/language \
  -H "Content-Type: application/json" \
  -d "{\"language\":\"invalid\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Language must be one of: en, hi, te, ta, kn, ml"
}
```

---

## Frontend Integration Test

### Open Browser DevTools

1. Open your React app: `http://localhost:5173`
2. Open DevTools → Network tab
3. Clear any existing network logs

### Test Login Flow

1. Go to login page
2. Enter test credentials:
   - Name: Ramesh Kumar
   - Mobile: 9876543210
   - Language: Telugu
3. Click Login
4. Check Network tab for API call to `/api/farmers/login`
5. Verify response contains farmer data

### Test Language Fetch

1. After login, check if frontend calls `/api/farmers/:id`
2. Verify language is correctly loaded
3. Change language using language selector
4. Verify PUT request to `/api/farmers/:id/language`

---

## Success Criteria

All tests pass if:

- ✅ Login/register returns farmer data
- ✅ Get farmer by ID works
- ✅ Language update works
- ✅ All validations reject invalid input
- ✅ Error responses are properly formatted
- ✅ No 404 errors for valid endpoints
- ✅ Frontend can fetch and update farmer data

---

## Troubleshooting

### Problem: "Cannot connect to server"

**Solution:**
```bash
# Check if server is running
netstat -ano | findstr :3000

# If not running, restart server
cd backend
npm start
```

---

### Problem: "MongoDB connection failed"

**Solution:**
```bash
# Check MongoDB is running
mongosh

# If using in-memory DB, ensure it's configured
# Check backend/.env has correct MONGO_URI
```

---

### Problem: "Routes not found"

**Solution:**
```bash
# Verify routes are registered in index.js
grep -n "farmerRoutes" backend/index.js

# Should show: app.use('/api/farmers', farmerRoutes);
```

---

### Problem: "Validation errors"

**Solution:**
- Ensure mobile is exactly 10 digits
- Ensure language is one of: en, hi, te, ta, kn, ml
- Ensure ID is valid MongoDB ObjectId (24 hex characters)

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Farmer API is production-ready
2. ✅ Frontend integration should work
3. ✅ Language system will function across app
4. ✅ No more 404 errors for farmer endpoints

---

## Complete Test Script

Save as `test-farmer-api.sh` (Linux/Mac) or `test-farmer-api.bat` (Windows):

```bash
#!/bin/bash

echo "🧪 Testing Farmer API..."
echo ""

# Test 1: Login
echo "1️⃣  Testing Login/Register..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/farmers/login \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Farmer\",\"mobile\":\"9999999999\",\"language\":\"en\"}")

echo $RESPONSE | jq '.'

FARMER_ID=$(echo $RESPONSE | jq -r '.data._id')
echo ""
echo "Farmer ID: $FARMER_ID"
echo ""

# Test 2: Get Farmer
echo "2️⃣  Testing Get Farmer..."
curl -s http://localhost:3000/api/farmers/$FARMER_ID | jq '.'
echo ""

# Test 3: Update Language
echo "3️⃣  Testing Update Language..."
curl -s -X PUT http://localhost:3000/api/farmers/$FARMER_ID/language \
  -H "Content-Type: application/json" \
  -d "{\"language\":\"te\"}" | jq '.'
echo ""

# Test 4: Verify Update
echo "4️⃣  Verifying Language Update..."
curl -s http://localhost:3000/api/farmers/$FARMER_ID | jq '.data.language'
echo ""

# Test 5: Get All Farmers
echo "5️⃣  Testing Get All Farmers..."
curl -s http://localhost:3000/api/farmers | jq '.data | length'
echo ""

# Test 6: Statistics
echo "6️⃣  Testing Statistics..."
curl -s http://localhost:3000/api/farmers/stats | jq '.'
echo ""

echo "✅ All tests completed!"
```

Run with:
```bash
chmod +x test-farmer-api.sh
./test-farmer-api.sh
```

---

**Happy Testing!** 🎉
