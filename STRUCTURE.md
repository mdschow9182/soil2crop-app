# Soil2Crop Platform - Project Structure Guide

## 📁 Unified Project Structure

```
soil2crop/
│
├── backend/                          # Node.js + Express Backend
│   ├── config/                       # Database & configuration files
│   │   └── database.js              # MongoDB connection with fallback
│   │
│   ├── models/                       # Mongoose data models
│   │   ├── User.js                  # Farmer user model
│   │   ├── SoilReport.js            # Soil analysis data
│   │   ├── Crop.js                  # Crop database
│   │   ├── Feedback.js              # User feedback tracking
│   │   └── SensorData.js            # IoT sensor readings
│   │
│   ├── routes/                       # API route handlers
│   │   ├── api.js                   # Main API routes (users, soil, crops)
│   │   ├── iotRoutes.js             # IoT sensor endpoints
│   │   ├── successRoutes.js         # Success stories API
│   │   ├── cropCalendarRoutes.js    # Crop calendar management
│   │   └── adminRoutes.js           # Admin dashboard routes
│   │
│   ├── services/                     # Business logic layer
│   │   ├── recommendationService.js # Crop recommendation engine
│   │   ├── smsService.js            # SMS notification service
│   │   └── farmerService.js         # Farmer management logic
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── errorHandler.js          # Global error handling
│   │   └── logger.js                # Request logging
│   │
│   ├── scripts/                      # Utility scripts
│   │   └── seedCrops.js             # Database seeding
│   │
│   ├── utils/                        # Helper functions
│   │   └── helpers.js               # Common utilities
│   │
│   ├── python-ml-service/            # Python ML integration
│   │   ├── train_all_models.py      # Model training scripts
│   │   ├── predict_crop.py          # Crop prediction API
│   │   ├── detect_disease.py        # Disease detection
│   │   └── requirements.txt         # Python dependencies
│   │
│   ├── src/                          # Legacy source folder (to be migrated)
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── server.js                     # Main entry point
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables (gitignored)
│   └── .env.example                  # Environment template
│
├── frontend/                         # React + Vite + TypeScript Frontend
│   ├── public/                       # Static assets
│   │   ├── offline.html             # Offline fallback page
│   │   ├── sw.js                    # Service worker
│   │   └── plant-logo.jpg           # App logo
│   │
│   ├── src/                          # Source code
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Base UI components (46 files)
│   │   │   ├── Header.tsx           # App header
│   │   │   ├── BottomNav.tsx        # Bottom navigation
│   │   │   ├── AIFarmerAssistant.tsx # AI chat assistant
│   │   │   ├── VoiceCommands.tsx    # Voice control interface
│   │   │   └── ...
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── Dashboard.tsx        # Main dashboard
│   │   │   ├── IoTDashboard.tsx     # IoT sensor monitoring
│   │   │   ├── CropSuggestion.tsx   # Crop recommendations
│   │   │   ├── SoilReport.tsx       # Soil analysis upload
│   │   │   ├── CropCalendar.tsx     # Planting calendar
│   │   │   ├── Settings.tsx         # User settings
│   │   │   └── ...
│   │   │
│   │   ├── services/                # API and external services
│   │   │   └── api.ts               # Axios API client
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   └── LanguageContext.tsx  # Multi-language support
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── use-mobile.tsx       # Mobile detection
│   │   │   └── use-toast.ts         # Toast notifications
│   │   │
│   │   ├── i18n/                    # Internationalization
│   │   │   └── translations.ts      # Language translations
│   │   │
│   │   ├── lib/                     # Library configurations
│   │   │   ├── api.ts               # API client setup
│   │   │   └── utils.ts             # Utility functions
│   │   │
│   │   ├── utils/                   # Helper utilities
│   │   │   ├── serviceWorkerRegistration.ts
│   │   │   └── voiceAssistant.ts    # Voice recognition
│   │   │
│   │   ├── App.tsx                  # Root component with routing
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Global styles
│   │
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # Tailwind CSS config
│   └── tsconfig.json                # TypeScript config
│
├── mobile/                           # Flutter Mobile App
│   └── soil2crop-flutter/
│       ├── lib/
│       │   ├── main.dart            # Flutter entry point
│       │   ├── models/              # Data models
│       │   ├── screens/             # Mobile screens
│       │   ├── services/            # API services
│       │   ├── providers/           # State management
│       │   ├── widgets/             # Reusable widgets
│       │   └── utils/               # Utilities
│       ├── assets/                  # Images, fonts, etc.
│       └── pubspec.yaml             # Flutter dependencies
│
├── docs/                             # Documentation
│   ├── setup/                        # Setup guides
│   │   ├── ANDROID_APP_CONVERSION_GUIDE.md
│   │   ├── ANDROID_IMPLEMENTATION_CHECKLIST.md
│   │   ├── ANDROID_QUICK_START.md
│   │   └── DEVELOPER_IMPLEMENTATION_GUIDE.md
│   │
│   ├── architecture/                 # System architecture
│   │   ├── PROJECT_STRUCTURE.md
│   │   ├── PRODUCTION_READY_ASSESSMENT.md
│   │   └── VISUAL_SYSTEM_OVERVIEW.md
│   │
│   ├── implementation/               # Feature implementations
│   │   ├── IOT_*.md                 # IoT dashboard guides
│   │   ├── ML_*.md                  # Machine learning guides
│   │   ├── COMPLETE_*.md            # Completion reports
│   │   ├── BOTTOM_NAV_UPDATE_SUMMARY.md
│   │   └── PERFORMANCE_DASHBOARD_OFFLINE_GUIDE.md
│   │
│   └── api/                          # API documentation
│
├── datasets/                         # Training data & ML resources
│   ├── crop_dataset.csv             # Historical crop data
│   └── disease_images/              # Plant disease images
│
├── scripts/                          # Automation scripts
│   ├── setup.bat                    # One-click setup for Windows
│   └── start-all.bat                # Start all services
│
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
├── LICENSE                           # MIT License
├── package.json                      # Root package manager
└── docker-compose.yml                # Docker orchestration (future)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Python 3.8+ (for ML services)
- MongoDB Atlas account or local MongoDB

### Installation

**Option 1: Automated Setup (Windows)**
```bash
scripts\setup.bat
```

**Option 2: Manual Setup**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Running the Application

**Option 1: Start All Services (Windows)**
```bash
scripts\start-all.bat
```

**Option 2: Use Root Package Scripts**
```bash
# Start both backend and frontend
npm start

