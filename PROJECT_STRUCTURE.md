# 🚜 Soil2Crop - Smart Farming Decision Support System

**Version:** 3.0.0 | **Last Updated:** March 2026

---

## 🎯 Overview

Soil2Crop is an AI-powered smart farming platform providing:
- 🌾 ML-based Crop Recommendations (Random Forest)
- 🔬 Crop Disease Detection (CNN Image Analysis)
- 🌦️ Weather Intelligence with Agricultural Advisory
- 📊 Soil Report Analysis (OCR + PDF Parsing)
- 💬 Multi-language AI Farmer Assistant (9+ Indian Languages)
- 📱 Farmer Support & Tutorial System

---

## 📁 Project Structure

```
soil2crop-app/
├── backend/                          # Node.js + Express API Server
│   ├── controllers/                  # Request handlers
│   ├── middleware/                   # Auth, validation, sanitization
│   ├── models/                       # MongoDB schemas
│   ├── routes/                       # API route definitions
│   ├── services/                     # Business logic layer ⭐
│   │   ├── aiFarmerAssistant.js      # Multi-language AI chatbot
│   │   ├── diseaseDetection.js       # CNN model inference
│   │   ├── mlCropPrediction.js       # ML crop prediction
│   │   └── weatherService.js         # OpenWeather API integration
│   ├── uploads/                      # File uploads
│   ├── utils/                        # Helper functions
│   ├── .env                          # Environment variables
│   ├── index.js                      # Main server entry point
│   └── package.json
│
├── frontend/                         # React + TypeScript + Vite
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API service layer
│   │   ├── store/                    # State management
│   │   └── App.tsx
│   ├── .env.local                    # Frontend environment
│   └── package.json
│
├── soil2crop-flutter/                # Mobile app (optional)
│   └── lib/
│
└── docs/                             # Documentation folder
    └── [All markdown files should be moved here]
```

---

## 💻 Tech Stack

### Backend
- **Runtime:** Node.js v20.x LTS (v24 incompatible with TensorFlow.js)
- **Framework:** Express.js v5
- **Database:** MongoDB Atlas (Mongoose ODM)
- **ML/AI:** TensorFlow.js, MobileNetV2, Random Forest
- **Image Processing:** Sharp, Tesseract OCR
- **File Upload:** Multer
- **SMS:** Twilio
- **Weather:** OpenWeatherMap API

### Frontend
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite 5.4
- **UI Library:** shadcn/ui (Radix UI + TailwindCSS)
- **State:** React Query (TanStack)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios

### Mobile (Optional)
- **Framework:** Flutter/Dart

---

## ✨ Key Features

### 1. ML Crop Prediction (`POST /api/ml-crop-prediction`)
- Dense Neural Network (11→64→32→8)
- Returns top 3 crops with probability scores
- Fallback to rule-based system if ML unavailable

### 2. Disease Detection (`POST /api/crop-health-analyze`)
- MobileNetV2 transfer learning
- Supports 10+ diseases (rice blast, brown spot, wheat rust, etc.)
- Treatment recommendations (organic + chemical)

### 3. Weather Intelligence (`GET /api/weather?lat=&lon=`)
- Real-time data from OpenWeatherMap
- 7-day forecast
- Agricultural advisory (irrigation, disease risk)

### 4. AI Farmer Assistant (`POST /api/farmer-assistant/chat`)
- Multi-language support (English, Hindi, Telugu, Tamil, etc.)
- Voice input/output filtering for Indian accents
- Context-aware agricultural Q&A

### 5. Soil Report Processing (`POST /api/soil-analyze`)
- PDF parsing + OCR extraction
- Automatic nutrient value extraction
- Soil health card integration

---

## 🚀 Installation

### Prerequisites
```bash
# Required versions
Node.js: 20.x LTS (NOT v24!)
Python: 3.11-3.13 (NOT v3.15!)
MongoDB: Atlas connection or local 6.0+
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env from template
cp .env.example .env

# Edit .env with your credentials:
# - MONGODB_URI=your_mongodb_atlas_connection_string
# - OPENWEATHER_API_KEY=your_api_key
# - TWILIO_* (optional for SMS)

# Start server
npm run dev
# Server runs on http://localhost:3000
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local:
# VITE_API_URL=http://localhost:3000

# Start dev server
npm run dev
# Frontend runs on http://localhost:5173
```

