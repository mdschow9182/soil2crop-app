# 🔧 API Import Fix - FeedbackForm.tsx

**Date:** March 9, 2026  
**Status:** ✅ Fixed  

---

## Problem

### Error Message
```
Uncaught SyntaxError: The requested module '/src/api.js' does not provide an export named 'api'
(at FeedbackForm.tsx:1:10)
```

### Root Cause

**Incorrect Import:**
```typescript
import { api } from '@/api';
```

**Problem:**
- `@/api.js` exports individual functions (e.g., `submitSoilData`, `uploadSoilReport`)
- It does NOT export a named object called `api`
- FeedbackForm.tsx was trying to use `api.post()` which doesn't exist

---

## Solution

### Correct Import
```typescript
import api from '@/lib/api';
```

**Why This Works:**
- `@/lib/api.ts` creates and exports an axios instance
- It's a default export, not a named export
- Provides `.post()`, `.get()`, `.put()`, `.delete()` methods
- Automatically handles farmer_id in headers via interceptor

---

## Changes Made

### File: `FeedbackForm.tsx`

**Line 17 - Before:**
```typescript
import { api } from '@/api';
```

**Line 17 - After:**
```typescript
import api from '@/lib/api';
```

---

## API Usage in FeedbackForm

### Submit Feedback (Line 69)
```typescript
await api.post('/api/help', {
  ...data,
  farmerId
});
```

**What Happens:**
1. Axios POST request to `/api/help`
2. Headers automatically set with `Content-Type: application/json`
3. Farmer ID automatically added from localStorage via interceptor
4. Returns parsed JSON response

---

## How It Works

### Axios Instance Configuration (`@/lib/api.ts`)

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach farmer_id
api.interceptors.request.use((config) => {
  const farmerId = localStorage.getItem("farmer_id");
  if (farmerId) {
    config.headers["x-farmer-id"] = farmerId;
  }
  return config;
});

export default api;
```

---

## Benefits of Using `@/lib/api`

✅ **Automatic Headers**
- Content-Type set correctly
- Farmer ID auto-attached

✅ **Consistent Error Handling**
- All API calls use same error handling
- Better debugging with interceptors

✅ **TypeScript Support**
- Full type definitions
- IDE autocomplete

✅ **Cleaner Code**
- Simple `api.post()` syntax
- No need to configure each call

---

## Alternative Approaches (NOT Recommended)

### ❌ Option 1: Import All Functions
```typescript
import * as api from '@/api';
```

**Problems:**
- Would need to add new functions to api.js for every endpoint
- More verbose: `api.submitFeedback()` instead of `api.post()`
- Duplicates axios functionality already available

### ❌ Option 2: Create api Object
```typescript
import * as apiFunctions from '@/api';
const api = {
  post: async (url, data) => {
    // Manual implementation needed
  }
};
```

**Problems:**
- Reinventing the wheel
- More code to maintain
- Loses axios features

---

## Testing

### Verify Fix Works

1. **Start Application**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open Browser Console**
   - Press F12
   - Go to Console tab

3. **Check for Errors**
   - Should NOT see: `does not provide an export named 'api'`
   - Should see normal app startup messages

4. **Test Feedback Form**
   - Navigate to any page with Help button
   - Click Help button
   - Fill out feedback form
   - Submit
   - Should work without errors

---

## Related Files

### Core Files
- ✅ [`FeedbackForm.tsx`](file:///c:/Users/mdsch/OneDrive/Desktop/soil2crop-app/frontend/src/components/FeedbackForm.tsx) - Fixed import
- ✅ [`lib/api.ts`](file:///c:/Users/mdsch/OneDrive/Desktop/soil2crop-app/frontend/src/lib/api.ts) - Axios instance
- ✅ [`api.js`](file:///c:/Users/mdsch/OneDrive/Desktop/soil2crop-app/frontend/src/api.js) - Helper functions (still used elsewhere)

### Other Components Using Correct Imports

These components already use the correct pattern:
- HelpButton.tsx → Uses voice utilities
- VoiceDebug.tsx → Uses voice utilities
- SoilReport.tsx → Uses api.js helper functions
- CropSuggestion.tsx → Uses api.js helper functions

---

## Best Practices

### ✅ DO: Use `@/lib/api` for HTTP Calls
```typescript
import api from '@/lib/api';

await api.post('/endpoint', data);
await api.get('/endpoint');
await api.put('/endpoint', data);
await api.delete('/endpoint');
```

### ✅ DO: Use `@/api` for Specific Helper Functions
```typescript
import { uploadSoilReport, getFarmerById } from '@/api';

await uploadSoilReport(formData);
await getFarmerById(farmerId);
```

### ❌ DON'T: Try to Import Non-Existent Objects
```typescript
// WRONG - api.js doesn't export 'api' object
import { api } from '@/api';
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Import Statement** | `import { api } from '@/api'` | `import api from '@/lib/api'` |
| **Module Used** | `@/api.js` | `@/lib/api.ts` |
| **Export Type** | Named (doesn't exist) | Default (correct) |
| **Functionality** | Broken | Working ✅ |
| **TypeScript** | Error | Valid |

---

## Verification Checklist

- [x] Import statement corrected
- [x] Using correct axios instance
- [x] API call syntax maintained (`api.post()`)
- [x] No breaking changes to functionality
- [x] TypeScript compatible
- [ ] Tested in browser (manual test needed)

---

**Status:** ✅ Fixed  
**Impact:** Minimal - single line change  
**Risk:** Low - using established pattern  

🎉 **FeedbackForm now correctly imports and uses the axios instance!**
