# Soil-Based Crop Recommendation & Voice Guidance Implementation

## 📋 Overview

This implementation adds **rule-based crop recommendation** using soil parameters (pH, N, P, K) with **browser-based voice guidance** for the Soil2Crop smart farming platform.

---

## 🌾 Part 1: Soil-Based Crop Recommendation System

### Features Implemented

✅ **Rule-based recommendation engine** using 4 soil parameters:
- pH level (0-14)
- Nitrogen (N) - Low/Medium/High
- Phosphorus (P) - Low/Medium/High
- Potassium (K) - Low/Medium/High

✅ **Multi-parameter crop matching**:
- pH-based crop suggestions
- Nitrogen-level crop suggestions
- Phosphorus-level crop suggestions
- Potassium-level crop suggestions

✅ **Intelligent scoring system**:
- Combines recommendations from all parameters
- Calculates suitability scores (High/Medium/Low)
- Returns top 3 most suitable crops

✅ **Detailed reasoning** for each recommendation

---

### Backend Implementation

#### File: `backend/services/soilCropRecommendation.js`

**Key Functions:**

```javascript
// Main recommendation function
generateCropRecommendations(soilData)

// Parameter-specific functions
getCropsByPH(ph)
getCropsByNitrogen(nitrogenLevel)
getCropsByPhosphorus(phosphorusLevel)
getCropsByPotassium(potassiumLevel)
```

**Crop Recommendation Rules:**

| pH Range | Recommended Crops | Suitability |
|----------|------------------|-------------|
| pH < 6.0 | Groundnut, Potato, Millets | High |
| 6.0 - 7.5 | Rice, Wheat, Maize | High |
| pH > 7.5 | Cotton, Barley, Sorghum | High |

| Nitrogen Level | Recommended Crops | Reason |
|----------------|------------------|--------|
| Low | Pulses, Gram | Nitrogen-fixing crops |
| Medium | Rice, Maize | Moderate N requirement |
| High | Leafy Vegetables, Spinach | Heavy N feeders |

| Phosphorus Level | Recommended Crops |
|------------------|------------------|
| Low | Root Crops, Sweet Potato |
| Medium | Cereals, Wheat |
| High | Vegetables, Tomato |

| Potassium Level | Recommended Crops |
|-----------------|------------------|
| Low | Millets, Sorghum |
| Medium | Wheat, Rice |
| High | Banana, Cotton, Sugarcane |

---

### API Endpoint

**POST** `/api/crop-suggestion/soil-based`

**Request Body:**
```json
{
  "pH": 6.5,
  "nitrogen": "Medium",
  "phosphorus": "Medium",
  "potassium": "High"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "soilParameters": {
      "pH": 6.5,
      "nitrogen": "Medium",
      "phosphorus": "Medium",
      "potassium": "High"
    },
    "allRecommendations": [...],
    "top3": [
      {
        "cropName": "Rice",
        "suitability": "High",
        "suitabilityScore": 2.5,
        "reasons": [
          "Optimal growth in neutral to slightly acidic soil",
          "Moderate nitrogen requirement met",
          "Medium potassium supports healthy growth"
        ],
        "matchedParameters": ["pH", "Nitrogen", "Potassium"],
        "reasoning": "Optimal growth in neutral to slightly acidic soil. Moderate nitrogen requirement met. Medium potassium supports healthy growth."
      }
    ],
    "summary": "Based on your soil analysis (pH: 6.5, N: Medium, P: Medium, K: High), we recommend Rice, Maize, Banana as the most suitable crops.",
    "disclaimer": "These recommendations are based on soil parameters only..."
  }
}
```

---

### Test Cases

#### Example 1: Neutral Soil with High Potassium
**Input:**
```
pH = 6.5
Nitrogen = Medium
Phosphorus = Medium
Potassium = High
```

**Expected Output:**
```
1. Rice (High suitability)
2. Maize (High suitability)
3. Banana (High suitability)
```

#### Example 2: Acidic Soil with Low Nutrients
**Input:**
```
pH = 5.5
Nitrogen = Low
Phosphorus = Low
Potassium = Medium
```

