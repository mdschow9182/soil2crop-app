# Safe getVoiceMessage - Quick Reference

## ✅ Function Signature

```typescript
export function getVoiceMessage(crops: any): string
```

**Accepts:** Arrays, Objects, Strings, Undefined, Null

---

## 🎯 Usage Examples

### Example 1: Array Input ✅
```typescript
const crops = ["Rice", "Maize", "Banana"];
const msg = getVoiceMessage(crops);
// Output: "Based on your soil data, the recommended crops are Rice, Maize, and Banana."
```

### Example 2: Object Input ✅
```typescript
const cropsObj = { crops: ["Rice", "Maize"] };
const msg = getVoiceMessage(cropsObj);
// Output: "Based on your soil data, the recommended crops are Rice, Maize."
```

### Example 3: Undefined Input ✅
```typescript
const msg = getVoiceMessage(undefined);
// Output: "No crop recommendations available."
```

### Example 4: Empty Array ✅
```typescript
const msg = getVoiceMessage([]);
// Output: "No crop recommendations available."
```

### Example 5: String Input ✅
```typescript
const msg = getVoiceMessage("Rice");
// Output: "Based on your soil data, the recommended crop is Rice."
```

---

## 🔍 Type Handling Logic

```
Input Received
    ↓
Is it falsy? → Return "No crop recommendations available."
    ↓ No
Is it Array? → Join with ", " and return
    ↓ No
Is it Object? → Extract crops/recommendedCrops array → Join if exists
    ↓ No
Is it String? → Return "recommended crop is [string]"
    ↓ No
Return "Crop recommendation available."
```

---

## 📋 SoilReport.tsx Pattern

### Correct Usage
```typescript
import { VoiceMessages } from "@/utils/voiceMessages";

// For pre-defined messages
const successMsg = VoiceMessages.ready;
const noDataMsg = VoiceMessages.noData;

// For dynamic crop lists
const crops = response?.data?.top3 || [];
const cropMsg = getVoiceMessage(crops);
```

### Wrong Usage ❌
```typescript
// Don't do this - wrong parameters
const msg = getVoiceMessage(language, 'uploadSuccess');
```

---

## 🧪 Quick Test

Open browser console (F12):

```javascript
// Import function
import { getVoiceMessage } from './utils/voiceMessages';

// Test 1: Array
console.log(getVoiceMessage(["Rice", "Maize"]));

// Test 2: Object
console.log(getVoiceMessage({ crops: ["Rice", "Wheat"] }));

// Test 3: Undefined
console.log(getVoiceMessage(undefined));

// Test 4: Empty
console.log(getVoiceMessage([]));

// Test 5: String
console.log(getVoiceMessage("Rice"));
```

**Expected Output:**
```
"Based on your soil data, the recommended crops are Rice, Maize."
"Based on your soil data, the recommended crops are Rice, Wheat."
"No crop recommendations available."
"No crop recommendations available."
"Based on your soil data, the recommended crop is Rice."
```

---

## ⚠️ Common Errors & Solutions

### Error: "crops.join is not a function"
**Cause:** crops is not an array

**Solution:** Function now handles this automatically with type checking

---

### Error: "Cannot read property 'join' of undefined"
**Cause:** crops is undefined

**Solution:** Function checks for undefined before accessing properties

---

### Error: Voice not working
**Cause:** Browser doesn't support speech or wrong import

**Solution:** 
1. Use Chrome/Edge
2. Check import: `import { getVoiceMessage } from "@/utils/voiceMessages"`
3. Verify console logs show "Voice crops value: ..."

---

## 📊 Input/Output Table

| Input Type | Input Value | Output Message |
|------------|-------------|----------------|
| Array | `["Rice", "Maize"]` | "Based on your soil data, the recommended crops are Rice, Maize." |
| Object | `{ crops: ["Rice"] }` | "Based on your soil data, the recommended crops are Rice." |
| Object | `{ recommendedCrops: ["Rice", "Wheat"] }` | "Based on your soil data, the recommended crops are Rice, Wheat." |
| String | `"Rice"` | "Based on your soil data, the recommended crop is Rice." |
| Undefined | `undefined` | "No crop recommendations available." |
| Null | `null` | "No crop recommendations available." |
| Empty Array | `[]` | "No crop recommendations available." |
| Empty Object | `{}` | "Crop recommendation available." |

---

## 🔧 Debug Console Logs

When you call `getVoiceMessage`, you'll see:

```
Voice crops value: [actual value]
```

This helps debug what's actually being passed to the function.

---

## ✅ Checklist Before Testing

- [ ] Development server restarted
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Console open (F12)
- [ ] Volume/speakers working
- [ ] Using Chrome or Edge browser

---

## 🚀 Quick Start Code

```typescript
// In your component
import { getVoiceMessage, speakText } from "@/utils/voiceMessages";

// Get crops from API response
const crops = apiResponse?.data?.top3?.map(c => c.cropName) || [];

// Generate message
const message = getVoiceMessage(crops);

// Speak it
speakText(message);

// Or stop it
// stopSpeech();
```

---

**Status:** ✅ Type-Safe and Working  
**Last Updated:** March 27, 2026
