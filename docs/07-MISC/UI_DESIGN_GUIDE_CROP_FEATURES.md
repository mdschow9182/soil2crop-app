# 🎨 Crop Calendar & Health Check - UI Visual Guide

## Feature 1: Enhanced Crop Calendar

### Screen 1: Crop Selection (From Crop Suggestion Page)
```
┌─────────────────────────────────────────────┐
│  Crop Suggestions                           │
├─────────────────────────────────────────────┤
│                                             │
│  Recommended Crops for Your Soil:           │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   🌽         │  │   ☁️         │        │
│  │   Maize      │  │   Cotton     │        │
│  │              │  │              │        │
│  │ Confidence:  │  │ Confidence:  │        │
│  │ 85%          │  │ 78%          │        │
│  │              │  │              │        │
│  │ [View Calendar]│  │ [View Calendar]│    │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │   🌾         │  │   🥜         │        │
│  │   Rice       │  │   Groundnut  │        │
│  │              │  │              │        │
│  │ Confidence:  │  │ Confidence:  │        │
│  │ 92%          │  │ 81%          │        │
│  │              │  │              │        │
│  │ [View Calendar]│  │ [View Calendar]│    │
│  └──────────────┘  └──────────────┘        │
│                                             │
└─────────────────────────────────────────────┘
```

### Screen 2: Crop Calendar Display (Maize Example)
```
┌─────────────────────────────────────────────┐
│ ← Back    Crop Calendar               🔊    │
├─────────────────────────────────────────────┤
│  🌽 Growing Timeline - Maize                │
│                                             │
│  Weather & Irrigation Insights              │
│  ┌─────────────────────────────────────┐   │
│  │ 💧 Current Forecast                  │   │
│  │ No significant rainfall expected     │   │
│  │                                      │   │
│  │ 📅 Critical Irrigation Weeks:        │   │
│  │ [Week 5] [Week 9] [Week 11]         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Week-by-Week Growing Guide                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🚜  Week 1  Land Preparation       │   │
│  │      Field preparation and leveling  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🌱  Week 2  Sowing                 │   │
│  │      Seed sowing with proper spacing │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🌿  Week 3  Germination            │   │
│  │      Seed germination and thinning   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🌱  Week 4  Early Growth           │   │
│  │      Initial vegetative growth       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  💊  Week 5  Fertilizer Application │   │
│  │      First top dressing with Urea    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ... continues through Week 14             │
│                                             │
│  ℹ️ This is a general timeline. Actual     │
│     duration may vary based on variety.    │
│                                             │
└─────────────────────────────────────────────┘
```