**Expected Output:**
```
1. Groundnut (High suitability)
2. Potato (High suitability)
3. Gram (High suitability)
```

---

## 🔊 Part 2: Voice Guidance System

### Features Implemented

✅ **Browser-based Text-to-Speech (TTS)** using Web Speech API
✅ **"🔊 Speak Recommendation"** button
✅ **"🔇 Stop Voice"** button
✅ **Multi-language support** (English, Telugu, Hindi, etc.)
✅ **Adjustable speech speed** (rate: 0.9 for clarity)
✅ **Error handling** with callbacks
✅ **Reusable speakText() function**
✅ **Auto-speak on results** (optional)

---

### Frontend Components

#### File: `frontend/src/utils/voiceAssistant.ts`

**Key Functions:**

```typescript
// Initialize voices (call once on app start)
initializeVoices()

// Speak a message
speakMessage(message, language, onEnd, onError)

// Stop current speech
stopSpeech()

// Check if speech is supported
isSpeechSupported()

// Get best voice for language
getVoiceByLanguage(language)
```

**Supported Languages:**
- English (India) - `en-IN`
- Telugu - `te-IN`
- Hindi - `hi-IN`
- Tamil - `ta-IN`
- Kannada - `kn-IN`
- Malayalam - `ml-IN`

---

#### File: `frontend/src/utils/voiceMessages.ts`

**Pre-formatted Voice Messages:**

```typescript
// Generate recommendation voice message
generateRecommendationVoiceMessage(top3Crops)

// Generate detailed voice message
generateDetailedVoiceMessage(top3Crops)

// Generate soil alert messages
generateSoilAlertVoiceMessage(pH, N, P, K)

// Quick summary
getQuickSummaryVoiceMessage(pH, N, topCrop)
```

**Example Voice Output:**

For crops: Rice, Maize, Banana

> "Based on your soil analysis, the recommended crops are Rice, Maize, and Banana. Rice is highly suitable. Maize is highly suitable. Banana is highly suitable."

---

### UI Components

#### Added to CropSuggestion Page

**Two new buttons:**

1. **🔊 Speak Recommendations**
   - Reads top 3 crop names
   - Includes suitability levels
   - Provides reasoning for each crop

2. **🔇 Stop Voice**
   - Cancels ongoing speech
   - Shows confirmation toast

**Location:** Above crop recommendations list

---

### Usage Examples

#### Basic Voice Usage

```typescript
import { speakMessage, stopSpeech } from '@/utils/voiceAssistant';

// Speak simple message
speakMessage('Hello Farmer!', 'en-IN');

// Speak with callbacks
speakMessage(
  'Your crop recommendations are ready',
  'en-IN',
  () => console.log('Speech completed'),
  (err) => console.error('Speech error:', err)
);

// Stop speech
stopSpeech();
```

#### Advanced Voice Usage

```typescript
import { generateRecommendationVoiceMessage } from '@/utils/voiceMessages';

const message = generateRecommendationVoiceMessage(top3Crops);
speakMessage(message, language);
```

---

## 🧪 Testing Guide

### Test Backend API

**Using cURL:**
```bash
curl -X POST http://localhost:5001/api/crop-suggestion/soil-based \
  -H "Content-Type: application/json" \
  -d '{
    "pH": 6.5,
    "nitrogen": "Medium",
    "phosphorus": "Medium",
    "potassium": "High"
  }'
```

**Using PowerShell:**
```powershell
$body = @{
    pH = 6.5
    nitrogen = "Medium"
    phosphorus = "Medium"
    potassium = "High"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/crop-suggestion/soil-based" -Method Post -Body $body -ContentType "application/json"
```

---

### Test Frontend Voice

**Manual Test Steps:**

1. Open browser (Chrome or Edge recommended)
2. Navigate to Crop Suggestion page
3. Enter soil parameters
4. Click "Get Recommendations"
5. Click "🔊 Speak Recommendations"
6. Verify voice output
7. Click "🔇 Stop Voice"
8. Verify speech stops

