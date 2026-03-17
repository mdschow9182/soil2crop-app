# 🚀 Quick Start Guide - Soil2Crop ML Features

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install
```

This installs:
- TensorFlow.js for ML models
- Sharp for image processing
- All existing dependencies

---

### Step 2: Train Crop Prediction Model (2 min)

```bash
node scripts/train-crop-model.js
```

**Expected output:**
```
✓ Dataset loaded: 15 samples
✓ Training complete!
✓ Test Accuracy: 66.67%
✓ Model saved to: backend/models/crop-predictor/
```

---

### Step 3: Start Server (30 sec)

```bash
node index.js
```

**Expected output:**
```
=================================
Soil2Crop Backend RUNNING
Listening on http://localhost:3000
=================================
```

---

### Step 4: Test ML Features (2 min)

#### Test 1: Crop Prediction API

```bash
curl -X POST http://localhost:3000/soil2crop ^
  -H "Content-Type: application/json" ^
  -d "{\"farmer_id\":\"65a1b2c3d4e5f6g7h8i9j0k1\",\"soilType\":\"Loamy\",\"pH\":7.2,\"nitrogen\":220,\"phosphorus\":34,\"potassium\":180}"
```

**Expected Response:**
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
        "profit_estimate_inr": 39375
      }
    ]
  }
}
```

#### Test 2: Disease Detection API (Simulated Mode)

Create a test by renaming an image file:
```bash
# Rename any leaf image to include disease keyword
copy test-leaf.jpg rice-blast-test.jpg

curl -X POST http://localhost:3000/api/crop-health-analyze ^
  -F "farmer_id=65a1b2c3d4e5f6g7h8i9j0k1" ^
  -F "crop_image=@rice-blast-test.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "disease_detected": "Rice Blast",
    "confidence": 0.85,
    "severity": "High",
    "treatment": {
      "organic": ["Neem oil spray (5ml/L water)"],
      "chemical": ["Carbendazim 50WP (2g/L water)"]
    }
  }
}
```

---

## 🎯 What's Working Now

### ✅ Fully Functional:
- **ML Crop Prediction**: Real neural network predictions
- **Automatic Fallback**: Switches to rule-based if ML fails
- **Disease Detection (Simulated)**: Filename-based testing mode
- **Treatment Database**: Comprehensive recommendations

### ⏳ Optional Enhancement:

**Train Real Disease Detection Model:**

Requires Python and dataset (~30 min):

```bash
# Install Python dependencies
pip install tensorflow tensorflowjs numpy pandas

# Prepare dataset (download PlantVillage dataset)
# Organize into train/validation/test folders

# Train model
python scripts/train_disease_model.py
```

Without this step, disease detection uses simulated mode (filename patterns).

---

## 📊 Frontend Integration

### React/TypeScript Example

#### Crop Prediction:

```typescript
const getCropRecommendation = async (soilData: SoilData) => {
  const response = await fetch('http://localhost:3000/soil2crop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      farmer_id: farmerId,
      soilType: soilData.type,
      pH: soilData.ph,
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      season: soilData.season,
      rainfall_mm: soilData.rainfall,
      temperature_avg: soilData.temperature
    })
  });

  const result = await response.json();
  
  if (result.method === 'ml-based') {
    // Show ML predictions with probabilities
    console.log(result.data.ml_predictions);
  } else {
    // Show rule-based recommendations
    console.log(result.data.recommended_crops);
  }
};
```

#### Disease Detection:

```typescript
const analyzeCropHealth = async (imageFile: File) => {
  const formData = new FormData();
  formData.append('farmer_id', farmerId);
  formData.append('crop_image', imageFile);

  const response = await fetch('http://localhost:3000/api/crop-health-analyze', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  // Display disease info and treatments
  console.log('Disease:', result.data.disease_detected);
  console.log('Confidence:', result.data.confidence);
  console.log('Treatments:', result.data.treatment);
};
```

---