### Screen 3: Calendar Stages Detail View
```
┌─────────────────────────────────────────────┐
│  Key Growth Stages Explained                │
├─────────────────────────────────────────────┤
│                                             │
│  🚜 Land Preparation (Week 1)               │
│  - Deep plowing to break hardpan           │
│  - Harrowing to level field                 │
│  - Remove weeds and debris                  │
│                                             │
│  🌱 Sowing (Week 2)                         │
│  - Select quality seeds                     │
│  - Maintain proper spacing                  │
│  - Sow at 3-4 cm depth                      │
│                                             │
│  🌿 Germination (Week 3)                    │
│  - Seeds sprout in 5-7 days                 │
│  - Thin out weak seedlings                  │
│  - Ensure adequate moisture                 │
│                                             │
│  💊 Fertilizer (Week 5, 8, 12)              │
│  - Week 5: Urea (Nitrogen)                  │
│  - Week 8: NPK mix                          │
│  - Week 12: Final dose                      │
│                                             │
│  💧 Critical Irrigation                     │
│  - Week 9: Knee-high stage                  │
│  - Week 11: Pollination (MOST CRITICAL)     │
│  - Avoid water stress during tasseling      │
│                                             │
│  🌽 Harvest (Week 14)                       │
│  - Husks turn brown                         │
│  - Grains harden                            │
│  - Harvest at proper maturity               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Feature 2: Crop Health Check

### Screen 1: Upload Interface
```
┌─────────────────────────────────────────────┐
│ ← Back    Crop Health Check          🔊    │
├─────────────────────────────────────────────┤
│  AI-Powered Crop Health Analysis            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Upload Crop Image                   │   │
│  │                                      │   │
│  │  ┌────────────┐  ┌────────────┐     │   │
│  │  │  📷        │  │  📸        │     │   │
│  │  │  Upload    │  │  Camera    │     │   │
│  │  │  Image     │  │            │     │   │
│  │  └────────────┘  └────────────┘     │   │
│  │                                      │   │
│  │  ┌──────────────────────────────┐   │   │
│  │  │                              │   │   │
│  │  │      [Image Preview]         │   │   │
│  │  │                              │   │   │
│  │  │  🌿 Affected leaf shows      │   │   │
│  │  │     yellowing patterns       │   │   │
│  │  │                              │   │   │
│  │  │              [Remove] ✕      │   │   │
│  │  └──────────────────────────────┘   │   │
│  │                                      │   │
│  │  Tips for good photos:               │   │
│  │  ✅ Good lighting                    │   │
│  │  ✅ Focus on affected area           │   │
│  │  ✅ Clear, high resolution           │   │
│  │                                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  [  Analyze Crop Health  🌿 ]       │   │
│  │         (Loading spinner)            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  How it works:                              │
│  1. Take clear photo of affected plant     │
│  2. AI analyzes for common issues          │
│  3. Get instant diagnosis & advice         │
│                                             │
│  Note: This is advisory only. For serious  │
│  issues, consult agricultural expert.      │
│                                             │
└─────────────────────────────────────────────┘
```

### Screen 2: Analysis Results - Healthy Plant
```
┌─────────────────────────────────────────────┐
│  Analysis Results                           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🟢 Health Status: HEALTHY          │   │
│  │                                     │   │
│  │  ✅ No significant issues detected   │   │
│  │                                     │   │
│  │  Recommendation:                     │   │
│  │  Continue current farming practices. │   │
│  │  Monitor regularly for pests and     │   │
│  │  diseases. Maintain good drainage.   │   │
│  │                                     │   │
│  │  Analysis Confidence: 92%            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Quick Care Tips:                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  💧      │ │  ☀️      │ │  🌱      │   │
│  │  Water   │ │  Sun     │ │  Nutrient│   │
│  │          │ │          │ │          │   │
│  │  Monitor │ │  Ensure  │ │  Follow  │   │
│  │  soil    │ │  adequate│ │  schedule│   │
│  │  moisture│ │  light   │ │  strictly│   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  Next Steps:                                │
│  ✓ Continue regular monitoring             │
│  ✓ Maintain irrigation schedule            │
│  ✓ Apply preventive measures               │
│                                             │
└─────────────────────────────────────────────┘
```

### Screen 3: Analysis Results - Diseased Plant
```
┌─────────────────────────────────────────────┐
│  Analysis Results                           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🔴 Health Status: DISEASED         │   │
│  │                                     │   │
│  │  ⚠️ Fungal infection detected        │   │
│  │     Leaf spots visible               │   │
│  │                                     │   │
│  │  Suggested Action:                   │   │
│  │  Apply fungicide spray (Mancozeb    │   │
│  │  or Carbendazim). Remove affected   │   │
│  │  leaves. Improve air circulation.   │   │
│  │  Avoid overhead irrigation.         │   │
│  │                                     │   │
│  │  Analysis Confidence: 85%            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Immediate Actions Required:                │
│  ┌─────────────────────────────────────┐   │
│  │  1. Isolate affected plants          │   │
│  │  2. Remove infected leaves           │   │
│  │  3. Apply fungicide every 7 days     │   │
│  │  4. Improve drainage                 │   │
│  │  5. Reduce plant density             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Quick Care Tips:                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  💧      │ │  🌬️      │ │  ✂️      │   │
│  │  Water   │ │  Air     │ │  Prune   │   │
│  │          │ │          │ │          │   │
│  │  Avoid   │ │  Increase│ │  Remove  │   │
│  │  wetting │ │  spacing │ │  infected│   │
│  │  leaves  │ │  between │ │  parts   │   │
│  │          │ │  plants  │ │          │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  ⚠️ Consult expert if condition worsens    │
│                                             │
└─────────────────────────────────────────────┘
```

### Screen 4: Analysis Results - Nutrient Deficiency
```
┌─────────────────────────────────────────────┐
│  Analysis Results                           │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  🟡 Health Status: MODERATE STRESS  │   │
│  │                                     │   │
│  │  ⚠️ Possible nitrogen deficiency     │   │
│  │     Yellowing of older leaves        │   │
│  │                                     │   │
│  │  Recommendation:                     │   │
│  │  Apply nitrogen-rich fertilizer     │   │
│  │  (Urea or DAP). Ensure adequate     │   │
│  │  irrigation. Monitor leaf color     │   │
│  │  improvement over 7-10 days.        │   │
│  │                                     │   │
│  │  Analysis Confidence: 78%            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Treatment Plan:                            │
│  ┌─────────────────────────────────────┐   │
│  │  Day 1-2: Apply Urea (40kg/acre)     │   │
│  │  Day 3-5: Irrigate thoroughly        │   │
│  │  Day 7: Check for improvement        │   │
│  │  Day 14: Second dose if needed       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Prevention Tips:                           │
│  ✓ Test soil before planting               │
│  ✓ Use balanced fertilization              │
│  ✓ Rotate with legume crops                │
│  ✓ Add organic matter to soil              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Color Coding System

