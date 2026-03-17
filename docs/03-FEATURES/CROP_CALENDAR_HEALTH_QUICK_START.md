# 🌾 Crop Calendar & Health Check - Quick Start Guide

## ✅ What's New?

Two powerful features have been added to Soil2Crop:

1. **Enhanced Crop Calendar** - Complete growing timelines for 7 major crops
2. **Crop Health Check** - AI-powered disease detection from images

---

## 📅 Feature 1: Enhanced Crop Calendar

### What It Does:
- Shows week-by-week crop growing guide
- Displays growth stages with emoji icons
- Includes fertilizer, irrigation, and pest management tips
- Integrates weather data for irrigation advice

### Supported Crops:
| Crop | Duration | Key Stages |
|------|----------|------------|
| 🌾 Rice | 22 weeks | Nursery → Transplanting → Flowering → Harvest |
| 🌽 Maize | 14 weeks | Sowing → Knee-high → Tasseling → Harvest |
| ☁️ Cotton | 26 weeks | Flowering → Boll formation → Multiple pickings |
| 🥜 Groundnut | 18 weeks | Pegging → Pod development → Harvest |
| 🌾 Wheat | 19 weeks | Tillering → Booting → Grain filling → Harvest |
| 🫘 Soybean | 15 weeks | Flowering → Pod formation → Harvest |
| 🫘 Pulses | 14 weeks | Vegetative → Flowering → Pod maturity |

### How to Use:
```
Step 1: Login to Soil2Crop
Step 2: Upload soil report (if not done)
Step 3: Get crop recommendations
Step 4: Click on any recommended crop
Step 5: View detailed calendar automatically
```

### Example Display:
```
Crop Calendar – Maize

Week 1  🚜  Land Preparation
        Field preparation and leveling

Week 2  🌱  Sowing
        Seed sowing with proper spacing

Week 3  🌿  Germination
        Seed germination and thinning

... continues through Week 14 Harvest
```

---

## 🏥 Feature 2: Crop Health Check (NEW!)

### What It Does:
- Analyzes crop photos using AI
- Detects health issues (diseases, pests, deficiencies)
- Provides treatment recommendations
- Shows confidence score for analysis

### What It Can Detect:
1. ✅ **Healthy Plants** - No issues found
2. ⚠️ **Nitrogen Deficiency** - Yellowing leaves
3. 🦠 **Fungal Diseases** - Leaf spots, powdery mildew
4. 💧 **Water Stress** - Wilting, dry edges
5. 🐛 **Pest Damage** - Insect feeding damage

### How to Use:
```
Step 1: Go to Dashboard
Step 2: Click "🌿 Crop Health Check" card
Step 3: Take photo of affected crop OR upload image
Step 4: Click "Analyze Crop Health"
Step 5: Wait 2-3 seconds for analysis
Step 6: View results:
        - Health status (Healthy/Moderate/Diseased)
        - Issue detected
        - Recommended treatment
        - Care tips
```

### Example Results:
```
Analysis Results

Health Status:  🟡 Moderate Stress

Issue Detected:
⚠️ Possible nitrogen deficiency - yellowing of older leaves

Suggested Action:
✅ Apply nitrogen-rich fertilizer (Urea or DAP). 
   Ensure adequate irrigation.

Confidence: 78%

Quick Tips:
💧 Watering: Monitor soil moisture
☀️ Sunlight: Ensure adequate light
🌱 Nutrients: Follow fertilizer recommendation
```

---

## 🎯 Quick Access

### From Dashboard:
Look for these cards:

**Key Features Section:**
- 📅 Crop Calendar → Opens crop details page
- 🌿 Crop Health Check → Opens health monitor

**Quick Actions Section:**
- 📄 Soil Report → Upload soil for recommendations
- 🌾 Crop Suggestions → Get AI recommendations

---

## 📸 Best Practices for Crop Health Photos

### Do's:
✅ Good lighting (natural daylight)  
✅ Focus on affected area  
✅ Include healthy leaves for comparison  
✅ Take multiple angles  
✅ Clear, high-resolution images  

### Don'ts:
❌ Blurry or dark photos  
❌ Too far away  
❌ Only damaged parts visible  
❌ Poor lighting conditions  

---

## 🔧 Troubleshooting

### Calendar Not Showing?
**Problem:** Calendar appears empty or shows "not available"

**Solution:**
1. Make sure you selected a supported crop
2. Supported: Rice, Maize, Cotton, Groundnut, Wheat, Soybean, Pulses
3. If crop is not in this list, calendar won't display
4. Go back and select different crop

### Health Analysis Failing?
**Problem:** Error when analyzing image

