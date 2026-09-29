# Quick Reference Card - Soil-Based Recommendations & Voice Guidance

## 🌾 SOIL PARAMETER RULES

### pH Levels
```
pH < 6.0   → Groundnut, Potato, Millets (Acidic)
pH 6-7.5   → Rice, Wheat, Maize (Neutral)
pH > 7.5   → Cotton, Barley, Sorghum (Alkaline)
```

### Nitrogen Levels
```
Low    → Pulses, Gram (Nitrogen-fixing)
Medium → Rice, Maize (Moderate feeders)
High   → Leafy Vegetables, Spinach (Heavy feeders)
```

### Phosphorus Levels
```
Low    → Root Crops, Sweet Potato
Medium → Cereals, Wheat
High   → Vegetables, Tomato
```

### Potassium Levels
```
Low    → Millets, Sorghum
Medium → Wheat, Rice
High   → Banana, Cotton, Sugarcane
```

---

## 🧪 SAMPLE TEST CASES

### Test Case 1
**Input:**
- pH = 6.5
- N = Medium
- P = Medium  
- K = High

**Expected Output:**
1. Rice (High suitability)
2. Maize (High suitability)
3. Banana (High suitability)

### Test Case 2
**Input:**
- pH = 5.5
- N = Low
- P = Low
- K = Medium

**Expected Output:**
1. Groundnut (High suitability)
2. Potato (High suitability)
3. Gram (High suitability)

---

## 🔊 VOICE GUIDANCE

### Speak This Message
```javascript
"Based on your soil analysis, the recommended crops are Rice, Maize, and Banana."
```

### Voice Buttons
- **🔊 Speak Recommendations** - Reads crop names with suitability
- **🔇 Stop Voice** - Cancels ongoing speech

### Supported Languages
- English (en-IN)
- Telugu (te-IN)
- Hindi (hi-IN)
- Tamil (ta-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)

---

## 📡 API ENDPOINTS

### Get Soil-Based Recommendations
```
POST /api/crop-suggestion/soil-based
```

**Request Body:**
```json
{
  "pH": 6.5,
  "nitrogen": "Medium",
  "phosphorus": "Medium",
  "potassium": "High"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "top3": [
      {
        "cropName": "Rice",
        "suitability": "High",
        "reasons": ["Reason 1", "Reason 2"],
        "reasoning": "Combined reasoning..."
      }
    ],
    "summary": "Based on your soil analysis..."
  }
}
```

---

## 💻 QUICK START CODE

### Backend Service
```javascript
const soilRecommendationService = require('../services/soilCropRecommendation');

const recommendations = soilRecommendationService.generateCropRecommendations({
  pH: 6.5,
  nitrogen: 'Medium',
  phosphorus: 'Medium',
  potassium: 'High'
});

console.log(recommendations.data.top3);
```

### Frontend Voice
```typescript
import { speakMessage, stopSpeech } from '@/utils/voiceAssistant';

// Speak recommendation
speakMessage('Recommended crops: Rice, Maize, Banana', 'en-IN');

// Stop voice
stopSpeech();
```

---

## ✅ VERIFICATION CHECKLIST

### Backend
- [ ] Service file created
- [ ] Route endpoint added
- [ ] Validation working
- [ ] Returns top 3 crops
- [ ] Provides suitability scores
- [ ] Includes reasoning

### Frontend
- [ ] Input form created
- [ ] Results display correctly
- [ ] Voice buttons visible
- [ ] Speak button works
- [ ] Stop button works
- [ ] No console errors

### Voice
- [ ] Browser supports speech
- [ ] Voices loaded
- [ ] Message clear
- [ ] Speed appropriate
- [ ] Stops when requested

---

## 🐛 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| No voice | Check browser compatibility (Chrome/Edge) |
| Wrong crops | Verify input parameters |
| API error | Check backend logs |
| Voice too fast | Adjust rate parameter (default: 0.9) |
| No recommendations | Check parameter values are valid |

---

## 📁 KEY FILES

### Backend
- `services/soilCropRecommendation.js` - Recommendation engine
- `routes/cropSuggestion.js` - API endpoint

### Frontend
- `utils/voiceAssistant.ts` - Voice controls
- `utils/voiceMessages.ts` - Voice messages
- `pages/CropSuggestion.tsx` - Main page with voice
- `pages/SoilBasedRecommendation.tsx` - Test/demo page

---

**Quick Start Command:**
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Test API
curl -X POST http://localhost:5001/api/crop-suggestion/soil-based \
  -H "Content-Type: application/json" \
  -d '{"pH":6.5,"nitrogen":"Medium","phosphorus":"Medium","potassium":"High"}'
```

---

**Status:** ✅ Complete  
**Date:** March 27, 2026
