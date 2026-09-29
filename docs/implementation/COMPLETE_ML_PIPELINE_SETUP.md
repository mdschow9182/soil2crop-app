# 🚀 Complete ML Pipeline - Production Setup Guide

**Last Updated:** March 12, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Complete Setup (Production)](#complete-setup-production)
3. [Training Pipeline](#training-pipeline)
4. [Testing & Validation](#testing--validation)
5. [Deployment](#deployment)
6. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Navigate to ML Service
```bash
cd backend/python-ml-service
```

### Step 2: Activate Virtual Environment
**Windows:**
```bash
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Create Sample Dataset
```bash
python setup_datasets.py --download
```

### Step 5: Train Models
```bash
python train_all_models.py
```

### Step 6: Start ML Service
```bash
python start_ml_service.py
```

### Step 7: Test API (New Terminal)
```bash
cd backend/python-ml-service
python test_ml_api.py --all
```

**✅ Done!** Your ML service is running at `http://127.0.0.1:5000`

---

## 🏗️ Complete Setup (Production)

### Phase 1: Environment Setup

#### 1.1 Python Environment
```bash
# Check Python version (need 3.8+)
python --version

# Create virtual environment
python -m venv venv

# Activate
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip
```

#### 1.2 Install Dependencies
```bash
# Core ML packages
pip install flask flask-cors pandas numpy scikit-learn tensorflow joblib

# Image processing
pip install Pillow requests matplotlib

# Save to requirements.txt
pip freeze > requirements.txt
```

#### 1.3 Verify Installation
```bash
python -c "import flask; import sklearn; import tensorflow as tf; print('✅ All packages installed')"
```

---

### Phase 2: Dataset Integration

#### 2.1 Directory Structure
```bash
# Create required directories
python setup_datasets.py
```

This creates:
```
backend/python-ml-service/
├── data/
│   ├── crop_dataset.csv          # For crop prediction
│   ├── train/                     # Disease training images
│   │   ├── healthy/
│   │   ├── leaf_spot/
│   │   ├── rust/
│   │   └── bacterial_blight/
│   └── validation/                # Disease validation images
│       ├── healthy/
│       ├── leaf_spot/
│       ├── rust/
│       └── bacterial_blight/
├── models/                        # Trained models (created after training)
└── logs/                          # Training and inference logs
```

#### 2.2 Get Real Datasets

**Option A: Sample Data (Testing Only)**
```bash
python setup_datasets.py --download
```
Creates synthetic dataset with 5,000 samples (10 crops × 500 samples each).

**Option B: Real Agricultural Data (Production)**

**Crop Prediction:**
1. Download from Kaggle: https://www.kaggle.com/datasets/atharvasoundankar/crop-recommendation-dataset
2. Or data.gov.in: https://data.gov.in/agriculture
3. Place as `data/crop_dataset.csv`

**Disease Detection:**
1. Download PlantVillage: https://www.kaggle.com/datasets/emmarex/plantdisease
2. Extract and organize:
```bash
mv PlantVillage/train/* data/train/
mv PlantVillage/validation/* data/validation/
```

#### 2.3 Validate Datasets
```bash
python setup_datasets.py --validate
```

Expected output:
```
✅ Crop Dataset: 5000 samples, 10 classes
✅ healthy: 1200 train, 300 validation
✅ leaf_spot: 1300 train, 320 validation
✅ rust: 1250 train, 310 validation
✅ bacterial_blight: 1280 train, 315 validation
```

---

### Phase 3: Model Training

#### 3.1 Train Crop Prediction Model

**Single Command:**
```bash
python train_crop_model.py --dataset data/crop_dataset.csv
```

**With Custom Parameters:**
```bash
python train_crop_model.py \
  --dataset data/crop_dataset.csv \
  --output-dir models \
  --test-size 0.2
```

**Expected Output:**
```
🚜 Soil2Crop - Crop Prediction Model Training
📊 Loading dataset from: data/crop_dataset.csv
✅ Loaded 5000 samples with 7 columns
🔧 Preprocessing data...
📊 Dataset size after outlier removal: 4923
✅ Encoded 10 crop classes
📊 Training set: 3938 samples
📊 Test set: 985 samples
🚀 Training Random Forest model...
✅ Model Accuracy: 92.34%
💾 Saving model to models/...
✅ Model saved to: models/crop_model.pkl
```

#### 3.2 Train Disease Detection Model

**Single Command:**
```bash
python train_disease_model.py --data-dir data --epochs 25
```

**With Custom Parameters:**
```bash
python train_disease_model.py \
  --data-dir data \
  --output-dir models \
  --epochs 30 \
  --img-size 224
```

**Expected Output:**
```
🔬 Soil2Crop - Disease Detection Model Training
🔄 Creating data generators with augmentation...
✅ Training samples: 5030
✅ Validation samples: 1245
🏷️  Classes: ['healthy', 'leaf_spot', 'rust', 'bacterial_blight']
🏗️  Building MobileNetV2 model...
🚀 Starting model training...
Epoch 1/25
...
✅ Validation Accuracy: 95.67%
💾 Saving model...
✅ Model saved to: models/disease_model.h5
```

#### 3.3 Train Both Models (Recommended)
```bash
python train_all_models.py \
  --crop-dataset data/crop_dataset.csv \
  --disease-data-dir data \
  --epochs 25
```

**Output Files:**
```
models/
├── crop_model.pkl              ✅ (Random Forest)
├── crop_label_encoder.pkl      ✅ (Label encoder)
├── crop_metrics.json           ✅ (Accuracy: 0.92)
├── disease_model.h5            ✅ (CNN MobileNetV2)
├── disease_classes.json        ✅ (Class labels)
├── disease_history.json        ✅ (Training curves)
└── disease_metrics.json        ✅ (Accuracy: 0.95)
```

---

## 🧪 Testing & Validation

### Test Suite Overview

Three levels of testing:
1. **Unit Tests** - Individual components
2. **API Tests** - Python ML service endpoints
3. **Integration Tests** - Node.js ↔ Python communication

### Run Python ML API Tests

```bash
python test_ml_api.py --all
```

**Tests Include:**
- ✅ Health check endpoint
- ✅ Crop prediction API
- ✅ Disease detection API
- ✅ Error handling
- ✅ Performance benchmarks

**Expected Results:**
```
📊 Test Summary
✅ Passed: 5
❌ Failed: 0
⏭️ Skipped: 0
📈 Success Rate: 100.0%
🎉 All tests passed!
```

### Run Integration Tests

From backend directory:
```bash
cd backend
node test-integration.js
```

**Tests Include:**
- ✅ Python ML service health
- ✅ Node.js backend health
- ✅ End-to-end crop prediction
- ✅ Fallback system activation
- ✅ Response time benchmarks

### Manual API Testing

**Test Crop Prediction:**
```bash
curl -X POST http://127.0.0.1:5000/predict-crop \
  -H "Content-Type: application/json" \
  -d '{
    "ph": 6.5,
    "nitrogen": 120,
    "phosphorus": 40,
    "potassium": 60,
    "rainfall_mm": 800,
    "temperature_avg": 28
  }'
```

**Expected Response:**
```json
{
  "predictions": [
    {
      "crop": "Rice",
      "probability": 0.9234,
      "yield_kg_per_hectare": 4500
    },
    {
      "crop": "Maize",
      "probability": 0.7821,
      "yield_kg_per_hectare": 3800
    }
  ],
  "model_version": "random-forest-v1.0",
  "confidence": 0.9234,
  "model_accuracy": 0.92,
  "metadata": {
    "processing_time_ms": 45.2,
    "model_type": "RandomForestClassifier"
  }
}
```

**Test Disease Detection:**
```bash
# Convert image to base64
base64 -i test_leaf.jpg > image.txt

# Send request
curl -X POST http://127.0.0.1:5000/detect-disease \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"$(cat image.txt)\",\"mime_type\":\"image/jpeg\"}"
```

---

## 🚀 Deployment

### Start Production ML Service

**Option 1: Managed Startup (Recommended)**
```bash
python start_ml_service.py --skip-checks
```

**Option 2: Direct Flask**
```bash
# Production with Gunicorn
pip install gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app
```

**Option 3: Docker Container**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -t soil2crop-ml .
docker run -p 5000:5000 soil2crop-ml
```

### Start Complete Backend

**Terminal 1 - Python ML Service:**
```bash
cd backend/python-ml-service
python start_ml_service.py
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
node index.js
```

**Verify Integration:**
```bash
# Test through Node.js
curl -X POST http://localhost:3000/api/soil2crop \
  -H "Content-Type: application/json" \
  -d '{"farmer_id":"test123","soilType":"Loamy","pH":6.5}'
```

---

## 🛠️ Troubleshooting

### Issue: Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'flask'
```

**Solution:**
```bash
# Ensure virtual environment is activated
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Reinstall dependencies
pip install -r requirements.txt
```

---

### Issue: Models Not Loading

**Error:**
```
FileNotFoundError: models/crop_model.pkl not found
```

**Solution:**
```bash
# Check if models exist
ls models/

# If missing, train models
python train_all_models.py
```

---

### Issue: Low Model Accuracy (<70%)

**Causes:**
1. Insufficient dataset
2. Poor data quality
3. Wrong hyperparameters

**Solutions:**
1. Increase dataset size (minimum 1,000 samples)
2. Clean dataset (remove mislabeled samples)
3. Tune hyperparameters in `train_crop_model.py`:
   ```python
   RandomForestClassifier(
       n_estimators=200,      # Increase trees
       max_depth=20,          # Increase depth
       min_samples_split=3    # Reduce split threshold
   )
   ```

---

### Issue: CUDA/GPU Errors

**Error:**
```
Could not load dynamic library 'cudart64_110.dll'
```

**Solution (Use CPU instead):**
Add to top of training scripts:
```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
```

Or install CPU-only TensorFlow:
```bash
pip uninstall tensorflow
pip install tensorflow-cpu
```

---

### Issue: Service Won't Start

**Check Logs:**
```bash
# View startup logs
cat logs/ml_service_startup.log

# Check what's running on port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Linux/Mac
```

**Solution:**
```bash
# Kill process on port 5000
taskkill /PID <PID> /F  # Windows
kill -9 <PID>           # Linux/Mac

# Restart service
python start_ml_service.py
```

---

### Issue: API Timeout

**Error:**
```
requests.exceptions.Timeout
```

**Solution:**
Increase timeout in test script:
```python
response = requests.post(url, json=data, timeout=30)  # Increase from 10 to 30
```

Or optimize model inference:
- Use smaller models
- Reduce image size
- Batch predictions

---

## 📊 Performance Benchmarks

### Expected Metrics

**Crop Prediction (Random Forest):**
| Dataset Size | Accuracy | Training Time | Inference Time |
|--------------|----------|---------------|----------------|
| 1,000        | ~85%     | 1 min         | <50ms          |
| 5,000        | ~90%     | 5 min         | <45ms          |
| 10,000+      | ~92%     | 10 min        | <40ms          |

**Disease Detection (CNN MobileNetV2):**
| Images/Class | Accuracy | Training Time | Inference Time |
|--------------|----------|---------------|----------------|
| 500          | ~90%     | 30 min        | <250ms         |
| 1,000        | ~94%     | 45 min        | <230ms         |
| 5,000+       | ~96%     | 2 hours       | <200ms         |

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Models trained with >85% accuracy
- [ ] Datasets validated and cleaned
- [ ] All API tests passing
- [ ] Integration tests passing
- [ ] Fallback system tested
- [ ] Logging configured
- [ ] Error handling robust
- [ ] Performance benchmarks met
- [ ] Security measures in place
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Documentation complete

---

## 📞 Support Resources

### Documentation Files
- `ML_TRAINING_COMPLETE_GUIDE.md` - Detailed training instructions
- `ML_IMPLEMENTATION_CHECKLIST.md` - Step-by-step verification
- `VISUAL_SYSTEM_OVERVIEW.md` - Architecture diagrams
- `backend/python-ml-service/README.md` - API reference

### External Resources
- Scikit-learn Docs: https://scikit-learn.org/
- TensorFlow Keras Guide: https://www.tensorflow.org/guide/keras
- PlantVillage Dataset: https://www.kaggle.com/datasets/emmarex/plantdisease
- Crop Recommendation Dataset: https://www.kaggle.com/datasets/atharvasoundankar/crop-recommendation-dataset

---

## 🎉 Success Criteria

Your ML pipeline is production-ready when:

✅ Models achieve >85% validation accuracy  
✅ All automated tests pass (100% success rate)  
✅ API response times <500ms  
✅ Fallback system activates correctly  
✅ Comprehensive logging enabled  
✅ Error handling prevents crashes  
✅ Documentation complete and up-to-date  

---

**🚀 You now have a complete production-ready ML pipeline for agriculture!**

For more details, see the comprehensive guides listed above.

Good luck with your deployment! 🚜🤖🌾