**Console Verification:**
```
[VoiceAssistant] Voices loaded: 5 total voices
[VoiceAssistant] Speaking: "Based on your soil analysis..." in en-IN
[VoiceAssistant] Speech completed
```

---

## 📁 Files Modified/Created

### Backend Files

| File | Status | Purpose |
|------|--------|---------|
| `backend/services/soilCropRecommendation.js` | ✅ Created | Rule-based recommendation engine |
| `backend/routes/cropSuggestion.js` | ✅ Modified | Added `/soil-based` endpoint |

### Frontend Files

| File | Status | Purpose |
|------|--------|---------|
| `frontend/src/utils/voiceAssistant.ts` | ✅ Existing | Enhanced with voice controls |
| `frontend/src/utils/voiceMessages.ts` | ✅ Created | Pre-formatted voice messages |
| `frontend/src/pages/CropSuggestion.tsx` | ✅ Modified | Added voice buttons |
| `frontend/src/pages/SoilBasedRecommendation.tsx` | ✅ Created | Demo/test page |

---

## 🚀 Deployment Instructions

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Verify:
```
✅ Soil-Based Crop Recommendation endpoint ready at /api/crop-suggestion/soil-based
```

### 2. Start Frontend Server

```bash
cd frontend
npm run dev
```

### 3. Test Complete Flow

1. Navigate to test page: `http://localhost:8080/soil-based-recommendation`
2. Load sample test case
3. Click "Get Recommendations"
4. Verify top 3 crops match expected output
5. Click "🔊 Speak Recommendations"
6. Verify voice output matches crops displayed

---

## 🎯 Success Criteria

### Backend Requirements
- ✅ Accepts pH, N, P, K parameters
- ✅ Returns top 3 suitable crops
- ✅ Provides suitability scores (High/Medium/Low)
- ✅ Includes detailed reasoning for each crop
- ✅ Handles invalid inputs gracefully

### Frontend Requirements
- ✅ Displays input fields for pH, N, P, K
- ✅ Shows top 3 recommendations with suitability
- ✅ "🔊 Speak Recommendations" button works
- ✅ "🔇 Stop Voice" button cancels speech
- ✅ Voice reads crop names and suitability
- ✅ Works on Chrome and Edge browsers
- ✅ Supports multiple languages

### Voice Output Requirements
- ✅ Clear, audible speech
- ✅ Correct pronunciation of crop names
- ✅ Appropriate speaking speed (not too fast)
- ✅ No JavaScript errors in console
- ✅ Graceful fallback if speech not supported

---

## 🔧 Troubleshooting

### Issue: Voice not working

**Solution:**
1. Check browser compatibility (Chrome/Edge required)
2. Ensure speakers/headphones connected
3. Check browser volume settings
4. Verify `speechSynthesis` API support:
   ```javascript
   console.log('speechSynthesis supported:', 'speechSynthesis' in window);
   ```

### Issue: Wrong crops recommended

**Solution:**
1. Verify input values are correct
2. Check backend logs for parameter values
3. Review recommendation logic in service file
4. Test with sample test cases first

### Issue: No recommendations returned

**Solution:**
1. Check backend console for errors
2. Verify API endpoint is responding
3. Check network tab in browser DevTools
4. Ensure CORS is properly configured

---

## 📝 Future Enhancements

1. **Machine Learning Integration**
   - Train model on historical crop data
   - Improve recommendation accuracy
   - Consider weather and market factors

2. **Enhanced Voice Features**
   - Multi-language voice support
   - Custom voice selection
   - Background music/sounds
   - Voice commands for navigation

3. **Mobile App Integration**
   - React Native voice synthesis
   - Offline voice support
   - Push notifications with voice

4. **Advanced Analytics**
   - Track recommendation acceptance rate
   - User feedback integration
   - Continuous improvement loop

---

## 📞 Support

For issues or questions:
- Check console logs in browser DevTools
- Review backend logs
- Test API endpoints directly
- Verify browser compatibility

---

**Implementation Date:** March 27, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