### Python Virtual Environment (for Black formatter)
```bash
# In project root
python -m venv .venv
.\.venv\Scripts\activate

# Install Python tools
pip install black isort typing_extensions

# VS Code will now use Black from .venv
```

---

## ▶️ Running the Application

### Quick Start Script
```bash
# Windows PowerShell
.\quick-start.bat

# Or manually:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Verify Installation
```bash
# Test backend API
curl http://localhost:3000/api/health

# Expected response:
# {"status": "OK", "timestamp": "...", "services": {...}}
```

---

## 📚 Documentation Index

### ⭐ ESSENTIAL GUIDES (Start Here)
1. **README_ML_EDITION.md** - Complete feature overview
2. **QUICK_START.md** - Get started in 5 minutes
3. **API_REFERENCE.md** - All API endpoints with examples
4. **DEPLOYMENT_GUIDE.md** - Production deployment steps

### 🔧 DEVELOPMENT GUIDES
- `PHASE1_COMPLETE.md` - ML Crop Prediction implementation
- `PHASE2_COMPLETE.md` - Disease Detection implementation
- `MULTILANGUAGE_FINAL_REPORT.md` - AI chatbot setup
- `VOICE_GUIDANCE_SYSTEM_WIDE.md` - Voice filtering guide

### 🐛 TROUBLESHOOTING
- `CONNECTION_ERROR_FIX.md` - Database connection issues
- `UPLOAD_FIX_COMPLETE.md` - File upload problems
- `LANGUAGE_FIX_QUICK_REF.md` - Translation issues
- `NODE_VERSION_REQUIREMENT.md` - TensorFlow.js errors

### 📋 REFERENCE DOCUMENTATION
- `IMPLEMENTATION_STATUS.md` - Feature completion status
- `SYSTEM_AUDIT_COMPLETE.md` - Full system audit report
- `SECURITY_AUDIT_REPORT.md` - Security analysis
- `FUTURE_ENHANCEMENTS.md` - Planned improvements

---

## 🎯 Development Status

| Module | Status | Description |
|--------|--------|-------------|
| **Backend API** | ✅ PRODUCTION | All REST APIs functional |
| **MongoDB** | ✅ CONNECTED | Atlas integration working |
| **ML Crop Prediction** | ⚠️ DISABLED | Requires Node.js v20 downgrade |
| **Disease Detection** | ⚠️ DISABLED | Requires Node.js v20 downgrade |
| **Weather Service** | ✅ RUNNING | Using mock data (no API key) |
| **AI Farmer Assistant** | ✅ WORKING | Multi-language chatbot active |
| **Voice Filtering** | ✅ WORKING | Indian accent support enabled |
| **Soil OCR** | ✅ WORKING | PDF + image parsing functional |
| **Frontend UI** | ✅ WORKING | All pages responsive |

---

## ⚠️ Critical Requirements

### 1. Node.js Version
```bash
# CHECK YOUR VERSION
node --version

# REQUIRED: v20.x LTS
# CURRENT ISSUE: v24.14.0 breaks TensorFlow.js

# FIX: Download from https://nodejs.org/
```

### 2. OneDrive Restriction
```bash
# DO NOT run npm install from OneDrive paths
# Move project to: C:\Projects\soil2crop-app\
# Reason: EPERM file locking errors during native module builds
```

### 3. Python Version
```bash
# REQUIRED: 3.11 - 3.13
# CURRENT ISSUE: v3.15 breaks autopep8/black formatter

# FIX: Use virtual environment with compatible Python
```

---

## 📞 Support

For issues or questions:
1. Check `docs/TROUBLESHOOTING.md`
2. Review logs in `backend/logs/`
3. Run diagnostic: `node verify-system.js`

---

## 🏆 IEEE Competition Submission

This project is submitted for IEEE Innovation Challenge 2026.

**Key Highlights:**
- AI-driven agricultural decision support
- Multi-language accessibility (9+ languages)
- Real-time disease detection from images
- Integration with government soil health cards
- Voice-enabled farmer assistant

---

**Built with ❤️ for Indian Farmers**
*Soil2Crop - Empowering Agriculture with AI*
