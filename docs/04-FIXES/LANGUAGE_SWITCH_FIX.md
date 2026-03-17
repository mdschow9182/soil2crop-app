# Language Switching Debug Guide

## Overview
Language switching has been fixed with improved logging. Here's how to verify it works correctly.

## What Was Fixed

### 1. **LanguageContext** (`src/context/LanguageContext.tsx`)
- ✅ Fixed `setLanguage` function structure
- ✅ Changed localStorage key to use constant `LANGUAGE_KEY` consistently
- ✅ Added detailed console logging for state changes
- ✅ Improved backend sync error handling

### 2. **Settings Page** (`src/pages/Settings.tsx`)
- ✅ Removed unnecessary `async/await` from `handleLanguageChange`
- ✅ Made function synchronous (setLanguage is not async)
- ✅ Added console logging for debugging
- ✅ Improved toast message handling

### 3. **LanguageSwitcher Component** (`src/components/LanguageSwitcher.tsx`)
- ✅ Added logging to track language changes
- ✅ Proper event handling with explicit handler function

## How Language Switching Works Now

```
User clicks language in Settings (or LanguageSwitcher)
        ↓
handleChange/handleLanguageChange triggered
        ↓
setLanguage(newLanguage) called
        ↓
React state updated → Component re-renders
        ↓
localStorage saved
        ↓
Backend sync (non-blocking)
        ↓
All components using useLanguage() hook update with new language
```

## Test Steps

### 1. Start Backend
```powershell
cd backend
node index.js
```

### 2. Start Frontend
```powershell
cd frontend
npm run dev
```

### 3. Test Language Switch in Settings

1. **Login** with any credentials (mobile: `9999999999` for quick test)
2. **Navigate to Settings** (gear icon in bottom nav)
3. **Change Language** using the "Select App Language" dropdown
4. **Watch DevTools Console** for logs:
   ```
   [LanguageContext] Change language to: te
   [LanguageContext] Language saved to localStorage: te
   [Settings] Language change triggered: te
   [Settings] Showing toast for language: Telugu
   ```
5. **Verify UI Updates**:
   - Preview text changes immediately
   - All page labels update when navigating
   - Language persists across page reloads

### 4. Test Language Switch in Header

1. **Use LanguageSwitcher** (globe icon in top right)
2. **Select different language**
3. **Watch DevTools Console**:
   ```
   [LanguageSwitcher] Language change: hi
   [LanguageContext] Change language to: hi
   [LanguageContext] Language saved to localStorage: hi
   ```
4. **Verify pages update immediately**

## Console Logs to Expect

### LanguageContext Logs
```javascript
[LanguageContext] Change language to: <language_code>
[LanguageContext] Language saved to localStorage: <language_code>
[LanguageContext] Backend language sync successful
// OR
[LanguageContext] Backend language sync failed: <error>
```

### Settings Logs
```javascript
[Settings] Language change triggered: <language_code>
[Settings] Showing toast for language: <language_name>
```

### LanguageSwitcher Logs
```javascript
[LanguageSwitcher] Language change: <language_code>
```

## Troubleshooting

### Issue: Language doesn't change after clicking
**Check**:
1. Are you seeing console logs? (If not, DevTools might be closed)
2. Is the dropdown actually changing value? (UI might not reflect)
3. Try refreshing page - language should persist in localStorage

### Issue: Language changes but preview text doesn't update
**Solution**:
1. Check that translation keys exist in `src/i18n/translations.ts`
2. Ensure components using translations use `useLanguage()` hook
3. Component must be inside `<LanguageProvider>` (checked in main.tsx)

### Issue: Language resets on page reload
**Check**:
1. Is localStorage enabled in browser?
2. Are cookies/storage being cleared by browser?
3. Check DevTools → Application → Local Storage → http://localhost:5173

### Issue: Backend sync shows error
**Info**: This is non-blocking - UI still updates locally
- Backend language sync is optional
- Language works fully without backend confirmation
- Error message in console is informational

## Local Storage Keys

The app uses this key:
```javascript
"soil2crop_language" // Stores current language code
```

Check it in DevTools → Application → Local Storage

## Testing All Languages

Quick succession test:
1. Change to Telugu (te)
2. Change to Hindi (hi)
3. Change to Tamil (ta)
4. Change to Kannada (kn)
5. Change to Malayalam (ml)
6. Change to English (en)

All should update instantly with visible console logs.

## Database Language Persistence

When you log in or change language:
- **Frontend**: Saves to localStorage immediately
- **Backend**: Updates farmer record (if sync succeeds)
- **On Next Login**: If farmer was created/updated with language, it loads

To test:
1. Change language to Telugu in Settings
2. Logout
3. Login again with same mobile number
4. Language should still be Telugu

## Performance Notes

- Language change: **Instant** (synchronous state update)
- Toast notification: **Instant** (no animation blocking)
- Backend sync: **Background** (doesn't block UI)
- Re-render: **All components using useLanguage hook**

## Files Modified

- ✅ `src/context/LanguageContext.tsx` - Fixed state update & logging
- ✅ `src/pages/Settings.tsx` - Removed async, added logging
- ✅ `src/components/LanguageSwitcher.tsx` - Added logging

## No Breaking Changes

- All existing functionality preserved
- Backwards compatible with stored preferences
- No database migrations needed
