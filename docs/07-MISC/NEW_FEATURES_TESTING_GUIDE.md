# Quick Start Guide - New Modules

## 🚀 How to Test the New Features

### Step 1: Start the Backend Server

Open a terminal in the backend folder:
```bash
cd backend
node index.js
```

You should see:
```
=================================
Soil2Crop Backend RUNNING
Listening on http://localhost:3000
Port: 3000
Environment: development
=================================
```

### Step 2: Start the Frontend Dev Server

Open a NEW terminal in the frontend folder:
```bash
cd frontend
npm run dev
```

You should see something like:
```
VITE v5.4.19  ready in 1891 ms
➜  Local:   http://localhost:8084/
➜  Network: http://10.180.200.116:8084/
```

### Step 3: Login to the Application

1. Open your browser to the URL shown (e.g., http://localhost:8084)
2. You'll see the login page
3. Enter test credentials:
   - Name: Test Farmer
   - Mobile: 9876543210
   - Language: English
4. Click "Login"

### Step 4: Test Government Schemes Feature

1. After login, click **"Schemes"** in the bottom navigation bar
2. You should see:
   - 3-6 recommended government schemes
   - Each scheme with name, benefits, and eligibility
   - Color-coded category badges
   - "Visit Official Website" buttons

**What to look for:**
- ✅ Schemes load without errors
- ✅ Categories are color-coded
- ✅ Links open official websites
- ✅ Responsive design works on mobile

### Step 5: Test Market Prices Feature

1. Click **"Prices"** in the bottom navigation bar
2. You should see:
   - A table of all crop prices
   - Location filter at the top
   - Crop selector dropdown
   - Market trend indicators (↑↓→)

2. Try the filters:
   - Change location from Guntur to Mumbai
   - Select a specific crop (e.g., Maize)
   
3. You should see:
   - Detailed price card for selected crop
   - Min/Avg/Max prices displayed
   - Market trend arrow showing direction

**What to look for:**
- ✅ Prices display correctly
- ✅ Filters work smoothly
- ✅ Trend indicators show correctly
- ✅ Clicking crops shows details

---

## 🧪 API Testing with cURL

If you prefer testing APIs directly:

### Test Scheme Recommendations:
```bash
curl "http://localhost:3000/api/schemes/recommendations?soil_type=Loamy&crop_selected=Maize&field_size=1.5&farmer_location=Guntur" | json_pp
```

Expected output: JSON with 3-6 recommended schemes

### Test Single Crop Price:
```bash
curl "http://localhost:3000/api/market-prices?crop=maize&location=guntur" | json_pp
```

Expected output: Price data for Maize in Guntur

### Test All Prices:
```bash
curl "http://localhost:3000/api/market-prices/all?location=guntur" | json_pp
```

Expected output: Prices for all 8 crops

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'schemeService'"
**Solution:** Make sure you're in the backend folder and restart the server:
```bash
cd backend
node index.js
```

### Issue: "Page not found" for schemes/prices
**Solution:** 
1. Check that you added routes to App.tsx
2. Restart frontend dev server
3. Clear browser cache (Ctrl+Shift+R)

### Issue: No schemes showing
**Solution:** 
- Check browser console for errors
- Verify backend is running on port 3000
- Check CORS settings allow frontend port

### Issue: Market prices not loading
**Solution:**
- Verify API endpoint is accessible: http://localhost:3000/api/market-prices/all
- Check network tab in browser DevTools
- Ensure no firewall blocking localhost connections

---

## 📱 Mobile View Testing

The UI is fully responsive. To test mobile view:

1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. Navigate to Schemes and Prices pages
5. Verify layout adapts correctly

---

## ✨ Expected User Experience

### Government Schemes:
- Farmer sees relevant schemes based on their profile
- Easy to understand benefits and eligibility
- One-click access to official websites
- Clear categorization by scheme type

### Market Prices:
- Real-time price information for crops
- Easy comparison across locations
- Visual trend indicators (↑↓→)
- Helps farmers decide when/where to sell

---

## 📊 Sample Data

The system comes pre-loaded with:

**Schemes:**
- PM Kisan (Income Support)
- PMFBY (Insurance)
- PMKSY (Irrigation)
- PKVY (Organic Farming)
- RKVY (General Development)
- Soil Health Card

**Market Prices:**
- 8 major crops
- 4 locations (Guntur, Mumbai, Delhi, Chennai)
- Realistic price ranges (₹280-₹6600 per quintal)
- Dynamic trend calculation

---

## 🎯 Success Criteria

✅ Both features load without errors
✅ Navigation works smoothly
✅ API calls return valid data
✅ UI is responsive on mobile
✅ No console errors
✅ Existing features still work
✅ Backend doesn't crash
✅ TypeScript compiles successfully

---

## 📝 Notes

- All data is currently mock/prototype data
- Market prices can be replaced with real API later
- Scheme recommendations use simple rule-based logic
- Location defaults to "Guntur" (can be enhanced)
- Field size defaults to 1.5 hectares (small farmer)

---

## 🔗 Next Steps

After successful testing:

1. **Enhance Location Data:**
   - Add more mandis/markets
   - Use GPS for automatic location detection

2. **Connect Real APIs:**
   - Replace mock prices with AGMARKNET API
   - Add real-time price updates

3. **Add Analytics:**
   - Track which schemes farmers click
   - Monitor popular crops searched
   - Analyze price search patterns

4. **Farmer Profile Enhancement:**
   - Store actual field size
   - Save preferred location
   - Track application history

---

**Implementation Date:** March 3, 2026
**Status:** ✅ Ready for Testing
**Stability:** Phase-1 Safe (No breaking changes)
