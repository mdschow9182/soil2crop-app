# 🔊 Voice Guidance Troubleshooting Guide

## Problem: Voice guidance is not working

### Step 1: Test with Debug Component

I've added a **Voice Debug Component** to the Soil Report page. Here's how to use it:

```
1. Navigate to: http://localhost:5173/soil-report
2. You'll see a new card at the top: "🔊 Voice Debug Test"
3. Click the test buttons:
   - "Test English"
   - "Test Telugu" 
   - "Test Hindi"
```

### What the Debug Component Shows:

✅ **If you see "Speech synthesis is supported"** and voices listed:
- Browser supports voice
- Voices are loaded
- Click any test button to hear voice

❌ **If you see "Speech synthesis NOT supported"**:
- Your browser doesn't support Web Speech API
- Try Chrome or Edge browser (best support)

⚠️ **If you see "0 available voices"**:
- Voices haven't loaded yet
- Click the test button anyway - may trigger loading
- Try clicking multiple times

---

## Common Issues & Solutions

### Issue 1: No Sound at All

**Possible Causes:**
- Volume muted
- Wrong audio output device
- Browser permissions

**Solutions:**
```
✓ Check system volume
✓ Check browser tab is not muted (right-click tab → unmute)
✓ Check audio output device in system settings
✓ Close other apps using audio
```

### Issue 2: Voice Works in English but Not Indian Languages

**Cause:**
- Limited Indian language voices in your browser
- Firefox/Safari have limited support

**Solution:**
```
✓ Use Chrome or Edge browser (best for Indian languages)
✓ Download Indian language packs in OS settings
✓ Voice will fallback to closest available accent
```

### Issue 3: "User Interaction Required" Error

**Cause:**
- Browsers require user gesture before playing audio
- Autoplay policies

**Solution:**
```
✓ Click anywhere on the page first
✓ Then upload soil report (this triggers voice)
✓ Voice debug component already requires click, so use that
```

### Issue 4: Voice Very Quiet or Distorted

**Causes:**
- System audio settings
- Poor quality voices
- Audio conflicts

**Solutions:**
```
✓ Increase system volume
✓ Check Windows sound settings → Playback devices
✓ Close other audio apps
✓ Restart browser
```

### Issue 5: Console Errors

**Check Browser Console:**
```
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for errors starting with "[VoiceAssistant]"
4. Common errors:
   - "Speech synthesis not supported" → Wrong browser
   - "No voices available" → Voices not loaded yet
   - "Failed to execute 'speak'" → Audio context issue
```

---

## Browser Compatibility Chart

| Browser | Support Level | Indian Languages | Notes |
|---------|--------------|------------------|-------|
| **Chrome (Windows)** | ✅ Excellent | Full support | RECOMMENDED |
| **Edge(Windows)** | ✅ Excellent | Full support | RECOMMENDED |
| **Chrome (Android)** | ✅ Excellent | Good support | Best mobile option |
| **Firefox** | ⚠️ Fair | Limited | Fewer voices |
| **Safari (Mac/iOS)** | ⚠️ Fair | Very limited | Basic only |
| **Other browsers** | ❓ Unknown | Varies | Try Chrome |

---

## Quick Fix Checklist

Run through this checklist if voice isn't working:

- [ ] Using Chrome or Edge browser
- [ ] Volume is not muted
- [ ] Tested with Voice Debug component
- [ ] Clicked at least once on the page
- [ ] No console errors visible
- [ ] Tried restarting browser
- [ ] Checked Windows sound settings

---

## Manual Testing Steps

### Test 1: Check Browser Support
Open browser console (F12) and type:
```javascript
console.log('Speech supported:', 'speechSynthesis' in window);
console.log('Available voices:', window.speechSynthesis.getVoices().length);
```

**Expected Output:**
```
Speech supported: true
Available voices: 10+ (varies by browser)
```

### Test 2: Manual Voice Test
In browser console, type:
```javascript
const msg = new SpeechSynthesisUtterance("Hello, this is a test");
msg.lang = "en-IN";
window.speechSynthesis.speak(msg);
```

**Expected:** Hear "Hello, this is a test"

### Test 3: Check Voice Integration
1. Open Soil Report page
2. Upload a soil test PDF
3. Watch browser console for:
   ```
   [SoilReport] Upload successful
   [VoiceAssistant] Speaking message
   ```

---

## Advanced Debugging

### Enable Verbose Logging

The voice utilities already log to console. Look for:

```
[VoiceAssistant] Speech synthesis not supported     → Browser issue
[VoiceAssistant] Speech synthesis error            → Runtime error
[SoilReport] Speaking success message              → Voice triggered
```

### Check Voice Loading

Voices load asynchronously. Add this to console:

```javascript
// Force reload voices
window.speechSynthesis.onvoiceschanged = () => {
 console.log('Voices changed:', window.speechSynthesis.getVoices().length);
};
```

### Inspect Current Language

Check what language the app is using:

```javascript
// In React component context
console.log('Current language:', localStorage.getItem('language') || 'en');
```

---

## Alternative Solutions

If voice still doesn't work:

### Option 1: Visual Feedback Only
- Toast notifications already show messages
- Can add larger visual indicators
- Color-coded status messages

### Option 2: SMS/Voice Call Integration
- Send results via SMS
- Integrate with phone call services
- WhatsApp messaging

### Option 3: Downloadable Audio
- Generate MP3 files server-side
- Provide download links
- Play in external player

---

## Still Not Working?

### Collect This Information:

1. **Browser & Version:**
   - Example: Chrome 122.0.6261.94
   
2. **Operating System:**
   - Example: Windows 11, Android 13, iOS 17
   
3. **Console Errors:**
   - Screenshot of F12→ Console tab
   
4. **Debug Component Results:**
   - How many voices shown?
   - Does test button make sound?
   
5. **Steps Taken:**
   - What troubleshooting steps tried?

### Next Steps:

Post the above information in the issue tracker or contact support with:
- Screenshots of debug component
- Console error logs
- Browser/OS details

---

## Success Indicators

Voice is working correctly when you:

✅ Hear test messages from debug component  
✅ Hear confirmation after uploading soil report  
✅ Hear crop recommendations spoken aloud  
✅ Voice matches selected language(Telugu/Hindi/etc.)  
✅ No console errors related to speech  

---

## Quick Reference Commands

### Check Support
```javascript
'speechSynthesis' in window  // Should return true
```

### List Voices
```javascript
window.speechSynthesis.getVoices()
```

### Test Simple Message
```javascript
const u = new SpeechSynthesisUtterance("Test");
u.lang = "en-IN";
window.speechSynthesis.speak(u);
```

### Cancel Ongoing Speech
```javascript
window.speechSynthesis.cancel();
```

---

**Remember:** The Voice Debug component is your best friend for troubleshooting. Start there! 🎯
