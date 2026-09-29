# 🚀 Datasets Quick Start Guide

## 📁 What's in the Datasets Folder?

```
datasets/
├── crop_dataset.csv                      # 20 crops with NPK requirements
├── soil_analysis_training_data.csv       # 40 soil samples for ML training
├── iot_sensor_sample_data.csv            # 32 sensor readings
├── disease_images/                       # Plant disease images (placeholder)
│   └── README.md                         # Collection guidelines
├── README.md                             # Main documentation
└── DATASETS_POPULATION_SUMMARY.md        # Complete summary
```

---

## ⚡ Quick Commands

### Load Crop Data (Python)
```python
import pandas as pd

crops = pd.read_csv('datasets/crop_dataset.csv')
print(f"Loaded {len(crops)} crops")
print(crops[['crop_name', 'water_requirement', 'growing_period']])
```

### Train Recommendation Model (Python)
```python
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Load data
data = pd.read_csv('datasets/soil_analysis_training_data.csv')

# Prepare features
X = data[['nitrogen', 'phosphorus', 'potassium', 'ph']]
y = data['recommended_crop']

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Predict
prediction = model.predict([[120, 25, 140, 6.5]])
print(f"Recommended: {prediction[0]}")
```

### Load IoT Data (Python)
```python
import pandas as pd

sensor_data = pd.read_csv('datasets/iot_sensor_sample_data.csv')
print(sensor_data.groupby('sensor_id')['temperature_c'].mean())
```

### Use in Backend (Node.js)
```javascript
const fs = require('fs');
const csv = require('csv-parser');

const crops = [];
fs.createReadStream('datasets/crop_dataset.csv')
  .pipe(csv())
  .on('data', row => crops.push(row))
  .on('end', () => console.log(`Loaded ${crops.length} crops`));
```

---

## 🎯 Common Use Cases

### 1. Find Crops by Water Requirement
```python
import pandas as pd
crops = pd.read_csv('datasets/crop_dataset.csv')

# Low water crops
low_water = crops[crops['water_requirement'] == 'Low']
print(low_water[['crop_name', 'growing_period']])
```

### 2. Match Crop to Soil Conditions
```python
def find_suitable_crops(n, p, k, ph):
    crops = pd.read_csv('datasets/crop_dataset.csv')
    
    suitable = crops[
        (crops['nitrogen_min'] <= n) & (crops['nitrogen_max'] >= n) &
        (crops['ph_min'] <= ph) & (crops['ph_max'] >= ph)
    ]
    
    return suitable['crop_name'].tolist()

# Example
crops = find_suitable_crops(120, 25, 140, 6.5)
print(f"Suitable crops: {crops}")
```

### 3. Analyze IoT Sensor Trends
```python
import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv('datasets/iot_sensor_sample_data.csv')
data['timestamp'] = pd.to_datetime(data['timestamp'])

# Plot temperature over time
plt.figure(figsize=(12, 4))
for sensor in data['sensor_id'].unique():
    sensor_data = data[data['sensor_id'] == sensor]
    plt.plot(sensor_data['timestamp'], sensor_data['temperature_c'], label=sensor)

plt.xlabel('Time')
plt.ylabel('Temperature (°C)')
plt.legend()
plt.show()
```

---

## 📊 Dataset Quick Stats

| Dataset | Records | Features | Purpose |
|---------|---------|----------|---------|
| Crop Dataset | 20 crops | 16 columns | Master crop requirements |
| Training Data | 40 samples | 10 columns | ML model training |
| IoT Sensor Data | 32 readings | 11 columns | IoT testing & analytics |

---

## 🔧 Integration Examples

### Seed MongoDB Database
```bash
cd backend
node scripts/seedCrops.js
```

This loads all 20 crops into your database.

### Test API Endpoints
```bash
# Get sensor data
curl http://localhost:5000/api/iot/sensor-data/test123

# Post new sensor reading
curl -X POST http://localhost:5000/api/iot/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"farmer_id":"test123","temperature":28,"humidity":65,"soil_moisture":45}'
```

---

## 📝 File Formats

### CSV Files
- **Encoding:** UTF-8
- **Delimiter:** Comma (,)
- **Quotes:** Double quotes for text fields
- **Line endings:** Standard Unix (\n)

### Image Files (Future)
- **Format:** JPEG or PNG
- **Resolution:** Minimum 640x480
- **Naming:** `crop_disease_###.jpg`

---

## ✅ Quality Checks

Before using data:
- [ ] Check for missing values
- [ ] Validate ranges are realistic
- [ ] Verify categorical values match expected options
- [ ] Cross-reference with agricultural standards

---

## 🆘 Troubleshooting

### Issue: Can't load CSV file
**Solution:** Ensure you're in project root directory
```bash
cd c:\projects\soil2crop-app
python -c "import pandas as pd; print(pd.read_csv('datasets/crop_dataset.csv'))"
```

### Issue: Model gives poor predictions
**Solution:** Need more training data
- Current: 40 samples
- Recommended: 500+ samples
- Action: Collect field data from farmers

### Issue: No disease images
**Solution:** Dataset is placeholder - follow collection guide in `disease_images/README.md`

---

## 📞 Need Help?

- **Documentation:** See `datasets/README.md`
- **Examples:** Check code snippets above
- **ML Guide:** `docs/implementation/ML_*.md`
- **API Docs:** `docs/api/` (coming soon)

---

**Quick Reference v1.0** | Updated: March 24, 2026 | Status: ✅ Ready to Use
