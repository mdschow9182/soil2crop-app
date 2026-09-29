# 🚀 Soil2Crop Quick Start Reference

**Get up and running in 5 minutes!**

---

## ⚡ Super Quick Start

### 1️⃣ Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Running on http://localhost:5000

### 2️⃣ Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
✅ Running on http://localhost:5173

### 3️⃣ Open Browser
Navigate to: **http://localhost:5173**

---

## 📋 Essential Commands

### Backend
```bash
npm start          # Start server
npm run dev        # Auto-reload mode
npm test           # Run tests
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm test           # Run tests
```

### Mobile (Flutter)
```bash
cd mobile/soil2crop-flutter
flutter pub get    # Install dependencies
flutter run        # Run on device
flutter build apk  # Build APK
```

---

## 🔧 Configuration Files

### Backend `.env`
```env
USE_MEMORY_DB=true              # In-memory database (no MongoDB needed)
PORT=5000                       # Auto-fallback if busy
NODE_ENV=development
JWT_SECRET=your-secret-here     # Change in production!
CORS_ORIGINS=http://localhost:5173
```

### Frontend `.env.local`
```env
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Test Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get crops
curl http://localhost:5000/api/crops

# IoT sensor data
curl http://localhost:5000/api/iot/sensor-data/farmer123

# Register user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"mobile":"1234567890","district":"Test","language":"en","password":"test123"}'
```

---

## 🐛 Common Issues

### Port Already in Use
**Solution:** Server auto-switches to next available port (5001, 5002, etc.)

Check what's using port 5000:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Can't Connect to Backend
**Fix:** Update `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000
```
Then restart frontend.

### MongoDB Connection Error
**Quick Fix:** Use in-memory mode:
```env
USE_MEMORY_DB=true
```

**Production Setup:** Configure MongoDB Atlas (see SETUP_GUIDE.md)

---

## 📊 API Routes Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register` | POST | Register new farmer |
| `/api/users/login` | POST | User login |
| `/api/soilreport` | POST | Submit soil data |
| `/api/soilreport/:userId` | GET | Get user reports |
| `/api/recommendations/:userId` | GET | Get crop suggestions |
| `/api/iot/sensor-data/:id` | GET | Get sensor readings |
| `/api/iot/sensor-data` | POST | Update sensor data |
| `/api/feedback` | POST | Submit feedback |

---

## 🎯 Project Structure

```
soil2crop-app/
├── backend/           # Node.js API server
│   ├── config/       # Database setup
│   ├── src/
│   │   ├── models/   # Data models
│   │   ├── routes/   # API endpoints
│   │   └── services/ # Business logic
│   └── server.js     # Main entry point
│
├── frontend/         # React UI
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # App pages
│       └── services/    # API calls
│
├── mobile/           # Flutter app
│   └── soil2crop-flutter/
│
└── docs/            # Documentation
```

---

## ✅ Verification Checklist

Before you start:
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] No console errors
- [ ] Health endpoint responds
- [ ] Frontend can load

Test features:
- [ ] User registration works
- [ ] Login works
- [ ] Soil report upload works
- [ ] Crop recommendations show
- [ ] IoT dashboard displays data

---

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Complete setup instructions
- **PROJECT_VERIFICATION_REPORT.md** - System verification
- **MONGODB_ATLAS_SETUP.md** - MongoDB configuration
- **docs/** folder - Detailed documentation

---

## 🔐 Security Reminders

- ⚠️ Change JWT_SECRET before deployment
- ⚠️ Never commit .env files
- ⚠️ Use HTTPS in production
- ⚠️ Restrict CORS origins
- ⚠️ Use strong passwords

---

## 🆘 Need Help?

1. Check SETUP_GUIDE.md for detailed instructions
2. Review PROJECT_VERIFICATION_REPORT.md for system status
3. Inspect console logs for errors
4. Verify .env configuration

---

**Last Updated:** March 24, 2026  
**Status:** ✅ Ready for Development
