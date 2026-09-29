# Voice Functions - Quick Reference

## 📦 Available Functions

### 1. `getVoiceMessage(crops)`
**Generate simple voice message from crop list**

```typescript
import { getVoiceMessage } from "@/utils/voiceMessages";

const crops = ["Rice", "Maize", "Banana"];
const message = getVoiceMessage(crops);
// Output: "Based on your soil data, the recommended crops are Rice, Maize, and Banana."
```

**Parameters:**
- `crops: string[]` - Array of crop names

**Returns:** `string` - Formatted voice message

---

### 2. `speakText(message)`
**Speak text immediately**

```typescript
import { speakText } from "@/utils/voiceMessages";

speakText("Your crop recommendations are ready");
```

**Parameters:**
- `message: string` - Text to speak

**Returns:** `void`

**Features:**
- Uses browser SpeechSynthesis API
- Default language: en-US
- Speech rate: 1.0 (normal)
- Volume: 1.0 (full)
- Graceful fallback if not supported

---

### 3. `stopSpeech()`
**Stop ongoing speech**

```typescript
import { stopSpeech } from "@/utils/voiceMessages";

// Stop current speech
stopSpeech();
```

**Returns:** `void`

**Use Cases:**
- Cancel long announcements
- User clicked stop button
- Switch to new message

---

## 🎯 Common Patterns

### Pattern 1: Generate & Speak
```typescript
import { getVoiceMessage, speakText } from "@/utils/voiceMessages";

const crops = ["Rice", "Maize"];
const message = getVoiceMessage(crops);
speakText(message);
```

### Pattern 2: Direct Speak
```typescript
import { speakText } from "@/utils/voiceMessages";

speakText("Hello Farmer!");
```

### Pattern 3: With Stop Button
```typescript
import { speakText, stopSpeech } from "@/utils/voiceMessages";

<button onClick={() => speakText("Recommendations...")}>
  🔊 Speak
</button>

<button onClick={stopSpeech}>
  🔇 Stop
</button>
```

### Pattern 4: Combined Messages
```typescript
import { generateSoilAlertVoiceMessage, getVoiceMessage } from "@/utils/voiceMessages";

const cropMsg = getVoiceMessage(["Rice", "Maize"]);
const alertMsg = generateSoilAlertVoiceMessage(6.5, "Medium", "Medium", "High");

const fullMessage = `${cropMsg} ${alertMsg}`;
// speakText(fullMessage); // Uncomment to speak
```

---

## 📝 Import Statements

### Named Imports (Recommended)
```typescript
import { 
  getVoiceMessage, 
  speakText, 
  stopSpeech 
} from "@/utils/voiceMessages";
```

### Import All as Object
```typescript
import voiceMessages from "@/utils/voiceMessages";

voiceMessages.getVoiceMessage(["Rice"]);
voiceMessages.speakText("Hello");
voiceMessages.stopSpeech();
```

### Mix Imports
```typescript
import { 
  getVoiceMessage, 
  speakText, 
  stopSpeech,
  generateRecommendationVoiceMessage
} from "@/utils/voiceMessages";
```

---

## 🧪 Test in Console

Open browser DevTools (F12) and test:

```javascript
// Test 1: Check if functions exist
import { getVoiceMessage, speakText, stopSpeech } from './utils/voiceMessages';

// Test 2: Generate message
const msg = getVoiceMessage(["Rice", "Wheat"]);
console.log(msg);

// Test 3: Speak (will hear audio)
speakText("Testing voice guidance system");

// Test 4: Stop speech
setTimeout(() => stopSpeech(), 2000);
```

---

## ⚠️ Common Errors & Fixes

### Error 1: Export not found
```
❌ does not provide an export named 'getVoiceMessage'
```

**Fix:** Ensure functions are exported in voiceMessages.ts:
```typescript
export function getVoiceMessage(crops: string[]): string { ... }
```

---

### Error 2: Function undefined
```
❌ TypeError: speakText is not a function
```

**Fix:** Check import statement:
```typescript
import { speakText } from "@/utils/voiceMessages";
```

---

### Error 3: Speech not working
```
⚠️ Speech synthesis not supported by this browser.
```

**Fix:** Use Chrome or Edge browser (Firefox has limited support)

---

## 🔧 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best support |
| Edge | ✅ Full | Excellent support |
| Safari | ⚠️ Partial | May need user interaction |
| Firefox | ⚠️ Limited | Basic support only |

---

## 📋 Complete Function List

All exports from `voiceMessages.ts`:

1. **Simple Message Generation**
   - `getVoiceMessage(crops)` ✅

2. **Advanced Message Generation**
   - `generateRecommendationVoiceMessage(top3Crops)`
   - `generateDetailedVoiceMessage(top3Crops)`
   - `generateSoilAlertVoiceMessage(pH, N, P, K)`
   - `generateSuccessVoiceMessage(cropCount)`
   - `getQuickSummaryVoiceMessage(pH, N, topCrop)`

3. **Speech Control**
   - `speakText(message)` ✅
   - `stopSpeech()` ✅

4. **Utilities**
   - `combineVoiceMessages(...messages)`
   - `VoiceMessages` (constants object)

---

## 🚀 Quick Start

```typescript
// 1. Import functions
import { getVoiceMessage, speakText, stopSpeech } from "@/utils/voiceMessages";

// 2. Get crops
const crops = ["Rice", "Maize", "Banana"];

// 3. Generate message
const message = getVoiceMessage(crops);

// 4. Speak it
speakText(message);

// 5. Stop if needed
// stopSpeech();
```

---

**Status:** ✅ Working  
**Last Updated:** March 27, 2026