### Health Status Colors:
```
🟢 HEALTHY (Green #22c55e)
   - No action needed
   - Continue current practices

🟡 MODERATE STRESS (Yellow #eab308)
   - Attention required
   - Corrective action recommended

🔴 DISEASED/CRITICAL (Red #ef4444)
   - Immediate action needed
   - May require expert consultation
```

### Stage Icon Colors:
```
🚜 Land Prep     - Brown/Earth tones
🌱 Vegetative    - Light Green
🌾 Growth        - Green
🌸 Flowering     - Pink/Purple
💊 Fertilizer    - Blue
💧 Irrigation    - Blue/Water
🐛 Pests         - Orange/Red
✅ Harvest       - Gold/Yellow
```

---

## Responsive Design

### Mobile View (< 640px):
```
┌───────────────────┐
│ Header            │
├───────────────────┤
│ Content           │
│ (single column)   │
│                   │
│ Cards stack       │
│ vertically        │
│                   │
│ Full-width        │
│ buttons           │
└───────────────────┘
```

### Tablet View (640px - 1024px):
```
┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│ Content (two columns max)     │
│                               │
│ Cards in grid                 │
│                               │
│ Medium buttons                │
└───────────────────────────────┘
```

### Desktop View (> 1024px):
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│ Content (multi-column layout)           │
│                                         │
│ Cards in responsive grid                │
│                                         │
│ Standard button sizes                   │
└─────────────────────────────────────────┘
```

---

## Interaction Patterns

### Hover Effects:
```
Normal Card:
┌─────────────┐
│ Card Content│
└─────────────┘

Hovered Card:
┌─────────────┐
│ ↑ Shadow    │
│ Card Content│
│ ↓ Transform │
└─────────────┘
```

### Loading States:
```
[Analyze Button Normal]
┌──────────────────────┐
│ Analyze Crop Health  │
└──────────────────────┘

[Analyze Button Loading]
┌──────────────────────┐
│ ⟳ Analyzing...       │
└──────────────────────┘
```

### Error States:
```
┌─────────────────────────────────┐
│ ⚠️ Invalid File Type            │
│                                 │
│ Please upload JPG, PNG, or     │
│ WebP images only.               │
│                                 │
│ [OK]                            │
└─────────────────────────────────┘
```

---

## Animation Guidelines

### Fade In (Cards):
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Pulse (Loading Spinner):
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Bounce (Success Icon):
```css
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## Accessibility Features

### Keyboard Navigation:
```
Tab key → Move between interactive elements
Enter → Activate button/link
Space → Toggle checkbox/switch
Esc → Close modal/dialog
Arrow keys → Navigate calendar weeks
```

### Screen Reader Support:
```html
<!-- Proper ARIA labels -->
<button aria-label="Upload crop image from gallery">
  📷 Upload Image
</button>

<button aria-label="Take photo with camera">
  📸 Camera
</button>

<div role="alert" aria-live="polite">
  Analysis complete. Health status: Moderate Stress.
</div>
```

### Focus Indicators:
```css
:focus-visible {
  outline: 2px solid #3b82f6; /* Blue */
  outline-offset: 2px;
}
```

---

## Typography Scale

```
Headings:
H1: 2xl (24px) - Page titles
H2: lg (18px) - Section headers
H3: md (16px) - Card titles
H4: sm (14px) - Subsections

Body:
Base: sm (14px) - Main content
Small: xs (12px) - Captions, hints

Buttons:
Base: sm (14px) - Button text
```

---

**UI Design Complete!** 🎨

*All screens designed for maximum farmer accessibility and ease of use.*
