# 🚀 QUICK START GUIDE - UPDATED

**Version:** 3.0.0 (Production Ready)  
**Last Updated:** March 7, 2026

---

## ⚡ FASTEST WAY TO GET STARTED

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment (OPTIONAL)

**Default configuration works out of the box!**

To customize:

```bash
# Backend - Edit backend/.env
# Most important: Set your MongoDB URI
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/soil2crop

# Frontend - Edit frontend/.env.local
VITE_API_URL=http://localhost:3000
```

### Step 3: Start the Application

**Option A: Automated Start (Windows)**
```bash
quick-start.bat
```

**Option B: Manual Start**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Expected output:
# =================================
# Soil2Crop Backend RUNNING
# Listening on http://localhost:3000
# =================================

# Terminal 2 - Frontend
cd frontend
npm run dev

# Expected output:
# VITE v5.x.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

### Step 4: Verify System

```bash
node verify-system.js
```

**Expected Output:**
```
✓ Backend server is reachable
✓ Health check endpoint works
✓ Database is accessible

✅ All systems operational!
```

### Step 5: Open in Browser

Navigate to: **http://localhost:5173**

---

## 🔧 WHAT'S NEW IN v3.0.0

### ✨ New Features:

1. **Professional Logging System**
   - Logs saved to `backend/logs/`
   - JSON format for easy parsing
   - Color-coded console output

2. **Enhanced Security**
   - Rate limiting (100 req/15min general, 10 req/15min auth)
   - Input sanitization (XSS protection)
   - Environment variable validation

3. **Alert System Enabled**
   - Full CRUD operations for alerts
   - Crop calendar integration
   - Read/unread tracking

4. **Better Configuration**
   - `.env` files provided
   - Sensible defaults
   - Feature flags available

---

## 📁 PROJECT STRUCTURE

```
soil2crop-app/
├── backend/
│   ├── .env                    # ← NEW: Configuration
│   ├── utils/
│   │   └── logger.js          # ← NEW: Professional logging
│   ├── middleware/
│   │   └── sanitization.js    # ← NEW: Input sanitization
│   ├── index.js               # Updated with new features
│   └── package.json           # Updated dependencies
│
├── frontend/
│   ├── .env.local             # ← NEW: Frontend config
│   └── src/pages/
│       └── SoilReport.tsx     # ← Kept (deleted SIMPLIFIED version)
│
└── PRODUCTION_FIXES_COMPLETE.md  # ← NEW: Detailed changelog
```

---

## 🧪 TESTING THE NEW FEATURES

### Test 1: Logging System

```bash
# Start backend and watch logs
cd backend
npm start

# In another terminal, make a request
curl http://localhost:3000/health

# Check log file
cat backend/logs/$(date +%Y-%m-%d).log
```

**Expected:** JSON log entries with timestamps

### Test 2: Rate Limiting

```bash
# Rapid fire requests (should trigger rate limit)
for i in {1..15}; do 
  curl -s http://localhost:3000/login | jq -r '.message'
done
```

**Expected:** "Too many login attempts" after 10 requests

### Test 3: Input Sanitization

```bash
# Try XSS attack (should be sanitized)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","mobile":"1234567890"}'
```

**Expected:** Name sanitized to remove script tags

### Test 4: Alert System

```bash
# Create a test alert
FARMER_ID="your_test_farmer_id"
curl -X POST http://localhost:3000/alerts \
  -H "Content-Type: application/json" \
  -d "{\"farmer_id\":\"$FARMER_ID\",\"message\":\"Test alert\",\"type\":\"info\"}"

# Fetch alerts
curl http://localhost:3000/alerts/$FARMER_ID
```

**Expected:** Alert created and retrieved successfully

---

## 🔒 SECURITY BEST PRACTICES

### For Development:

✅ Use the provided `.env` files  
✅ Don't commit `.env` to Git (already in .gitignore)  
✅ Test with memory DB (`USE_MEMORY_DB=true`)  

### For Production:

