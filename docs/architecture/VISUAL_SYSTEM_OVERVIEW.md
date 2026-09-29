# 🚜 Soil2Crop AI Platform - Visual Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FARMER (User)                             │
│                     Mobile/Web App                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dashboard | Soil Health | Crop Monitor | Disease Scan   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API Calls
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                     │
│                      Port: 3000                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  API Endpoints:                                        │     │
│  │  • POST /api/soil2crop         → Crop recommendation   │     │
│  │  • POST /api/disease/detect    → Disease analysis      │     │
│  │  • GET  /api/farm-health       → Health score          │     │
│  │  • POST /api/upload/soil       → Soil report upload    │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Middleware: Auth | Validation | Logging | Error Handle│     │
│  └────────────────────────────────────────────────────────┘     │
└──────────┬───────────────────────────────────┬──────────────────┘
           │                                   │
           │ Try Primary (ML Service)          │ Fallback if ML unavailable
           ↓                                   ↓
┌──────────────────────────┐        ┌────────────────────────────┐
│   PYTHON ML SERVICE      │        │   RULE-BASED AI            │
│   Flask • Port 5000      │        │   (Existing Logic)         │
│                          │        │                            │
│  ┌────────────────────┐  │        │  If soil_type == 'Loamy':  │
│  │ Crop Model         │  │        │    return 'Wheat'          │
│  │ RandomForest       │  │        │                            │
│  │ Accuracy: 85-92%   │  │        │  Pros: Always available    │
│  └────────────────────┘  │        │  Cons: Less accurate       │
│                          │        └────────────┬───────────────┘
│  ┌────────────────────┐  │                     │
│  │ Disease Model      │  │                     │
│  │ CNN MobileNetV2    │  │                     │
│  │ Accuracy: 90-96%   │  │                     │
│  └────────────────────┘  │                     │
│                          │                     │
│  Features:               │                     │
│  • Confidence scores     │                     │
│  • Model metrics         │                     │
│  • Treatment plans       │                     │
│  • Image analysis        │                     │
└──────────┬───────────────┘                     │
           │                                     │
           └──────────────┬──────────────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │   MongoDB Atlas       │
              │   Cloud Database      │
              │                       │
              │ Collections:          │
              │ • farmers             │
              │ • soil_reports        │
              │ • crop_recommendations│
              │ • disease_detections  │
              │ • farm_health_scores  │
              └───────────────────────┘
```

---

## ML Workflow: Crop Prediction

```
┌──────────────────────────────────────────────────────────────┐
│                    Training Phase                             │
└──────────────────────────────────────────────────────────────┘

Step 1: Collect Dataset
┌─────────────────────────────────────────┐
│  CSV File (crop_dataset.csv)            │
│  ┌───────────────────────────────────┐  │
│  │ ph | N | P | K | rain | temp |crop│  │
│  ├───────────────────────────────────┤  │
│  │6.5 |120|40 |60 | 800  | 28  |Rice│  │
│  │7.2 | 90|30 |50 | 600  | 25  |Wht │  │
│  │ ... 1,000+ samples ...            │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               ↓
Step 2: Run Training Script
$ python train_crop_model.py --dataset data/crop_dataset.csv
               ↓
Step 3: Preprocessing
┌─────────────────────────────────────────┐
│ • Handle missing values (fillna)        │
│ • Remove outliers (IQR method)          │
│ • Encode labels (LabelEncoder)          │
│ • Split train/test (80/20)              │
└──────────────┬──────────────────────────┘
               ↓
Step 4: Train Random Forest
┌─────────────────────────────────────────┐
│ RandomForestClassifier(                 │
│   n_estimators=100,                     │
│   max_depth=15,                         │
│   class_weight='balanced'               │
│ )                                       │
│                                         │
│ Each tree votes → majority wins         │
└──────────────┬──────────────────────────┘
               ↓
Step 5: Save Model
┌─────────────────────────────────────────┐
│ models/                                 │
│ ├── crop_model.pkl              ✅      │
│ ├── crop_label_encoder.pkl      ✅      │
│ └── crop_metrics.json           ✅      │
│     (accuracy: 0.87)                    │
└─────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────┐
│                    Inference Phase                            │
└──────────────────────────────────────────────────────────────┘

User Input (via API)
{ph:6.5, N:120, P:40, K:60, rainfall:800, temp:28}
               ↓
Load Trained Model
joblib.load('models/crop_model.pkl')
               ↓
Preprocess Input
Create DataFrame with same features as training
               ↓
