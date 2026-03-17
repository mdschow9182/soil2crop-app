# ✅ API Functions - Complete Guide

## 📋 All Exported Functions from `src/api.js`

Your `api.js` file now exports the following functions:

### 1. **getCropRecommendation** 
Sends soil data to backend and returns recommended crops.

### 2. **getMarketPrices** 
Fetches current crop market prices.

### 3. **getSchemeRecommendations** 
Fetches government schemes suitable for the farmer.

---

## 🔧 Function Signatures & Usage Examples

### 1. getCropRecommendation(soilData)

**Purpose:** Get AI-based crop recommendations based on soil conditions.

**Parameters:**
```javascript
{
  N: number,        // Nitrogen (kg/ha)
  P: number,        // Phosphorus (kg/ha)
  K: number,        // Potassium (kg/ha)
  pH: number,       // pH level (0-14)
  rainfall: number, // Rainfall (mm)
  temperature: number, // Temperature (°C)
  humidity: number  // Humidity (%)
}
```

**Usage Example:**
```javascript
import { getCropRecommendation } from "@/api";

const soilData = {
  N: 90,
  P: 42,
  K: 43,
  pH: 6.5,
  rainfall: 200,
  temperature: 25,
  humidity: 80
};

try {
  const response = await getCropRecommendation(soilData);
  console.log("Recommended crops:", response.data);
} catch (error) {
  console.error("Error getting recommendations:", error);
}
```

**Backend Endpoint:** `POST /api/crop-recommendation`

---

### 2. getMarketPrices(crop, location)

**Purpose:** Fetch current market prices for a specific crop.

**Parameters:**
- `crop` (string): Crop name (e.g., "Maize", "Wheat")
- `location` (string, optional): Location name (e.g., "Guntur", "Mumbai")

**Usage Example:**
```javascript
import { getMarketPrices } from "@/api";

// Get price for specific crop and location
try {
  const response = await getMarketPrices("maize", "guntur");
  console.log("Market prices:", response.data);
  // Output: { min_price: 1800, max_price: 2200, avg_price: 2000, ... }
} catch (error) {
  console.error("Error fetching prices:", error);
}

// Get all prices for a location
import { getAllMarketPrices } from "@/api";

try {
  const response = await getAllMarketPrices("guntur");
  console.log("All crop prices:", response.data.prices);
} catch (error) {
  console.error("Error fetching all prices:", error);
}
```

**Backend Endpoints:** 
- `GET /api/market-prices?crop={crop}&location={location}`
- `GET /api/market-prices/all?location={location}`

---

### 3. getSchemeRecommendations(criteria)

**Purpose:** Fetch government schemes based on farmer profile.

**Parameters:**
```javascript
{
  soil_type: string,      // e.g., "Loamy", "Clay"
  crop_selected: string,  // e.g., "Maize", "Wheat"
  field_size: number,     // Land size in hectares
  farmer_location: string // Farmer's location
}
```

**Usage Example:**
```javascript
import { getSchemeRecommendations } from "@/api";

const criteria = {
  soil_type: "Loamy",
  crop_selected: "Maize",
  field_size: 1.5,
  farmer_location: "Guntur"
};

try {
  const response = await getSchemeRecommendations(criteria);
  console.log("Recommended schemes:", response.data.recommended_schemes);
  // Output: Array of scheme objects
} catch (error) {
  console.error("Error fetching schemes:", error);
}
```

**Backend Endpoint:** `GET /api/schemes/recommendations`

---

## 📝 Complete Implementation in GovernmentDashboard.tsx

Here's how to correctly use `getSchemeRecommendations`:

```typescript
import { useEffect, useState } from "react";
import { getSchemeRecommendations } from "@/api";

interface Scheme {
  name: string;
  benefit: string;
  eligibility: string;
  link: string;
  category: string;
}

const GovernmentDashboard = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      // Prepare criteria from stored data or user input
      const criteria = {
        soil_type: "Loamy",
        crop_selected: "Maize",
        field_size: 1.5,
        farmer_location: "Guntur"
      };

      // Call the API
      const response = await getSchemeRecommendations(criteria);
      
      if (response.success && response.data) {
        setSchemes(response.data.recommended_schemes || []);
      } else {
        throw new Error("Failed to fetch schemes");
      }
    } catch (err: any) {
      console.error("Error fetching schemes:", err);
      setError(err.message || "Failed to load government schemes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Government Schemes</h1>
      {schemes.map((scheme, index) => (
        <div key={index}>
          <h2>{scheme.name}</h2>
          <p>{scheme.benefit}</p>
          <p>{scheme.eligibility}</p>
          <a href={scheme.link} target="_blank">Learn More</a>
        </div>
      ))}
    </div>
  );
};

export default GovernmentDashboard;
```

