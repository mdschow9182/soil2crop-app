# Soil2Crop - MongoDB Edition

Complete agricultural advisory system with Node.js + Express + MongoDB backend and Flutter frontend.

## Project Structure

```
soil2crop-mongodb/
├── backend/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js         # Farmer user schema
│   │   │   ├── SoilReport.js   # Soil test data
│   │   │   ├── Crop.js         # Crop requirements
│   │   │   └── Feedback.js     # Farmer feedback
│   │   ├── routes/
│   │   │   └── api.js          # All API endpoints
│   │   └── services/
│   │       └── recommendationService.js  # Recommendation logic
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express server
├── flutter/
│   └── lib/
│       └── services/
│           └── api_service.dart # Flutter API client
└── README.md
```

## MongoDB Collections

### 1. users
```javascript
{
  userId: "USRXXXXX",
  mobile: "9876543210",
  district: "Hyderabad",
  language: "te",
  password: "hashed",
  createdAt: ISODate()
}
```

### 2. soilreports
```javascript
{
  reportId: "SRXXXXX",
  userId: "USRXXXXX",
  nitrogen: 120,
  phosphorus: 25,
  potassium: 180,
  ph: 6.5,
  reportDate: ISODate(),
  confidenceScore: 85,
  createdAt: ISODate()
}
```

### 3. crops
```javascript
{
  cropId: "rice",
  cropName: "Rice",
  nitrogenRange: { min: 100, max: 200 },
  phosphorusRange: { min: 15, max: 40 },
  potassiumRange: { min: 100, max: 200 },
  phRange: { min: 5.5, max: 7.5 },
  waterRequirement: "High",
  rainDependency: true,
  marketVolatility: "Low",
  averageYield: 25,
  suitableSoilTypes: ["Loamy", "Clay"]
}
```

### 4. feedback
```javascript
{
  feedbackId: "FBXXXXX",
  userId: "USRXXXXX",
  soilReportId: "SRXXXXX",
  nitrogen: 120,
  phosphorus: 25,
  potassium: 180,
  ph: 6.5,
  cropChosen: "Rice",
  approximateYield: 22,
  satisfactionLevel: 4,
  district: "Hyderabad",
  createdAt: ISODate()
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/register | Register farmer |
| POST | /api/users/login | Login farmer |
| POST | /api/soilreport | Submit soil data |
| GET | /api/soilreport/:userId | Get soil reports |
| GET | /api/recommendations/:userId | Get crop recommendations |
| POST | /api/feedback | Submit feedback |
| GET | /api/feedback/stats/:district | Get district stats |
| GET | /api/crops | List all crops |

## Recommendation Algorithm

```
Final Score = (Soil Match × 0.5) + (Weather × 0.3) + (Market × 0.2)

Soil Match (0-100):
- N match: 25%
- P match: 25%
- K match: 25%
- pH match: 25%

Weather Compatibility:
- Drought risk + High water need: -40%
- Excess rain + Rain dependent: -30%
- Temperature > 40°C: -20%

Market Stability:
- Low volatility: 90%
- Medium volatility: 70%
- High volatility: 50%
```

## Setup Instructions

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB Atlas URI and API keys
   ```

3. **Seed crop database**
   ```bash
   node scripts/seedCrops.js
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Create database: `soil2crop`
3. Create user with read/write permissions
4. Whitelist your IP address
5. Copy connection string to `.env`

### Flutter Setup

1. **Add to pubspec.yaml:**
   ```yaml
   dependencies:
     http: ^1.1.0
   ```

2. **Update API base URL in `api_service.dart`**

3. **Run app**
   ```bash
   flutter run
   ```

## Sample API Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9876543210",
    "district": "Hyderabad",
    "language": "te",
    "password": "farmer123"
  }'
```

### Submit Soil Report
```bash
curl -X POST http://localhost:5000/api/soilreport \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USRXXXXX",
    "nitrogen": 120,
    "phosphorus": 25,
    "potassium": 180,
    "ph": 6.5
  }'
```

### Get Recommendations
```bash
curl "http://localhost:5000/api/recommendations/USRXXXXX?reportId=SRXXXXX&district=Hyderabad"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "soilSummary": {
      "nitrogen": 120,
      "phosphorus": 25,
      "potassium": 180,
      "ph": 6.5,
      "confidenceScore": 85,
      "confidenceLabel": "High"
    },
    "weather": {
      "temperature": 28,
      "rainProbability": 40,
      "droughtRisk": false,
      "excessRainRisk": false
    },
    "recommendations": [
      {
        "crop": "Rice",
        "finalScore": 87,
        "soilMatchScore": 90,
        "weatherCompatibility": 85,
        "marketStability": 90,
        "soilRisk": "Low",
        "weatherRisk": "Low",
        "marketRisk": "Low",
        "overallRisk": "Low",
        "reasoning": "Your soil is well-suited for Rice"
      }
    ],
    "communityInsight": "In your district, 62% of farmers with similar soil chose Rice",
    "disclaimer": "This is an advisory recommendation only..."
  }
}
```

## Deployment

### Backend (Render/Railway/Heroku)
1. Push to GitHub
2. Connect to Render/Railway
3. Add environment variables
4. Deploy

### MongoDB Atlas
- Use M10 cluster for production
- Enable backups
- Configure alerts

### Flutter
```bash
flutter build apk --release
flutter build ios --release
```

## Testing Checklist

- [ ] User registration/login
- [ ] Soil report submission with validation
- [ ] Confidence score calculation
- [ ] Weather API integration
- [ ] Recommendation generation (top 3)
- [ ] Risk tagging (Low/Medium/High)
- [ ] Community insights
- [ ] Feedback submission
- [ ] Disclaimer display
- [ ] Error handling

## Key Features

1. **Trust-First**: Always shows confidence score and risks
2. **Transparent**: Rule-based, no black-box AI
3. **Community Learning**: Pattern-based insights from feedback
4. **Weather Aware**: Integrates OpenWeather API
5. **Farmer Control**: Advisory only, final decision with farmer
