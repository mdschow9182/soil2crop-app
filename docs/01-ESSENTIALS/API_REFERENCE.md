# 📋 Soil2Crop API Reference Card

## Quick API Testing Guide

### Base URL
```
http://localhost:3000
```

---

## 🌾 MODULE 1: ML Crop Prediction

### POST /soil2crop

**Get AI-powered crop recommendations**

**Request:**
```bash
curl -X POST http://localhost:3000/soil2crop \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "soilType": "Loamy",
    "pH": 7.2,
    "nitrogen": 220,
    "phosphorus": 34,
    "potassium": 180,
    "season": "Kharif",
    "rainfall_mm": 850,
    "temperature_avg": 28
  }'
```

**Response:**
```json
{
  "success": true,
  "method": "ml-based",
  "data": {
    "ml_predictions": [
      {
        "crop": "Rice",
        "probability": 0.875,
        "expected_yield_kg_hectare": 3938,
        "profit_estimate_inr": 39375,
        "risk_factors": ["High water requirement"],
        "confidence": "HIGH"
      }
    ],
    "model_version": "v1.0.0"
  }
}
```

---

## 🍃 MODULE 2: Disease Detection

### POST /api/crop-health-analyze

**Detect crop diseases from leaf images**

**Request:**
```bash
curl -X POST http://localhost:3000/api/crop-health-analyze \
  -F "farmer_id=65a1b2c3d4e5f6g7h8i9j0k1" \
  -F "crop_image=@rice-blast-test.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "disease_detected": "Rice Blast",
    "confidence": 0.8945,
    "severity": "High",
    "affected_area_percentage": 42,
    "symptoms": [
      "Spindle-shaped spots on leaves",
      "Gray or white centers with dark borders"
    ],
    "treatment": {
      "organic": ["Neem oil spray (5ml/L water)"],
      "chemical": ["Carbendazim 50WP (2g/L water)"],
      "cultural_practices": ["Remove infected plant debris"]
    },
    "prevention_tips": ["Use resistant varieties"]
  }
}
```

---

## 🌤️ MODULE 3: Weather Intelligence

### GET /api/weather

**Get current weather data**

**Request:**
```bash
curl "http://localhost:3000/api/weather?lat=16.5&lon=80.6"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 29,
    "feels_like": 31,
    "humidity": 85,
    "pressure": 1013,
    "wind_speed": 12,
    "rainfall_probability": 0.7,
    "description": "Light rain",
    "irrigation_suggestion": "Rain expected. Delay irrigation.",
    "city": "Guntur"
  }
}
```

---

### GET /api/weather/forecast

**Get 5-day weather forecast**

**Request:**
```bash
curl "http://localhost:3000/api/weather/forecast?lat=16.5&lon=80.6"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-15T12:00:00Z",
      "temperature": 28,
      "rainfall_probability": 0.65,
      "description": "Scattered showers"
    }
  ]
}
```

---

### GET /api/weather/drought-alert

**Get drought alert for location**

**Request:**
```bash
curl "http://localhost:3000/api/weather/drought-alert?location=Guntur&days=7"
```

---

## 💰 Additional APIs

### GET /api/market-prices

**Get current market prices**

**Request:**
```bash
curl "http://localhost:3000/api/market-prices?crop=Rice&location=Guntur"
```

---

### GET /api/market/intelligence

**Get market intelligence and trends**

**Request:**
```bash
curl "http://localhost:3000/api/market/intelligence?crop=Rice&location=Guntur"
```

---

### GET /api/market/best-time-to-sell

**Get best time to sell recommendation**

**Request:**
```bash
curl "http://localhost:3000/api/market/best-time-to-sell?crop=Rice&location=Guntur"
```

---

### GET /api/market/profit-estimate

**Estimate profit for crop**

**Request:**
```bash
curl "http://localhost:3000/api/market/profit-estimate?crop=Rice&yield_per_acre=2000&total_acres=5&location=Guntur"
```

---

### GET /api/schemes/recommendations

**Get government scheme recommendations**

**Request:**
```bash
curl "http://localhost:3000/api/schemes/recommendations?soil_type=Loamy&crop_selected=Rice&field_size=5&farmer_location=Guntur"
```

---

### POST /api/farmer-assistant

**Chat with AI farming assistant**

**Request:**
```bash
curl -X POST http://localhost:3000/api/farmer-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the best fertilizer for rice?",
    "language": "en"
  }'
```

---

### GET /api/farmer-assistant/suggestions

**Get suggested questions**

**Request:**
```bash
curl "http://localhost:3000/api/farmer-assistant/suggestions"
```

---

## 🧪 Health Check Endpoints

### GET /health

**Check server health**

```bash
curl http://localhost:3000/health
```

---

### GET /api/test-db

**Test MongoDB connection**

```bash
curl http://localhost:3000/api/test-db
```

---

## 📊 Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here",
  "error": "Detailed error message (in development mode)"
}
```

---

## 🔑 Authentication

Currently, all endpoints require:
- `farmer_id` parameter in request body or query
- Valid MongoDB ObjectId format

Example:
```json
{
  "farmer_id": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

---

## 📝 File Upload Specifications

**Accepted Formats:**
- Images: JPEG, JPG, PNG
- Documents: PDF
- Max Size: 10MB

**Field Names:**
- Disease detection: `crop_image`
- Soil upload: `soil_report`

---

## 🎯 Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth endpoints | 10 requests | 15 minutes |
| File uploads | Limited by file size (10MB) | - |

---

## 🛠️ Testing Tools

### Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Soil2Crop API"
  },
  "item": [
    {
      "name": "ML Crop Prediction",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/soil2crop",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"farmer_id\": \"65a1b2c3d4e5f6g7h8i9j0k1\",\n  \"soilType\": \"Loamy\",\n  \"pH\": 7.2,\n  \"nitrogen\": 220\n}"
        }
      }
    }
  ]
}
```

---

## 🚀 Quick Test Commands

### Test All Modules at Once:

```bash
# 1. Test ML prediction
echo "Testing ML Crop Prediction..."
curl -X POST http://localhost:3000/soil2crop -H "Content-Type: application/json" -d '{"farmer_id":"65a1b2c3d4e5f6g7h8i9j0k1","soilType":"Loamy","pH":7.2,"nitrogen":220}'

# 2. Test disease detection (create test file first)
echo "Testing Disease Detection..."
cp test-image.jpg rice-blast-test.jpg
curl -X POST http://localhost:3000/api/crop-health-analyze -F "farmer_id=65a1b2c3d4e5f6g7h8i9j0k1" -F "crop_image=@rice-blast-test.jpg"

# 3. Test weather
echo "Testing Weather API..."
curl "http://localhost:3000/api/weather?lat=16.5&lon=80.6"
```

---

## 📞 Support

For issues:
1. Check logs: Console output or `backend/logs/`
2. Enable debug: Set `NODE_ENV=development`
3. Review docs: `AI_UPGRADE_COMPLETE.md`

---

**API Version:** v2.0.0  
**Last Updated:** January 2024
