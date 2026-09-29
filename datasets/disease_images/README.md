# 🌿 Plant Disease Detection Dataset

## Overview

This folder contains images and annotations for training the plant disease detection models.

---

## 📁 Current Status

**Dataset Status:** ⚠️ PLACEHOLDER - Ready for image collection

**Expected Structure:**
```
disease_images/
├── rice/
│   ├── blast/
│   │   ├── image_001.jpg
│   │   ├── image_002.jpg
│   │   └── ...
│   ├── brown_spot/
│   └── healthy/
├── wheat/
│   ├── rust/
│   ├── smut/
│   └── healthy/
├── cotton/
│   ├── leaf_curl/
│   ├── boll_rot/
│   └── healthy/
└── metadata.csv
```

---

## 🎯 Target Diseases to Collect

### Rice Diseases
- **Rice Blast** (Magnaporthe oryzae)
  - Symptoms: Diamond-shaped lesions on leaves
  - Collection regions: Guntur, East Godavari, West Godavari
  
- **Brown Spot** (Bipolaris oryzae)
  - Symptoms: Circular brown spots with yellow halo
  - Collection regions: All rice-growing areas

- **Healthy Rice Leaves**
  - Control group for classification

### Wheat Diseases
- **Wheat Rust** (Puccinia species)
  - Types: Yellow rust, Brown rust, Black rust
  - Symptoms: Orange/brown pustules on leaves

- **Wheat Smut**
  - Symptoms: Black powdery spores in grain heads

- **Healthy Wheat Leaves**

### Cotton Diseases
- **Cotton Leaf Curl Virus**
  - Symptoms: Leaf curling, thickening of veins
  - Vector: Whitefly transmitted

- **Boll Rot**
  - Symptoms: Rotting of cotton bolls
  - Causes: Fungal infection in high humidity

- **Healthy Cotton Leaves**

---

## 📸 Image Collection Guidelines

### Photography Standards
1. **Resolution:** Minimum 640x480 pixels, preferably 1280x720 or higher
2. **Lighting:** Natural daylight, avoid harsh shadows
3. **Focus:** Clear focus on affected area
4. **Background:** Plain background when possible
5. **Distance:** Multiple distances (close-up, medium, full plant)
6. **Angle:** Top view, side view, underside of leaves

### Metadata Requirements
For each image, record:
- **Date:** YYYY-MM-DD
- **Location:** GPS coordinates or village/district name
- **Crop Stage:** Vegetative/Flowering/Fruiting/Mature
- **Severity:** Mild/Moderate/Severe
- **Weather:** Temperature, humidity, recent rainfall
- **Farmer ID:** Anonymous identifier
- **Expert Verification:** Verified by agricultural expert (Y/N)

### Ethical Considerations
- Obtain farmer consent before photographing fields
- Respect privacy and property rights
- Acknowledge contributing farmers in documentation
- Share benefits with farming communities

---

## 🏷️ Annotation Format

### Bounding Box Annotations (YOLO format)
```
<class_id> <x_center> <y_center> <width> <height>
```

Example `labels.txt`:
```
0 0.45 0.62 0.15 0.20  # Rice Blast lesion
0 0.52 0.58 0.12 0.18  # Another Rice Blast lesion
```

### Class IDs
```
0 - Rice Blast
1 - Rice Brown Spot
2 - Wheat Rust
3 - Wheat Smut
4 - Cotton Leaf Curl
5 - Cotton Boll Rot
99 - Healthy
```

---

## 📊 Dataset Split Recommendations

### Training/Validation/Test Split
- **Training Set:** 70% of images
- **Validation Set:** 15% of images
- **Test Set:** 15% of images

### Per Class Minimum Images
- **Healthy:** 500+ images per crop
- **Each Disease:** 300+ images minimum
- **Total Dataset:** 5,000+ images recommended

### Data Augmentation
Apply these transformations to increase dataset size:
- Rotation (±30 degrees)
- Horizontal/vertical flipping
- Brightness adjustment (±20%)
- Contrast adjustment (±20%)
- Zoom (0.8x to 1.2x)
- Shear transformation

---

## 🔬 Model Architecture Options

### Option 1: CNN Classifier
```python
# Simple CNN for disease classification
Input -> Conv2D -> MaxPool -> Conv2D -> MaxPool -> 
         Dense -> Dropout -> Output (Softmax)
```

### Option 2: Transfer Learning
Use pre-trained models:
- **MobileNetV2** - Good for mobile deployment
- **EfficientNet** - State-of-the-art accuracy
- **ResNet50** - Robust feature extraction

### Option 3: Object Detection
For detecting multiple diseases in one image:
- **YOLOv5** - Fast, real-time detection
- **Faster R-CNN** - High accuracy
- **SSD** - Balance of speed and accuracy

---

## 🛠️ Tools for Dataset Creation

### Image Capture
- Smartphone cameras (minimum 8MP)
- Digital SLR cameras for higher quality
- Drone imagery for large-scale monitoring

### Annotation Tools
- **LabelImg** - Desktop annotation tool
- **CVAT** - Web-based annotation
- **Roboflow** - Cloud-based platform
- **MakeSense.ai** - Free online tool

### Processing Libraries (Python)
```python
import cv2
import PIL
import tensorflow as tf
from torchvision import transforms
```

---

## 📈 Quality Control Checklist

Before adding images to dataset:
- [ ] Image is clear and in focus
- [ ] Affected area is visible
- [ ] Metadata is complete
- [ ] File name follows convention
- [ ] No copyright/privacy issues
- [ ] Expert verification obtained
- [ ] Balanced representation across classes

---

## 🤝 Collaboration Opportunities

### Partner Organizations
- **Agricultural Universities:** For expert verification
- **KVKs (Krishi Vigyan Kendras):** For field collection
- **State Agriculture Departments:** For funding and support
- **NGOs:** For community engagement
- **Research Institutions:** For advanced analysis

### Citizen Science
- Engage farmers through mobile app
- Allow users to submit disease photos
- Provide instant diagnosis and treatment advice
- Build crowdsourced disease surveillance network

---

## 📞 Contact for Contributions

If you want to contribute disease images or collaborate:
- Email: data@soil2crop.org
- GitHub: Create issue with dataset details
- Documentation: See `/docs/implementation/ML_*.md`

---

## 📚 References

1. **PlantVillage Dataset:** https://www.plantvillage.psu.edu/
2. **IPM Images:** https://www.ipmimages.org/
3. **CABI Crop Protection Compendium**
4. **ICAR - Indian Council of Agricultural Research**

---

## 🔄 Next Steps

### Immediate Actions
1. ✅ Create folder structure
2. ✅ Define annotation format
3. ✅ Establish collection protocols
4. ⏳ Begin field collection (planned)
5. ⏳ Annotate collected images
6. ⏳ Train initial models
7. ⏳ Validate with agricultural experts

### Long-term Goals
- Build dataset of 10,000+ images
- Cover all major crops in Andhra Pradesh
- Develop mobile app for real-time detection
- Create early warning system for disease outbreaks
- Publish research papers on findings

---

**Last Updated:** March 24, 2026  
**Status:** Ready for data collection  
**Version:** 1.0.0  
**Maintained By:** Soil2Crop ML Team
