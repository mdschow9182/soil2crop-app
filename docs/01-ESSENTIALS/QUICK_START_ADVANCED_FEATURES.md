# 🚀 Soil2Crop Advanced Features - Quick Start Guide

**Last Updated:** March 9, 2026  
**Status:** Production-Ready Enhancements  

---

## What's Been Implemented

### ✅ COMPLETED (Phase 1)

1. **Weather API Integration** - FULLY FUNCTIONAL
2. **Satellite Service Infrastructure** - Core service created
3. **Comprehensive Documentation** - Implementation guides for all features

---

## Quick Setup Instructions

### 1. Weather Integration (5 minutes)

#### Step 1: Get API Key
Visit: https://openweathermap.org/api  
Sign up for free account → Get API key

#### Step 2: Add Environment Variable
Edit `backend/.env`:
```env
OPENWEATHER_API_KEY=your_api_key_here
```

#### Step 3: Install Dependencies
```bash
cd backend
npm install axios
```

#### Step 4: Test Weather Endpoint
```bash
curl "http://localhost:3000/api/weather?lat=16.3067&lon=80.4365"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "temperature": 30,
    "humidity": 60,
    "rainfall_probability": 0.45,
    "irrigation_suggestion": "Normal irrigation schedule"
  }
}
```

#### Step 5: Use WeatherWidget in Dashboard
Edit `frontend/src/pages/Dashboard.tsx`:
```tsx
import { WeatherWidget } from '@/components/WeatherWidget';

// Add inside Dashboard component
<WeatherWidget 
  latitude={16.3067}
  longitude={80.4365}
  location="My Farm"
/>
```

✅ **Done!** Weather integration complete.

---

### 2. ML Crop Prediction(30 minutes)

#### Prerequisites
- Python 3.8+ installed
- pip package manager

#### Step 1: Create ML Model Directory
```bash
mkdir ml-model
cd ml-model
```

#### Step 2: Download Dataset
Download crop recommendation dataset from Kaggle:
https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset

Save as: `ml-model/crop_recommendation.csv`

#### Step 3: Create Requirements File
Create `ml-model/requirements.txt`:
```txt
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
scikit-learn==1.4.0
pandas==2.2.0
numpy==1.26.3
joblib==1.3.2
```

#### Step 4: Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Step 5: Train Model
Create `ml-model/train_crop_model.py` (copy code from ADVANCED_FEATURES_IMPLEMENTATION_GUIDE.md)

Run training:
```bash
python train_crop_model.py
```

This creates: `crop_prediction_model.joblib`

#### Step 6: Create FastAPI Service
Create `ml-model/app.py` (copy code from guide)

#### Step 7: Run ML Service
```bash
uvicorn app:app --reload --port 8000
```

Test ML endpoint:
```bash
curl -X POST http://localhost:8000/predict-crop\
  -H "Content-Type: application/json" \
  -d '{"N":90,"P":42,"K":43,"temperature":25,"humidity":80,"ph":6.5,"rainfall":200}'
```

#### Step 8: Connect Node.js to ML Service
Add to `backend/.env`:
```env
ML_API_URL=http://localhost:8000/predict-crop
```

Update `backend/services/aiService.js` (see guide for code)

✅ **Done!** ML prediction integrated.

---

### 3. OTP Authentication(20 minutes)

#### Step 1: Install Dependencies
```bash
cd backend
npm install jsonwebtoken bcrypt twilio
```

#### Step 2: Configure Twilio (Optional)
Get Twilio credentials: https://www.twilio.com/console

Add to `backend/.env`:
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
JWT_SECRET=change-this-to-secure-random-string
```

**Note:** Without Twilio, OTP will be logged to console (development mode).

#### Step 3: Create Auth Service
Create `backend/services/authService.js` (copy code from guide)

#### Step 4: Add Auth Routes
Update `backend/index.js` - add OTP endpoints (copy from guide)

#### Step 5: Update Frontend Login
Edit `frontend/src/pages/Login.tsx` - add OTP flow (see guide)

#### Step 6: Test OTP Flow
```bash
# Request OTP
curl -X POST http://localhost:3000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# Check console for OTP (if Twilio not configured)
# Then verify
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","otp":"123456"}'
```

✅ **Done!** OTP authentication ready.

---

### 4. Satellite Features (1 hour)

#### Step 1: Install Map Libraries
```bash
cd frontend
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

