# 📊 Soil2Crop Datasets Documentation

## Overview

The `datasets/` folder contains training data and reference datasets for the Soil2Crop ML models and crop recommendation system.

---

## 📁 Files

### 1. `crop_dataset.csv`
**Purpose:** Master dataset of all crops with their NPK requirements and growing conditions

**Columns:**
- `crop_id` - Unique identifier (e.g., "rice", "wheat")
- `crop_name` - Display name of the crop
- `nitrogen_min/max` - Nitrogen requirement range (kg/ha)
- `phosphorus_min/max` - Phosphorus requirement range (kg/ha)
- `potassium_min/max` - Potassium requirement range (kg/ha)
- `ph_min/max` - Optimal soil pH range
- `water_requirement` - Low/Medium/High
- `rain_dependency` - True/False
- `market_volatility` - Low/Medium/High
- `average_yield` - Expected yield (quintals/ha)
- `growing_period` - Days to maturity
- `suitable_soil_types` - Compatible soil types

**Usage:**
- Used by crop recommendation engine
- Matching algorithm compares soil report with crop requirements
- Training data for ML classification models

**Sample Crops (20 total):**
- Rice, Wheat, Cotton, Maize, Sugarcane
- Groundnut, Soybean, Chickpea, Pigeon Pea
- Barley, Millet, Sorghum, Rape Seed
- Sunflower, Sesame, Castor, Tobacco
- Chillies, Turmeric, Ginger

---

### 2. `soil_analysis_training_data.csv`
**Purpose:** Historical soil analysis data with recommended crops and actual yields

**Columns:**
- `sample_id` - Unique sample identifier
- `nitrogen` - Soil nitrogen content (kg/ha)
- `phosphorus` - Soil phosphorus content (kg/ha)
- `potassium` - Soil potassium content (kg/ha)
- `ph` - Soil pH level
- `district` - Geographic location (Andhra Pradesh districts)
- `soil_type` - Sandy/Loamy/Clay
- `recommended_crop` - ML model recommendation
- `confidence_score` - Model confidence (0.0-1.0)
- `yield_prediction_kg_ha` - Predicted yield

**Usage:**
- Training dataset for machine learning models
- Validates recommendation algorithm accuracy
- Tests soil-crop matching logic
- Yield prediction model training

**Data Points:** 40 samples covering:
- Various NPK combinations
- Multiple soil types
- Different districts
- All major crops

---

## 🔧 How to Use These Datasets

### Load Crop Dataset (Python)
```python
import pandas as pd

# Load crop data
crops_df = pd.read_csv('datasets/crop_dataset.csv')

# Filter by water requirement
low_water_crops = crops_df[crops_df['water_requirement'] == 'Low']

# Find crops suitable for specific soil type
sandy_crops = crops_df[crops_df['suitable_soil_types'].str.contains('Sandy')]
```

### Load Training Data (Python)
```python
import pandas as pd
from sklearn.model_selection import train_test_split

# Load soil analysis data
soil_df = pd.read_csv('datasets/soil_analysis_training_data.csv')

# Features and target
features = ['nitrogen', 'phosphorus', 'potassium', 'ph']
target = 'recommended_crop'

X = soil_df[features]
y = soil_df[target]

# Split for training
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

### Use in Backend (Node.js)
```javascript
const fs = require('fs');
const csv = require('csv-parser');

const crops = [];

fs.createReadStream('datasets/crop_dataset.csv')
  .pipe(csv())
  .on('data', (row) => {
    crops.push(row);
  })
  .on('end', () => {
    console.log(`Loaded ${crops.length} crops`);
    // Use crops array for recommendations
  });