Predict
model.predict(features) → [3]
model.predict_proba(features) → [0.87, 0.72, 0.65...]
               ↓
Post-process
Index 3 → "Rice" (via label_encoder)
               ↓
Return Top 3 Crops
{
  "predictions": [
    {"crop":"Rice", "prob":0.87},
    {"crop":"Maize", "prob":0.72},
    {"crop":"Wheat", "prob":0.65}
  ],
  "confidence": 0.87
}
```

---

## ML Workflow: Disease Detection

```
┌──────────────────────────────────────────────────────────────┐
│                    Training Phase                             │
└──────────────────────────────────────────────────────────────┘

Step 1: Organize Image Dataset
data/
├── train/
│   ├── healthy/          (500+ images)
│   ├── leaf_spot/        (500+ images)
│   ├── rust/             (500+ images)
│   └── bacterial_blight/ (500+ images)
└── validation/
    └── (same structure)

Step 2: Run Training
$ python train_disease_model.py --data-dir data/ --epochs 25
               ↓
Step 3: Data Augmentation
┌─────────────────────────────────────────┐
│ Original Image → Apply random:          │
│ • Rotation (±40°)                       │
│ • Width/Height shift (±20%)             │
│ • Zoom (±20%)                           │
│ • Horizontal flip                       │
│ • Shear                                 │
└──────────────┬──────────────────────────┘
               ↓
Step 4: Transfer Learning
┌─────────────────────────────────────────┐
│ MobileNetV2 (pre-trained on ImageNet)   │
│                                         │
│ Phase 1 (Epochs 1-15):                  │
│   Freeze base → train custom layers     │
│                                         │
│ Phase 2 (Epochs 16-25):                 │
│   Unfreeze top 50 layers → fine-tune    │
└──────────────┬──────────────────────────┘
               ↓
Step 5: Model Architecture
Input (224x224x3 RGB image)
    ↓
MobileNetV2 (feature extractor)
    ↓
GlobalAveragePooling2D
    ↓
Dropout(0.5)
    ↓
Dense(128, ReLU)
    ↓
Dropout(0.3)
    ↓
Dense(4, softmax) ← Output
    └─→ healthy
    └─→ leaf_spot
    └─→ rust
    └─→ bacterial_blight
               ↓
Step 6: Save Model
models/
├── disease_model.h5        ✅
├── disease_classes.json    ✅
├── disease_history.json    ✅
└── disease_metrics.json    ✅ (accuracy: 0.95)


┌──────────────────────────────────────────────────────────────┐
│                    Inference Phase                            │
└──────────────────────────────────────────────────────────────┘

User Uploads Leaf Image (via API)
base64-encoded JPEG
               ↓
Decode & Preprocess
image = base64.decode(data['image'])
image.resize((224, 224))
img_array = np.array(image) / 255.0
               ↓
CNN Prediction
predictions = model.predict(img_array)
pred_idx = argmax(predictions[0])  # e.g., [0.02, 0.95, 0.02, 0.01]
confidence = 0.95
               ↓
Get Disease Info
disease_name = class_labels[pred_idx]  # "leaf_spot"
treatment = get_disease_treatment(disease_name)
               ↓
Return Comprehensive Report
{
  "disease": "Leaf Spot",
  "confidence": 0.95,
  "severity": "High",
  "symptoms": ["Brown spots", "Yellow halos"],
  "treatment": {
    "organic": ["Neem oil spray"],
    "chemical": ["Carbendazim 50WP"]
  }
}
```

---

## Fallback System Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│              User Requests Crop Recommendation              │
└────────────────────┬────────────────────────────────────────┘
                     ↓
        ┌────────────────────────┐
        │  Node.js Backend       │
        │  POST /api/soil2crop   │
        └──────────┬─────────────┘
                   ↓
        ┌────────────────────────┐
        │  Call ML Service       │
        │  mlService.predictCrop()│
        └──────────┬─────────────┘
                   ↓
        ┌────────────────────────┐
        │  Try Python Service    │
        │  http://127.0.0.1:5000 │
        └──────────┬─────────────┘
                   ↓
          ╔══════════════════════╗
          ║   Is ML Service      ║
          ║   Available?         ║
          ╚════════╦═════════════╝
                   │
        ┌──────────┴──────────┐
        │ YES                 │ NO
        ↓                     ↓
┌──────────────┐      ┌──────────────────┐
│ Load Models  │      │ Catch Exception  │
│ ✅ Success   │      │ Log Warning      │
└──────┬───────┘      └────────┬─────────┘
       │                      │
       │                      ↓
       │            ┌──────────────────┐
       │            │ FALLBACK MODE    │
       │            │ Use Rule-Based   │
       │            │ AI Instead       │
       │            │                  │
       │            │ if soil=='Loamy':│
       │            │   return 'Wheat' │
       │            └────────┬─────────┘
       │                     │
       └──────────┬──────────┘
                  ↓
        ┌─────────────────┐
        │ Return Response │
        │ to Frontend     │
        └─────────────────┘
```