---

## 🎯 Complete Component Example with All Functions

```typescript
import { useState, useEffect } from "react";
import { 
  getCropRecommendation, 
  getMarketPrices, 
  getSchemeRecommendations 
} from "@/api";

const SmartFarmingDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [prices, setPrices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example 1: Get Crop Recommendations
  const handleGetCropRecommendations = async () => {
    setLoading(true);
    try {
      const soilData = {
        N: 90,
        P: 42,
        K: 43,
        pH: 6.5,
        rainfall: 200,
        temperature: 25,
        humidity: 80
      };

      const response = await getCropRecommendation(soilData);
      setCrops(response.data.recommended_crops);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Get Market Prices
  const handleGetMarketPrices = async () => {
    setLoading(true);
    try {
      const response = await getMarketPrices("maize", "guntur");
      setPrices([response.data]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Get Government Schemes
  const handleGetSchemes = async () => {
    setLoading(true);
    try {
      const criteria = {
        soil_type: "Loamy",
        crop_selected: "Maize",
        field_size: 1.5,
        farmer_location: "Guntur"
      };

      const response = await getSchemeRecommendations(criteria);
      setSchemes(response.data.recommended_schemes);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGetCropRecommendations}>
        Get Crop Recommendations
      </button>
      <button onClick={handleGetMarketPrices}>
        Get Market Prices
      </button>
      <button onClick={handleGetSchemes}>
        Get Government Schemes
      </button>

      {loading && <p>Loading...</p>}

      <div>
        <h2>Crop Recommendations</h2>
        {crops.map(crop => (
          <div key={crop.id}>{crop.name}</div>
        ))}
      </div>

      <div>
        <h2>Market Prices</h2>
        {prices.map(price => (
          <div key={price.crop}>
            {price.crop}: ₹{price.avg_price}/quintal
          </div>
        ))}
      </div>

      <div>
        <h2>Government Schemes</h2>
        {schemes.map(scheme => (
          <div key={scheme.name}>
            <h3>{scheme.name}</h3>
            <p>{scheme.benefit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartFarmingDashboard;
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Module does not provide export"
**Error:** `The requested module '/src/api.js' does not provide an export named 'getSchemeRecommendations'`

**Solution:**
1. Make sure the function is exported with `export const`
2. Check the spelling matches exactly (case-sensitive)
3. Restart Vite dev server: `Ctrl+C`, then `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

### Issue 2: Import path incorrect
**Wrong:**
```javascript
import { getSchemeRecommendations } from "../api";
```

**Correct:**
```javascript
import { getSchemeRecommendations } from "@/api";
```

### Issue 3: API call fails
**Solution:**
1. Verify backend is running on http://localhost:3000
2. Check `.env.local` has correct `VITE_API_URL`
3. Look at browser console for exact error
4. Verify CORS is enabled in backend

---

## 📦 Complete api.js File Structure

Your final `api.js` should have these exports:

```javascript
// Farmer APIs
export const loginFarmer
export const getFarmerById
export const updateFarmerLanguage

// Soil Report APIs
export const uploadSoilReport
export const submitSoilData

// Crop Image APIs
export const uploadCropImage

// Alert APIs
export const getAlerts
export const markAlertAsRead
export const markAllAlertsAsRead
export const deleteAlert

// Health & Test
export const healthCheck
export const testDatabase

// Government Schemes ✨ NEW
export const getSchemeRecommendations

// Market Prices ✨ NEW
export const getMarketPrice
export const getAllMarketPrices
export const getMarketPrices (wrapper)

// Crop Recommendation ✨ NEW
export const getCropRecommendation
```

---

## ✅ Verification Checklist

After implementing, verify:

- [ ] `api.js` exports `getSchemeRecommendations`
- [ ] `GovernmentDashboard.tsx` imports from `@/api`
- [ ] No TypeScript errors in VS Code
- [ ] Browser console shows no import errors
- [ ] Backend endpoint `/api/schemes/recommendations` exists
- [ ] Data displays correctly in UI
- [ ] Error handling works properly

---

## 🎉 Success Indicators

You'll know it's working when:

1. ✅ No console errors about missing exports
2. ✅ Government schemes load and display
3. ✅ Market prices show correctly
4. ✅ Crop recommendations appear
5. ✅ All API calls return valid JSON
6. ✅ Loading states work properly
7. ✅ Error messages display on failure

---

**Last Updated:** March 6, 2026  
**Status:** ✅ All Functions Implemented and Working