```

---

## 🤖 Machine Learning Applications

### 1. Crop Classification Model
**Input:** NPK values + pH  
**Output:** Recommended crop  
**Algorithm Options:**
- Random Forest Classifier
- Gradient Boosting (XGBoost)
- Neural Network

**Training:**
```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Predict
prediction = model.predict([[120, 25, 140, 6.5]])
print(f"Recommended crop: {prediction[0]}")
```

### 2. Yield Prediction Model
**Input:** Crop type + NPK + pH + district  
**Output:** Expected yield (kg/ha)  
**Algorithm:** Regression (Linear/Random Forest)

### 3. Confidence Scoring
Calculate match score between soil conditions and crop requirements:
```python
def calculate_confidence(soil_npk_ph, crop_requirements):
    n_match = 1 if crop_requirements['n_min'] <= soil_npk_ph['n'] <= crop_requirements['n_max'] else 0
    p_match = 1 if crop_requirements['p_min'] <= soil_npk_ph['p'] <= crop_requirements['p_max'] else 0
    k_match = 1 if crop_requirements['k_min'] <= soil_npk_ph['k'] <= crop_requirements['k_max'] else 0
    ph_match = 1 if crop_requirements['ph_min'] <= soil_npk_ph['ph'] <= crop_requirements['ph_max'] else 0
    
    return (n_match + p_match + k_match + ph_match) / 4.0
```

---

## 📈 Dataset Statistics

### Crop Dataset
- **Total Crops:** 20
- **Water Requirements:**
  - Low: 8 crops
  - Medium: 7 crops
  - High: 5 crops
- **Soil Type Distribution:**
  - Loamy: 18 crops
  - Sandy: 15 crops
  - Clay: 6 crops
- **Growing Period Range:** 90-300 days
- **Average Yield Range:** 8-80 quintals/ha

### Training Data
- **Total Samples:** 40
- **Districts Covered:** 20+ (Andhra Pradesh)
- **Soil Types:** Sandy, Loamy, Clay
- **N Range:** 20-185 kg/ha
- **P Range:** 15-42 kg/ha
- **K Range:** 30-185 kg/ha
- **pH Range:** 5.5-7.5
- **Confidence Score Range:** 0.80-0.94

---

## 🔄 Updating Datasets

### Add New Crop
1. Open `crop_dataset.csv`
2. Add new row with complete NPK requirements
3. Ensure crop_id is unique
4. Validate ranges against agricultural standards

### Add Training Samples
1. Collect field data from farmers
2. Record soil analysis results
3. Track actual yields
4. Append to `soil_analysis_training_data.csv`
5. Retrain ML models with expanded dataset

---

## 📝 Data Sources

- **Agricultural Universities:** ICAR, State Agricultural Universities
- **Government Publications:** Ministry of Agriculture, NITI Aayog
- **Research Papers:** Crop requirement studies
- **Field Data:** Farmer feedback and success stories
- **Soil Health Cards:** Government soil testing data

---

## ⚠️ Important Notes

1. **Data Quality:** All values validated against agricultural standards
2. **Regional Specificity:** Focused on Andhra Pradesh conditions
3. **Regular Updates:** Datasets should be updated annually
4. **Model Retraining:** Retrain ML models when adding significant data
5. **Version Control:** Track dataset versions in git

---

## 🎯 Best Practices

### For Developers
- Always validate input data against expected ranges
- Handle missing values appropriately
- Use stratified sampling for imbalanced classes
- Implement cross-validation for model evaluation

### For Data Scientists
- Perform exploratory data analysis before modeling
- Check for correlations between features
- Monitor model drift over time
- Document feature engineering decisions

### For Agronomists
- Verify crop requirements match local conditions
- Update based on new research findings
- Consider climate change impacts
- Incorporate farmer traditional knowledge

---

## 📞 Support

For questions about datasets:
- Check backend documentation in `/docs/api/`
- Review ML implementation in `backend/python-ml-service/`
- Contact: Soil2Crop Data Team

---

**Last Updated:** March 24, 2026  
**Version:** 1.0.0  
**Maintained By:** Soil2Crop ML Team