---

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  React 18 • TypeScript • TailwindCSS • Radix UI         │
│  Components: Forms, Charts, Widgets, Notifications      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                    │
│  Node.js 16+ • Express.js • REST APIs • Middleware      │
│  Services: Farmer, Soil, Crop, Weather, Market, Alerts  │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│   AI/ML LAYER    │              │  BUSINESS LOGIC  │
│  Python 3.10+    │              │  Rule-Based AI   │
│  Flask REST API  │              │  Fallback System │
│                  │              │                  │
│  ML Models:      │              │  If-Then Rules   │
│  • RandomForest  │              │  Expert System   │
│  • CNN ConvNet   │              │  Decision Trees  │
│                  │              │                  │
│  Libraries:      │              │  Always Active   │
│  • scikit-learn  │              │  as Backup       │
│  • TensorFlow    │              └──────────────────┘
│  • pandas, numpy │
└──────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│  MongoDB Atlas (Cloud) • Mongoose ODM                   │
│  Collections: Farmers, Reports, Predictions, Logs       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                      │
│  • OpenWeather API (weather data)                       │
│  • Twilio (SMS notifications)                           │
│  • Government APIs (market prices, schemes)             │
│  • File Storage (soil reports, crop images)             │
└─────────────────────────────────────────────────────────┘
```

---

## Feature Comparison Matrix

```
┌────────────────────┬──────────────┬──────────────┬──────────────┐
│     FEATURE        │   BEFORE     │    AFTER     │  IMPROVEMENT │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Crop Prediction    │ Rule-Based   │ ML-Powered   │   +15-20% 📈 │
│ Accuracy           │ ~65-70%      │ ~85-92%      │   Accuracy   │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Disease Detection  │ Manual Only  │ AI Vision    │   NEW ✨      │
│                    │ No automation│ 90-96% acc.  │   Feature    │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Confidence Scores  │ None         │ Yes (0-1)    │   NEW ✨      │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Model Metrics      │ Not tracked  │ Full tracking│   NEW ✨      │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Image Analysis     │ Not possible │ CNN-based    │   NEW ✨      │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Treatment Plans    │ Generic      │ ML-personalized│ Better 🎯  │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Fallback System    │ N/A          │ Auto-fallback│ Safer 🛡️    │
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Processing Time    │ <10ms        │ 50-300ms     │ Acceptable ⚡│
├────────────────────┼──────────────┼──────────────┼──────────────┤
│ Scalability        │ Limited      │ Microservices│   Better 🚀  │
└────────────────────┴──────────────┴──────────────┴──────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOYMENT                   │
└─────────────────────────────────────────────────────────────┘

Frontend Hosting
┌─────────────────────────────────────────┐
│ Vercel / Netlify / AWS S3 + CloudFront  │
│ • CDN for static assets                 │
│ • Global edge locations                 │
│ • Automatic HTTPS                       │
└─────────────────────────────────────────┘
                ↓ HTTPS
Backend Hosting
┌─────────────────────────────────────────┐
│ AWS EC2 / Heroku / DigitalOcean         │
│ • Node.js 16+ runtime                   │
│ • PM2 process manager                   │
│ • Nginx reverse proxy                   │
│ • Let's Encrypt SSL                     │
└─────────────────────────────────────────┘
        ↓                   ↓
┌──────────────┐    ┌──────────────┐
│ Python ML    │    │   MongoDB    │
│ Service      │    │   Atlas      │
│ (Docker)     │    │   (Cloud)    │
│ • Gunicorn   │    │ • M10+ tier  │
│ • Flask      │    │ • Backups    │
└──────────────┘    └──────────────┘
```

---

**🎯 This visual guide shows the complete AI-powered Soil2Crop platform!**

For implementation details, see:
- `ML_TRAINING_COMPLETE_GUIDE.md` - How to train models
- `ML_QUICK_START_REFERENCE.md` - Quick commands
- `backend/python-ml-service/README.md` - Service documentation
