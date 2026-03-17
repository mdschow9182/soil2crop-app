# Soil2Crop Demo - Setup & Run Guide

## Quick Start

### Prerequisites
- Node.js ≥ 16 
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
node index.js
```

Backend runs on `http://localhost:3000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or next available port).

## Demo Flow (Farmer User)

1. **Login** (Home page `/`)
   - Enter name & 10-digit mobile number
   - Click "Farmer Login"
   - ✅ Stores farmer_id in localStorage

2. **Soil Input** (`/soil-report`)
   - Choose **ONE** method:
     - **Upload**: PDF/JPG/PNG soil report (auto-extracts pH, NPK, soil type)
     - **Manual**: Enter pH (0–14) and soil type directly
   - Cannot mix both—UI enforces toggle
   - Click **Analyze**

3. **Crop Suggestions** (`/crop-suggestion`)
   - Shows recommended crops based on soil data
   - Uses rule-based AI (no ML model)
   - Display only—non-persistent

4. **Language Selector**
   - Top-right corner of app
   - Switch between: English, Telugu, Hindi, Tamil, Kannada, Malayalam
   - Persists to `localStorage` and backend
   - Entire UI re-renders immediately

5. **Settings** (`/settings`)
   - View farmer profile
   - Change language
   - Logout (clears localStorage & returns to login)

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:8080,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3000
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Context API (no Redux)
- **Backend**: Node.js + Express + SQLite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Languages**: 6 supported (translations in `frontend/src/i18n/translations.ts`)

## Current Limitations (Demo Mode)

- ❌ **AI**: Advisory only—not persisted to DB
- ❌ **SMS**: Disabled (Twilio API not configured)
- ❌ **Alerts**: Disabled (no auto-creation)
- ❌ **Images**: Crop monitoring UI present but non-functional
- ✅ **Login**: Working (persists farmer_id)
- ✅ **Soil Input**: Toggle logic enforced
- ✅ **Language**: Full multilingual support with persistence

## File Structure

```
soil2crop-app/
├── backend/
│   ├── index.js          # Main server & routes
│   ├── db/database.js    # SQLite setup
│   ├── middleware/       # Validation & auth
│   ├── services/         # Business logic
│   └── utils/            # Helpers (PDF parsing, file validation)
├── frontend/
│   ├── src/
│   │   ├── main.tsx      # Entry with LanguageProvider
│   │   ├── App.tsx       # Routes & ProtectedRoute
│   │   ├── pages/        # Login, SoilReport, CropSuggestion, etc.
│   │   ├── components/   # Reusable UI + LanguageSwitcher
│   │   ├── context/      # LanguageContext (useLanguage hook)
│   │   ├── i18n/         # Translation keys
│   │   └── api.js        # Frontend API client
│   └── vite.config.ts    # Build config
```

## Notes for Jury/Demo

1. **Language System**:
   - Switch language via top-right selector
   - All UI text updates instantly (Context API re-render)
   - Language persisted to backend—when user logs back in, UI auto-applies stored language

2. **Soil Input Toggle**:
   - Upload mode shows file upload area
   - Manual mode shows form fields
   - Cannot switch without resetting (by design)

3. **URL Flexibility**:
   - Frontend works on 5173, 8080–8084 (Vite dev servers)
   - Backend on 3000 (CORS allows all these ports)

4. **Clean Console**:
   - Removed verbose logging
   - Only errors and key events logged

---

**Ready for live demo.** Questions? Check logs in browser DevTools or terminal.
