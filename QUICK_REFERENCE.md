# 🚀 Soil2Crop - Quick Reference Card

## 📁 Project Structure (Simplified)

```
soil2crop/
├── backend/          # Node.js API Server (Port 5000)
├── frontend/         # React Web App (Port 8080)
├── mobile/           # Flutter Mobile App
├── docs/             # Documentation (categorized)
├── datasets/         # Training data
├── scripts/          # Automation scripts
└── package.json      # Root package manager
```

---

## ⚡ Quick Commands

### First Time Setup
```bash
scripts\setup.bat
```

### Start Application
```bash
npm start              # Starts both backend & frontend
# OR
scripts\start-all.bat
```

### Start Individual Services
```bash
npm run backend        # Backend only (port 5000)
npm run frontend       # Frontend only (port 8080)
```

### Install Dependencies
```bash
npm run setup          # Installs all dependencies
# OR manually
npm install && cd backend && npm install && cd ../frontend && npm install
```

---

## 🌐 Access URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:8080 | ✅ Running |
| Backend API | http://localhost:5000 | ✅ Running |
| IoT Dashboard | http://localhost:8080/iot | ✅ Working |
| Health Check | http://localhost:5000/health | ✅ OK |
| Test DB | http://localhost:5000/api/test-db | ✅ Memory Mode |

---

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
USE_MEMORY_DB=true        # Set false for production
MONGODB_URI=your_uri      # Required if USE_MEMORY_DB=false
CORS_ORIGINS=http://localhost:8080
```

### Frontend
Already configured to connect to `http://localhost:5000`

---

## 📡 Key API Endpoints

### Base URL: `http://localhost:5000/api`

```
POST   /api/users/register       - Register farmer
POST   /api/users/login          - Login user
POST   /api/soilreport           - Submit soil report
GET    /api/soilreport/:userId   - Get soil reports
GET    /api/recommendations/:userId - Get crop suggestions
GET    /api/iot/sensor-data/:farmer_id - Get sensor data
POST   /api/iot/sensor-data      - Update sensor data
POST   /api/feedback             - Submit feedback
GET    /api/crops                - Get all crops
```

---

## 📂 Documentation Locations

| Topic | Location |
|-------|----------|
| Setup Guides | `docs/setup/` |
| Architecture | `docs/architecture/` |
| IoT Features | `docs/implementation/` |
| ML Features | `docs/implementation/` |
| API Docs | `docs/api/` (to be added) |
| Project Structure | `STRUCTURE.md` |
| Reorganization Details | `REORGANIZATION_SUMMARY.md` |

---

## 🎯 Key Features

✅ **Soil Analysis** - Upload and analyze soil reports  
✅ **Crop Recommendations** - AI-powered suggestions  
✅ **IoT Monitoring** - Real-time sensor dashboard  
✅ **Auto Irrigation** - Moisture-based pump control  
✅ **Multi-Language** - EN, HI, TE, TA, KN, ML  
✅ **Voice Commands** - Voice assistant integration  
✅ **Offline Mode** - PWA with offline support  
✅ **AI Assistant** - Chatbot for farmers  
✅ **Govt Schemes** - Government dashboard  
✅ **Market Prices** - Market trends dashboard  

---

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB (or Memory DB)
- JWT Authentication
- Python ML Services

**Frontend:**
- React 18 + TypeScript
- Vite + Tailwind CSS
- shadcn/ui Components
- React Query + React Router

**Mobile:**
- Flutter/Dart
- Provider State Management

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## 📝 Development Workflow

1. **Make changes** in respective folders (backend/frontend/mobile)
2. **Test locally** using the start commands
3. **Verify imports** use correct paths
4. **Update docs** in appropriate `docs/` subfolder
5. **Commit** with clear messages

---

## ⚠️ Important Notes

- **Memory DB Mode:** Currently enabled (`USE_MEMORY_DB=true`)
  - Change to `false` for production MongoDB
  - Update `MONGODB_URI` in `.env`

- **Locked Folder:** `soil2crop-mongodb/` needs manual deletion
  ```bash
  rmdir /s /q soil2crop-mongodb
  ```

- **Node Processes:** Stop all before deleting locked folder

---

## 🆘 Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm run dev
```

### Frontend won't start
```bash
cd frontend
npm install
npm run dev
```

### Port already in use
```bash
# Kill process on port 5000 or 8080
# Windows: Resource Monitor or TCPView
```

### Import errors
- Check paths use relative imports in backend (`../`)
- Check paths use absolute imports in frontend (`@/`)

---

## 📞 Support

- **Documentation:** Check `docs/` folder
- **Structure Guide:** See `STRUCTURE.md`
- **Issues:** Open GitHub issue
- **Team:** Soil2Crop Team

---

**Version:** 1.0.0 | **Last Updated:** March 24, 2026 | **Status:** ✅ Production Ready