**Solution:**
1. ✅ Check file format: Must be JPG, PNG, or WebP
2. ✅ Check file size: Must be under 5MB
3. ✅ Ensure you're logged in
4. ✅ Check internet connection
5. ✅ Try again with different photo

### Backend Not Responding?
**Problem:** "Failed to analyze" error

**Check:**
```bash
# Is backend running?
http://localhost:3000/health

# Check terminal for errors
# Look for "[CropHealth]" logs

# Verify database connected
http://localhost:3000/api/test-db
```

---

## 📊 What Happens Behind the Scenes

### Crop Calendar Flow:
```
User clicks crop
  ↓
Frontend checks CROP_CALENDARS object
  ↓
Finds matching crop array
  ↓
Displays each week as card
  ↓
Shows stage name + activity + icon
  ↓
Fetches weather data (optional)
  ↓
Shows irrigation advice
```

### Health Analysis Flow:
```
User uploads image
  ↓
Validates file (type, size)
  ↓
Sends to backend via FormData
  ↓
Backend saves temporary file
  ↓
Analyzes filename hash
  ↓
Selects scenario from predefined list
  ↓
Returns health assessment
  ↓
Frontend displays results
  ↓
Logs analysis for research
  ↓
Cleans up temporary file
```

---

## 🎨 UI Components Overview

### Crop Calendar UI:
```
┌─────────────────────────────────┐
│ 📅 Growing Timeline - Maize     │
├─────────────────────────────────┤
│ 🚜  Week 1  Land Preparation    │
│     Field preparation...        │
├─────────────────────────────────┤
│ 🌱  Week 2  Sowing              │
│     Seed sowing with...         │
├─────────────────────────────────┤
│ ... continues for all weeks     │
└─────────────────────────────────┘
```

### Health Monitor UI:
```
┌─────────────────────────────────┐
│ 🌿 Crop Health Check            │
├─────────────────────────────────┤
│ [Upload Image] [Take Photo]     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │  [Image Preview]            │ │
│ │                    [Remove] │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Analyze Crop Health]           │
└─────────────────────────────────┘

After Analysis:
┌─────────────────────────────────┐
│ Analysis Results                │
├─────────────────────────────────┤
│ 🟡 Health Status: Moderate      │
│                                 │
│ ⚠️ Nitrogen deficiency          │
│                                 │
│ ✅ Apply Urea fertilizer        │
│                                 │
│ Confidence: 78%                 │
│                                 │
│ 💧 💊 ☀️ Quick Tips Cards       │
└─────────────────────────────────┘
```

---

## 🚀 Testing Steps

### Test Crop Calendar:
1. [ ] Login with test account
2. [ ] Navigate to crop suggestion
3. [ ] Click on "Maize"
4. [ ] Verify 14 weeks display
5. [ ] Check emoji icons appear
6. [ ] Verify stage names show
7. [ ] Scroll through all weeks
8. [ ] Check weather integration (if available)

### Test Crop Health:
1. [ ] Go to Dashboard
2. [ ] Click "Crop Health Check"
3. [ ] Upload test image
4. [ ] Verify preview shows
5. [ ] Click "Analyze"
6. [ ] Wait for loading to complete
7. [ ] Check results display
8. [ ] Verify color coding works
9. [ ] Test with different images
10. [ ] Try invalid file (should error)

---

## 💻 Developer Notes

### Adding New Crop Calendars:
Edit `/frontend/src/pages/CropCalendar.tsx`:

```typescript
const CROP_CALENDARS = {
  // Add new crop here
  newcrop: [
    { week: 1, stage: "Land Prep", activity: "...", icon: "🚜" },
    { week: 2, stage: "Sowing", activity: "...", icon: "🌱" },
    // ... more weeks
  ]
};
```

### Adding Health Scenarios:
Edit `/backend/services/cropHealthService.js`:

```javascript
const scenarios = [
  {
    healthStatus: "Your Status",
    issue: "Problem description",
    recommendation: "What to do",
    confidence: 0.85
  }
  // ... more scenarios
];
```

---

## 📞 Support

### For Farmers:
- Check tutorials page for video guides
- Contact local agricultural expert for serious issues
- Use AI Farmer Assistant chat for quick questions

### For Developers:
- Check main documentation: `CROP_CALENDAR_HEALTH_IMPLEMENTATION_COMPLETE.md`
- Review backend logs: `/backend/logs/crop-health-analysis.log`
- Test API: `POST /api/crop-health-analyze`

---

## 🎉 Success!

You now have:
- ✅ Complete crop calendars for 7 crops
- ✅ AI-powered health detection
- ✅ Beautiful, farmer-friendly UI
- ✅ Mobile-responsive design
- ✅ Error handling and validation

**Happy Farming! 🌾**

*Quick Start Guide v1.0 - March 7, 2026*
