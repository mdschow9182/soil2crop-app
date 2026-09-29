# 🚀 Soil2Crop Complete Setup Guide

**Quick start instructions for developers**

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Backend Setup
```bash
cd backend
npm install
npm start
```
✅ Backend runs on `http://localhost:5000`

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:5173` (Vite default)

### Step 3: Verify Installation
Open browser: `http://localhost:5173`

---

## 📋 Prerequisites

- **Node.js:** v16.0.0 or higher
- **npm:** v8.0.0 or higher
- **Git:** For cloning repository

Optional:
- **MongoDB Atlas account:** For production database
- **Python 3.x:** For ML features
- **Flutter SDK:** For mobile app development

---

## 🏗️ Project Structure

```
soil2crop-app/
├── backend/              # Node.js + Express API
│   ├── config/          # Database configuration
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   ├── routes/          # Additional routes (IoT)
│   ├── scripts/         # Database seeding
│   ├── .env             # Environment variables
│   └── server.js        # Main server file
│
├── frontend/            # React + TypeScript UI
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API calls
│   │   ├── hooks/       # Custom hooks
│   │   └── utils/       # Helper functions
│   ├── .env.local       # Frontend config
│   └── package.json
│
├── mobile/              # Flutter mobile app
│   └── soil2crop-flutter/
│       └── lib/         # Dart source code
│
├── datasets/            # Training data & samples
├── docs/                # Documentation
└── scripts/             # Setup automation
```

---

## 🔧 Detailed Setup Instructions

### Backend Configuration

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment
Edit `backend/.env`:

```env
# Database Mode
USE_MEMORY_DB=true          # true = in-memory, false = MongoDB

# MongoDB (only if USE_MEMORY_DB=false)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/soil2crop

# Server
PORT=5000                   # Auto-fallback if port busy
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 3. Start Backend
```bash
npm start
```

Expected output:
```
=================================
⚠️  RUNNING IN MEMORY DATABASE MODE
MongoDB connection disabled
Data will be stored temporarily in RAM
=================================
[IoT] IoT routes mounted at /api/iot
=================================
Soil2Crop API Server Running
Port: 5000
Environment: development
=================================
```

---

### Frontend Configuration

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Configure Environment
Create/edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

#### 3. Start Frontend
```bash
npm run dev
```

Expected output:
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Testing the Setup

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get crops list
curl http://localhost:5000/api/crops

# IoT sensor data
curl http://localhost:5000/api/iot/sensor-data/test123
```

### Test Frontend
1. Open browser: `http://localhost:5173`
2. Navigate through pages
3. Test user registration
4. Upload soil report
5. Check crop recommendations

---

## 🗄️ Database Options

### Option 1: In-Memory Mode (Default) ✅
**Best for:** Development and testing

```env
USE_MEMORY_DB=true
```

**Pros:**
- No setup required
- Works immediately
- No external dependencies

**Cons:**
- Data lost on restart
- Not suitable for production

---

### Option 2: MongoDB Atlas ☁️
**Best for:** Production deployment

#### Setup Steps:

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier

2. **Create Cluster**
   - Choose Free M0 tier
   - Select region closest to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to Database Access → Add New User
   - Username: `soil2crop_admin`
   - Password: (strong password)
   - Privileges: Read and write to any database

4. **Whitelist IP Address**
   - Go to Network Access → Add IP Address
   - Choose "Allow Access from Anywhere" (dev only)
   - Or add your specific IP

5. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Copy connection string

6. **Update .env**
   ```env
   USE_MEMORY_DB=false
   MONGODB_URI=mongodb+srv://soil2crop_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/soil2crop?retryWrites=true&w=majority
   ```

7. **Restart Backend**
   ```bash
   npm start
   ```

Expected output:
```
=================================
MongoDB Connected Successfully
Host: cluster0.xxxxx.mongodb.net
Database: soil2crop
Port: 27017
=================================
```

---

## 📱 Mobile App Setup

### Prerequisites
- Flutter SDK 3.0+
- Android Studio / VS Code
- Android emulator or device

### Installation

```bash
cd mobile/soil2crop-flutter

# Get dependencies
flutter pub get

# Run on Android emulator
flutter run

# Build APK
flutter build apk --release
```

APK location: `build/app/outputs/flutter-apk/app-release.apk`

---

## 🔐 Security Checklist

- [ ] Generate strong JWT_SECRET (min 32 chars)
- [ ] Use environment variables for secrets
- [ ] Never commit `.env` files
- [ ] Enable HTTPS in production
- [ ] Restrict CORS origins
- [ ] Use strong MongoDB passwords
- [ ] Enable IP whitelist in production
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Set up monitoring/logging

---

## 🐛 Troubleshooting

### Backend won't start

**Error: EADDRINUSE**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F

# Or let auto-fallback handle it
```

**Error: MongoDB connection failed**
```env
# Switch to in-memory mode
USE_MEMORY_DB=true
```

### Frontend won't connect to backend

**Check API URL:**
```env
# frontend/.env.local
VITE_API_URL=http://localhost:5000
```

**Restart frontend after changing .env**

### Port conflicts

The backend has automatic port fallback:
- Tries port 5000 first
- If busy, tries 5001, 5002, etc.
- Console shows actual port

---

## 📦 Available Scripts

### Backend
```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests
```

### Frontend
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests
```

### Mobile
```bash
flutter run        # Run on device/emulator
flutter build apk  # Build Android APK
flutter test       # Run Flutter tests
```

---

## 🌐 Deployment Guide

### Backend (Railway.app)

1. Create Railway account
2. Create new project
3. Connect GitHub repo
4. Set environment variables
5. Deploy automatically

### Frontend (Vercel)

1. Create Vercel account
2. Import Git repository
3. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set environment variables
5. Deploy

### Mobile (Google Play)

1. Build release APK
2. Create Google Play Console account
3. Create app listing
4. Upload APK/AAB
5. Submit for review

---

## 📊 API Reference

### Key Endpoints

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

#### Soil Reports
- `POST /api/soilreport` - Submit soil data
- `GET /api/soilreport/:userId` - Get user reports

#### Recommendations
- `GET /api/recommendations/:userId` - Get crop suggestions

#### IoT Sensors
- `GET /api/iot/sensor-data/:farmer_id` - Current readings
- `POST /api/iot/sensor-data` - Update sensor data
- `GET /api/iot/sensor-history/:farmer_id` - Historical data

#### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/stats/:district` - Analytics

Full API documentation: See `docs/api/` folder

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

**Documentation:** `/docs` folder  
**Issues:** GitHub Issues  
**Discussions:** GitHub Discussions  

---

## ✅ Setup Verification Checklist

Before starting development:

- [ ] Backend installed and running
- [ ] Frontend installed and running
- [ ] Backend responds to health check
- [ ] Frontend can access backend API
- [ ] No console errors in browser
- [ ] User registration works
- [ ] Login works (if implemented)
- [ ] Soil report upload works
- [ ] Crop recommendations display
- [ ] IoT dashboard shows data

---

**Last Updated:** March 24, 2026  
**Version:** 1.0.0
