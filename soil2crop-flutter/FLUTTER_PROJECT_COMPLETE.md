# Soil2Crop Flutter - Complete Project Structure

## Project Overview
A trust-first, risk-aware agricultural decision-support system built with Flutter and Firebase.

## Folder Structure
```
soil2crop-flutter/
├── android/                    # Android-specific configuration
├── ios/                        # iOS-specific configuration  
├── assets/
│   ├── images/                 # App images
│   ├── icons/                  # App icons
│   └── data/                   # Static data files
├── lib/
│   ├── models/                 # Data models
│   │   ├── user_model.dart
│   │   ├── soil_report_model.dart
│   │   ├── crop_model.dart
│   │   └── recommendation_model.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── firestore_service.dart
│   │   ├── weather_service.dart
│   │   └── recommendation_engine.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── soil_provider.dart
│   │   └── recommendation_provider.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── soil_input_screen.dart
│   │   ├── recommendation_screen.dart
│   │   ├── tutorial_screen.dart
│   │   └── feedback_screen.dart
│   ├── widgets/
│   │   ├── risk_badge.dart
│   │   ├── confidence_indicator.dart
│   │   ├── crop_comparison_card.dart
│   │   └── disclaimer_widget.dart
│   ├── utils/
│   │   ├── constants.dart
│   │   ├── validators.dart
│   │   └── helpers.dart
│   └── main.dart
├── test/
├── pubspec.yaml
└── README.md
```

## Firestore Schema

### Collection: users
```
documentId: {userId}
fields:
  - userId: string
  - mobile: string
  - district: string
  - language: string (en/hi/te/ta/kn/ml)
  - createdAt: timestamp
```

### Collection: soilReports
```
documentId: auto-generated
fields:
  - reportId: string
  - userId: string (reference)
  - nitrogen: number
  - phosphorus: number
  - potassium: number
  - ph: number
  - reportDate: timestamp
  - confidenceScore: number (0-100)
  - createdAt: timestamp
```

### Collection: crops
```
documentId: {cropId}
fields:
  - cropId: string
  - cropName: string
  - minN: number
  - maxN: number
  - minP: number
  - maxP: number
  - minK: number
  - maxK: number
  - minPH: number
  - maxPH: number
  - waterRequirement: string (Low/Medium/High)
  - rainDependency: boolean
  - marketVolatility: string (Low/Medium/High)
  - averageYield: number
```

### Collection: feedback
```
documentId: auto-generated
fields:
  - feedbackId: string
  - userId: string (reference)
  - soilType: string
  - cropChosen: string
  - approximateYield: number
  - satisfactionLevel: number (1-5)
  - createdAt: timestamp
```

### Collection: tutorialVideos
```
documentId: auto-generated
fields:
  - videoId: string
  - title: string
  - language: string
  - youtubeUrl: string
  - order: number
```

## Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Soil reports - user can only access their own
    match /soilReports/{reportId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Crops - public read-only
    match /crops/{cropId} {
      allow read: if true;
      allow write: if false; // Only admin via console
    }
    
    // Feedback - authenticated users can create
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Tutorial videos - public read-only
    match /tutorialVideos/{videoId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Recommendation Engine Logic

### Soil Match Calculation
```dart
// For each crop parameter range, check soil values
// Start with 100%, deduct for each mismatch
// If 3+ critical mismatches, crop is incompatible (0%)
```

### Weather Compatibility
```dart
// Drought risk + High water requirement = -40%
// Excess rain + Rain dependent = -30%
// Temperature > 40°C = -20%
```

### Final Score Formula
```
Final Score = (Soil Match % × 0.5) + (Weather Compatibility × 0.3) + (Market Stability × 0.2)
```

### Risk Levels
- **Low**: Green badge, score >= 80%
- **Medium**: Yellow badge, score 60-79%
- **High**: Red badge, score < 60%

## Confidence Score System

Starting: 100%

Deductions:
- Report older than 2 years: -30%
- Missing N/P/K/pH value: -10% each
- Extreme/unrealistic value: -10%

Labels:
- High (80-100%): Green
- Medium (50-79%): Yellow  
- Low (<50%): Red + Warning message

## Pattern-Based Learning

Frequency analysis of feedback:
- Group by district + soil type
- Count crop choices
- If >40% chose same crop, show insight
- Example: "In your district, 62% of farmers with similar soil chose Rice"

## Deployment Steps

1. **Firebase Setup**
   ```bash
   flutterfire configure
   ```

2. **Install Dependencies**
   ```bash
   flutter pub get
   ```

3. **Seed Crop Database**
   - Run Firebase console
   - Import crops collection from crop_database.json

4. **Add Tutorial Videos**
   - Upload unlisted YouTube videos
   - Add URLs to Firestore tutorialVideos collection

5. **Configure OpenWeather API**
   - Get API key from openweathermap.org
   - Add to app configuration

6. **Build & Deploy**
   ```bash
   flutter build apk --release
   flutter build ios --release
   ```

## Testing Checklist

- [ ] Login with mobile + district + language
- [ ] Soil input with validation
- [ ] Confidence score calculation
- [ ] Weather API integration
- [ ] Recommendation generation (top 3)
- [ ] Risk badges display correctly
- [ ] Explanation text is clear
- [ ] Tutorial videos play
- [ ] Feedback submission works
- [ ] Pattern learning shows insights
- [ ] Disclaimer visible on all screens
- [ ] App works offline (cached data)
- [ ] Large fonts readable
- [ ] Color coding consistent (Green/Yellow/Red)

## Key Design Principles

1. **Trust First**: Always show confidence and risk
2. **Farmer Control**: Never decide, only advise
3. **Transparency**: Explain every recommendation
4. **Safety**: Show disclaimer prominently
5. **Simplicity**: Max 3 crops, minimal text
6. **Accessibility**: Large fonts, clear colors

## API Keys Required

1. **Firebase**: Auto-configured via google-services.json
2. **OpenWeather**: Add to `lib/services/weather_service.dart`

## Sample YouTube Videos to Create

1. "Welcome to Soil2Crop - How This App Helps Farmers"
2. "How to Enter Your Soil Test Values"
3. "Understanding Your Crop Recommendations"
4. "Important: Always Consult Local Experts"

---

## Next Steps for Developer

1. Complete the remaining service files (auth_service.dart, weather_service.dart)
2. Build all screen widgets
3. Create Firebase project and configure
4. Seed initial crop data
5. Test on physical devices
6. Deploy to Play Store/App Store