✅ Change JWT_SECRET in `.env`  
✅ Use strong MongoDB password  
✅ Enable SSL/TLS for MongoDB Atlas  
✅ Review rate limits for your use case  
✅ Monitor log files regularly  

---

## 🐛 TROUBLESHOOTING

### Backend Won't Start

**Error:** "MongoDB connection failed"

**Solution:**
```bash
# Option 1: Use memory DB for testing
echo "USE_MEMORY_DB=true" >> backend/.env

# Option 2: Set up MongoDB Atlas
# 1. Go to https://cloud.mongodb.com
# 2. Create free cluster
# 3. Get connection string
# 4. Update MONGO_URI in backend/.env
```

### Frontend Can't Connect

**Error:** "Failed to fetch" or "ERR_CONNECTION_REFUSED"

**Solution:**
```bash
# 1. Verify backend is running
curl http://localhost:3000/health

# 2. Check API URL
cat frontend/.env.local
# Should show: VITE_API_URL=http://localhost:3000

# 3. Restart frontend after any .env changes
```

### Rate Limit Triggered Too Early

**Solution:**
```bash
# Increase rate limits in backend/index.js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increase from 100
});
```

### Logs Not Being Created

**Solution:**
```bash
# Check permissions
ls -la backend/

# Create logs directory manually
mkdir -p backend/logs

# Check disk space
df -h
```

---

## 📊 MONITORING & DEBUGGING

### View Live Logs

```bash
# Watch all logs in real-time
tail -f backend/logs/*.log

# Filter by level
grep '"level":"error"' backend/logs/*.log | tail -20

# Filter by module
grep '\[Login\]' backend/logs/*.log
```

### Check System Health

```bash
# Backend health
curl http://localhost:3000/health

# Database connection
curl http://localhost:3000/api/test-db

# API info
curl http://localhost:3000/
```

### Performance Monitoring

```bash
# Response times (watch slow queries)
grep '"responseTime":' backend/logs/*.log | sort -t: -k3 -n | tail -10
```

---

## 🎯 NEXT STEPS

### After Getting Started:

1. **Read Full Documentation:**
   - `PRODUCTION_FIXES_COMPLETE.md` - All fixes detailed
   - `README.md` - Complete feature guide
   - `DEPLOYMENT_GUIDE.md` - Production deployment

2. **Customize Configuration:**
   - Edit `backend/.env` for your environment
   - Set up MongoDB Atlas for production
   - Configure Twilio for SMS alerts (optional)

3. **Explore Features:**
   - Upload soil reports
   - Get crop recommendations
   - Test multi-language support
   - Try the alert system

4. **Development:**
   - Review code structure
   - Understand logging system
   - Learn security measures
   - Plan new features

---

## 📞 SUPPORT

### Need Help?

1. **Check Logs First:**
   ```bash
   tail -f backend/logs/*.log
   ```

2. **Run Verification:**
   ```bash
   node verify-system.js
   ```

3. **Review Documentation:**
   - `PRODUCTION_FIXES_COMPLETE.md`
   - `README.md`
   - `TROUBLESHOOTING.md`

4. **Common Issues:**
   - Port conflicts: Change PORT in `.env`
   - Database errors: Check MongoDB connection
   - CORS issues: Verify CORS_ORIGIN in `.env`

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Login works
- [ ] Soil report upload works
- [ ] Crop suggestions appear
- [ ] Language switching works
- [ ] Alerts can be created
- [ ] Logs are being written
- [ ] Rate limiting activates (test with rapid requests)
- [ ] Input sanitization works (test with `<script>` tags)

---

## 🎉 SUCCESS!

If everything works, you should see:

```
✅ All systems operational!
🟢 Backend: http://localhost:3000
🟢 Frontend: http://localhost:5173
🟢 Database: Connected
🟢 Security: Active
🟢 Logging: Enabled
🟢 Alerts: Operational
```

**You're ready to go! 🚀**

---

**Built with ❤️ for farmers worldwide**  
**Version 3.0.0 - Production Ready**