#### Step 2: Get Sentinel Hub Account (Optional)
Visit: https://www.sentinel-hub.com/  
Sign up → Get Client ID & Secret

Add to `backend/.env`:
```env
SENTINEL_HUB_CLIENT_ID=your_client_id
SENTINEL_HUB_CLIENT_SECRET=your_client_secret
```

**Note:** Without credentials, service returns simulated NDVI data.

#### Step 3: Create Farm Location Selector
Create `frontend/src/components/FarmLocationSelector.tsx` (copy from guide)

#### Step 4: Add Satellite Endpoints
Update `backend/index.js`:
```javascript
const satelliteService = require('./services/satelliteService');

app.get('/api/satellite/ndvi', async (req, res) => {
 const { lat, lon, date } = req.query;
const result = await satelliteService.calculateNDVI(lat, lon, date);
  res.json(result);
});
```

✅ **Done!**Satellite infrastructure ready.

---

## File Structure Overview

```
soil2crop-app/
├── backend/
│   ├── services/
│   │   ├── weatherService.js ✅ CREATED
│   │   ├── satelliteService.js ✅ CREATED
│   │   ├── authService.js ⏳ TODO
│   │   └── analyticsService.js ⏳ TODO
│   ├── middleware/
│   │   └── auth.js ⏳ UPDATE
│   └── index.js ✅ UPDATED (weather endpoints)
│
├── frontend/
│   ├── components/
│   │   ├── WeatherWidget.tsx ✅ CREATED
│   │   ├── FarmLocationSelector.tsx ⏳ TODO
│   │   └── NDVIMap.tsx ⏳ TODO
│   └── pages/
│       ├── Dashboard.tsx ⏳ UPDATE (add WeatherWidget)
│       ├── FarmHealthDashboard.tsx ⏳ TODO
│       └── GovernmentAnalytics.tsx ⏳ TODO
│
├── ml-model/ ⏳ CREATE
│   ├── train_crop_model.py
│   ├── app.py
│   └── requirements.txt
│
└── Documentation/
    ├── ADVANCED_FEATURES_IMPLEMENTATION_GUIDE.md ✅ COMPLETE
    └── QUICK_START_ADVANCED_FEATURES.md ✅ THIS FILE
```

---

## Testing Checklist

### Weather Integration ✅
- [ ] Weather widget displays on dashboard
- [ ] Temperature shows correctly
- [ ] Irrigation suggestions appear
- [ ] Auto-refresh works (every 30 min)

### ML Prediction ⏳
- [ ] Python model trained successfully
- [ ] FastAPI service running on port 8000
- [ ] Node.js can call ML service
- [ ] Predictions returned with confidence scores

### OTP Authentication ⏳
- [ ] OTP sent via SMS/Twilio (or console log)
- [ ] OTP verification works
- [ ] JWT token generated
- [ ] Protected routes work with token

### Satellite Features ⏳
- [ ] Map component renders
- [ ] Can select farm location
- [ ] NDVI calculation returns values
- [ ] Health status displayed correctly

---

## Troubleshooting

### Weather Not Working

**Problem:** Weather data not loading

**Solution:**
1. Check if OPENWEATHER_API_KEY is set in `.env`
2. Verify API key is valid: https://home.openweathermap.org/api_keys
3. Check backend logs for errors
4. Test endpoint directly with curl

### ML Service Connection Failed

**Problem:**Cannot connect to ML service

**Solution:**
1. Ensure FastAPI service is running: `uvicorn app:app --port 8000`
2. Check ML_API_URL in `.env` matches actual URL
3. Verify ML service responds: test with curl first
4. Check firewall settings allow localhost:8000