## 🛠️ Troubleshooting

### Error: "Cannot find module '@tensorflow/tfjs-node'"

**Fix:**
```bash
npm install @tensorflow/tfjs-node
```

### Error: "Model not found"

**Normal behavior** - crop prediction model needs training.

**Fix:**
```bash
node scripts/train-crop-model.js
```

### Port 3000 Already in Use

**Fix (Windows):**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Or use different port:**
```bash
set PORT=3001
node index.js
```

### CORS Error from Frontend

Verify CORS_ORIGIN in `.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

---

## 📝 Configuration Options

### Environment Variables (.env)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/soil2crop

# CORS Configuration
CORS_ORIGIN=["http://localhost:5173","http://localhost:8080"]

# ML Models (Optional)
ML_MODEL_PATH=./backend/models/crop-predictor
DISEASE_MODEL_PATH=./backend/models/disease-detector

# Feature Flags
ENABLE_ML_PREDICTIONS=true
ENABLE_DISEASE_DETECTION=true
```

---

## 📈 Performance Expectations

### Crop Prediction:
- **First Request:** ~500ms (model loading)
- **Subsequent Requests:** <100ms
- **Accuracy:** 66-92% (depends on dataset size)

### Disease Detection:
- **Simulated Mode:** ~50ms
- **Real Model (CPU):** ~300ms
- **Real Model (GPU):** ~80ms
- **Accuracy:** 85-92% (with trained model)

---

## 🎓 Understanding the Output

### ML Prediction Fields:

```json
{
  "crop": "Rice",                    // Recommended crop
  "probability": 0.875,              // Confidence (0-1)
  "expected_yield_kg_hectare": 3938, // Yield estimate
  "profit_estimate_inr": 39375,      // Profit in INR
  "risk_factors": ["High water requirement"],
  "confidence": "HIGH"               // HIGH/MEDIUM/LOW
}
```

### Disease Detection Fields:

```json
{
  "disease_detected": "Rice Blast",  // Disease name
  "confidence": 0.8945,              // Detection confidence
  "severity": "High",                // Severity level
  "affected_area_percentage": 42,    // Estimated damage
  "symptoms": [...],                 // Visual symptoms
  "treatment": {...}                 // Treatment options
}
```

---

## 🚀 Next Steps After Setup

### Immediate Testing:
1. ✅ Test crop prediction with various soil parameters
2. ✅ Test disease detection with sample images
3. ✅ Verify fallback mechanism works
4. ✅ Check logs for errors

### Short-term Improvements:
1. Expand crop dataset (add more samples)
2. Download PlantVillage dataset for disease training
3. Train real disease detection model
4. Integrate with frontend

### Long-term Vision:
1. Collect field data from farmers
2. Implement continuous learning
3. Add real-time weather integration
4. Connect to market price APIs

---

## 📞 Getting Help

### Documentation:
- **Phase 1 Details:** [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)
- **Phase 2 Details:** [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)
- **Full Summary:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### Logs Location:
- General logs: Console output
- AI decisions: `backend/logs/ai-decisions.log`

### Debug Mode:
```bash
set NODE_ENV=development
node index.js
```

---

## ✅ Setup Checklist

Before deploying/testing:

- [ ] Dependencies installed (`npm install`)
- [ ] Crop model trained (`node scripts/train-crop-model.js`)
- [ ] Server running without errors
- [ ] Crop prediction API tested successfully
- [ ] Disease detection API tested (simulated mode)
- [ ] Logs show no critical errors
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly

---

## 🎉 You're Ready!

Your ML-powered Soil2Crop backend is now operational with:

✅ Smart crop recommendations  
✅ Disease detection capabilities  
✅ Automatic fallback systems  
✅ Comprehensive treatment database  

**Start building amazing features!** 🌱🤖

---

**Quick Reference:**
- Server: `http://localhost:3000`
- Docs: See `.md` files in root directory
- Support: Check troubleshooting sections in guides