# Or start individually
npm run backend    # Backend on http://localhost:5000
npm run frontend   # Frontend on http://localhost:8080
```

**Option 3: Manual Start**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔧 Configuration

### Backend Environment (.env)

Copy `backend/.env.example` to `backend/.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/soil2crop?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# OpenWeather API Key
OPENWEATHER_API_KEY=your_openweather_api_key_here

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081

# Memory Database Mode (fallback when MongoDB unavailable)
USE_MEMORY_DB=true  # Set to false for production
```

### Frontend Configuration

The frontend uses environment variables from `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Main Routes

#### User Management
- `POST /api/users/register` - Register new farmer
- `POST /api/users/login` - User login

#### Soil Analysis
- `POST /api/soilreport` - Submit soil report
- `GET /api/soilreport/:userId` - Get user's soil reports

#### Crop Recommendations
- `GET /api/recommendations/:userId` - Get crop suggestions

#### IoT Sensors
- `GET /api/iot/sensor-data/:farmer_id` - Get sensor readings
- `POST /api/iot/sensor-data` - Update sensor data
- `GET /api/iot/sensor-history/:farmer_id` - Historical data

#### Feedback
- `POST /api/feedback` - Submit crop feedback
- `GET /api/feedback/stats/:district` - District statistics

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 📦 Deployment

### Production Checklist

1. **Backend**
   - Set `NODE_ENV=production`
   - Configure production MongoDB URI
   - Set strong JWT secret
   - Disable memory DB mode (`USE_MEMORY_DB=false`)
   - Configure CORS for production domains

2. **Frontend**
   - Build for production: `npm run build`
   - Configure API base URL
   - Enable HTTPS
   - Optimize assets

3. **Database**
   - Set up MongoDB Atlas production cluster
   - Configure backup policies
   - Set up indexes

---

## 🏗️ Architecture Overview

### Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Python ML Services

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS + shadcn/ui
- React Query
- React Router v6

**Mobile:**
- Flutter/Dart
- Provider state management
- REST API integration

### Key Features

✅ Soil health analysis & reporting  
✅ AI-powered crop recommendations  
✅ Real-time IoT sensor monitoring  
✅ Auto-irrigation control  
✅ Multi-language support (EN, HI, TE, TA, KN, ML)  
✅ Voice commands  
✅ Offline-first PWA  
✅ AI Farmer Assistant chatbot  
✅ Government schemes dashboard  
✅ Market price trends  
✅ Crop calendar management  

---

## 📝 Development Guidelines

### Folder Naming Conventions
- **backend/** - All server-side code
- **frontend/** - All client-side code
- **mobile/** - Flutter mobile app
- **docs/** - Documentation organized by category
- **datasets/** - Training data and ML resources
- **scripts/** - Automation and utility scripts

### Import Path Guidelines

**Backend:**
```javascript
// Relative imports within backend
const User = require('../models/User');
const recommendationService = require('../services/recommendationService');
```

**Frontend:**
```typescript
// Absolute imports using path aliases
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
```

---

## 🔐 Security Considerations

1. Never commit `.env` files
2. Use strong JWT secrets in production
3. Implement rate limiting on API endpoints
4. Validate all user inputs
5. Use HTTPS in production
6. Regular dependency updates

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 👥 Support

For issues and questions:
- Check documentation in `/docs`
- Open GitHub issue
- Contact: Soil2Crop Team

---

**Last Updated:** March 24, 2026  
**Version:** 1.0.0