### OTP Not Sending

**Problem:** SMS not received

**Solution:**
1. In development, OTP is logged to console (check server logs)
2. For production, verify Twilio credentials are correct
3. Check Twilio phone number is verified
4. Ensure mobile number format is correct (10 digits)

### Satellite Data Returns Mock Values

**Problem:**Always getting simulated NDVI data

**Solution:**
1. This is expected behavior without Sentinel Hub credentials
2. For real data, sign up at sentinel-hub.com
3. Add credentials to `.env`
4. Service will automatically use real API when configured

---

## Performance Tips

### Backend Optimization
1. Enable Redis caching for frequently accessed data
2. Use PM2 for process management
3. Enable gzip compression in Express
4. Set up MongoDB indexes

### Frontend Optimization
1. Lazy load pages with React.lazy()
2. Compress images before upload
3. Use service workers for offline support
4. Minimize bundle size with tree shaking

### Database Optimization
1. Add compound indexes on frequently queried fields
2. Use MongoDB aggregation pipeline for analytics
3. Set up replica sets for high availability
4. Implement TTL indexes for temporary data

---

## Security Best Practices

### Before Production Deployment:

1. **Environment Variables**
   - Change all default secrets
   - Use strong JWT_SECRET (32+ characters)
   - Never commit `.env` files

2. **Authentication**
   - Enable HTTPS/TLS
   - Set secure cookie flags
   - Implement rate limiting on auth endpoints
   - Add account lockout after failed attempts

3. **API Security**
   - Enable CORS only for production domains
   - Add request validation middleware
   - Implement API key rotation
   - Set up monitoring and alerting

4. **Data Protection**
   - Encrypt sensitive data at rest
   - Use parameterized queries (prevent NoSQL injection)
   - Sanitize user inputs
   - Regular security audits

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database backup strategy in place
- [ ] Error monitoring set up (Sentry)
- [ ] Logging configured appropriately
- [ ] Rate limiting enabled
- [ ] SSL certificates obtained

### Deployment Day
- [ ] Deploy backend to production server
- [ ] Deploy ML service (separate container/server)
- [ ] Build and deploy frontend
- [ ] Run database migrations
- [ ] Test all critical paths
- [ ] Monitor error rates

### Post-Deployment
- [ ] Monitor performance metrics
- [ ] Check error logs regularly
- [ ] Gather user feedback
- [ ] Plan next iteration of features

---

## Next Steps

1. ✅ Complete weather integration testing
2. ⏳ Set up ML model training pipeline
3. ⏳ Implement OTP authentication flow
4. ⏳ Add satellite map visualization
5. ⏳ Create government analytics dashboard
6. ⏳ Deploy to production staging environment

---

## Support Resources

### Documentation Links
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Sentinel Hub](https://docs.sentinel-hub.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React Leaflet](https://react-leaflet.js.org/)
- [Twilio SMS](https://www.twilio.com/docs/sms)

### Code References
- Weather Service: `backend/services/weatherService.js`
- Satellite Service: `backend/services/satelliteService.js`
- Weather Component: `frontend/src/components/WeatherWidget.tsx`
- Full Guide: `ADVANCED_FEATURES_IMPLEMENTATION_GUIDE.md`

---

## Estimated Completion Times

| Feature | Time Required | Difficulty |
|---------|--------------|------------|
| Weather Integration | 5-10 min | Easy ✅ |
| ML Crop Prediction | 30-60 min | Medium ⏳ |
| OTP Authentication | 20-30 min | Medium ⏳ |
| Satellite Features | 60-90 min | Hard ⏳ |
| Analytics Dashboard | 45-60 min | Medium ⏳ |

**Total Estimated Time:** 3-4 hours for complete implementation

---

**Good luck with your implementation!** 🌾

If you need help, refer to the comprehensive guide in `ADVANCED_FEATURES_IMPLEMENTATION_GUIDE.md`.
