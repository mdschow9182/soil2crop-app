// API Service for Soil2Crop Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Check if this is a file upload (FormData)
  const isFormDataUpload = options.body instanceof FormData;
  
  const config = {
    headers: isFormDataUpload 
      ? {} // Don't set Content-Type for FormData - browser will set it automatically
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Check if response is OK before parsing
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      
      // If response is not JSON, create a proper error
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`[API] Non-JSON response from ${endpoint}:`, response.status);
        throw new Error(`Server returned ${response.status} - Service temporarily unavailable`);
      }
      
      const data = await response.json();
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`[API] Expected JSON but got ${contentType} from ${endpoint}`);
      throw new Error('Invalid response format from server');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    // If it's a network error or JSON parse error
    if (error instanceof SyntaxError) {
      console.error(`[API] Failed to parse JSON from ${endpoint}:`, error.message);
      throw new Error('Server returned invalid data. Please try again later.');
    }
    console.error(`[API] Call failed for ${endpoint}:`, error.message);
    throw error;
  }
};

// Farmer API functions
export const loginFarmer = async ({ name, mobile, language = 'en' }) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name, mobile, language }),
  });
};

export const getFarmerById = async (farmerId) => {
  return apiCall(`/farmers/${farmerId}`);
};

export const updateFarmerLanguage = async (farmerId, language) => {
  return apiCall(`/farmers/${farmerId}/language`, {
    method: 'PUT',
    body: JSON.stringify({ language }),
  });
};

// Soil Report API functions
export const uploadSoilReport = async (formData) => {
  console.log('[API] Starting soil report upload...');
  console.log('[API] FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
  }
  
  try {
    const result = await apiCall('/soil-reports/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set multipart/form-data
    });
    
    console.log('[API] Upload successful:', result);
    return result;
  } catch (error) {
    console.error('[API] Upload failed:', error.message);
    throw error;
  }
};

export const submitSoilData = async (soilData) => {
  return apiCall('/soil2crop', {
    method: 'POST',
    body: JSON.stringify(soilData),
  });
};

// Crop Image API functions
export const uploadCropImage = async (formData) => {
  return apiCall('/crop-images/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // Remove Content-Type to let browser set multipart/form-data
  });
};

// Alert API functions
export const getAlerts = async (farmerId) => {
  return apiCall(`/alerts/${farmerId}`);
};

export const markAlertAsRead = async (alertId) => {
  return apiCall(`/alerts/${alertId}/read`, {
    method: 'PUT',
  });
};

export const markAllAlertsAsRead = async (farmerId) => {
  return apiCall(`/alerts/farmer/${farmerId}/read-all`, {
    method: 'PUT',
  });
};

export const deleteAlert = async (alertId) => {
  return apiCall(`/alerts/${alertId}`, {
    method: 'DELETE',
  });
};

// Health check
export const healthCheck = async () => {
  return apiCall('/health');
};

// Test database connection
export const testDatabase = async () => {
  return apiCall('/api/test-db');
};

// Government Scheme API functions
export const getSchemeRecommendations = async (criteria) => {
  const params = new URLSearchParams();
  if (criteria.soil_type) params.append('soil_type', criteria.soil_type);
  if (criteria.crop_selected) params.append('crop_selected', criteria.crop_selected);
  if (criteria.field_size) params.append('field_size', criteria.field_size.toString());
  if (criteria.farmer_location) params.append('farmer_location', criteria.farmer_location);
  
  return apiCall(`/api/schemes/recommendations?${params.toString()}`);
};

// Market Price API functions
export const getMarketPrice = async (crop, location) => {
  const params = new URLSearchParams({ crop });
  if (location) params.append('location', location);
  
  return apiCall(`/api/market-prices?${params.toString()}`);
};

export const getAllMarketPrices = async (location) => {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  
  return apiCall(`/api/market-prices/all?${params.toString()}`);
};

// Market Trends API functions
export const getMarketTrends = async (crop, location) => {
  const params = new URLSearchParams({ crop });
  if (location) params.append('location', location);
  
  return apiCall(`/api/market-trends?${params.toString()}`);
};

export const getWeeklyTrendSummary = async (crop, location) => {
  const params = new URLSearchParams({ crop });
  if (location) params.append('location', location);
  
  return apiCall(`/api/market-trends/weekly?${params.toString()}`);
};

// Crop Recommendation API functions
export const getCropRecommendation = async (soilData) => {
  return apiCall('/api/crop-recommendation', {
    method: 'POST',
    body: JSON.stringify(soilData),
  });
};

export const getMarketPrices = async (crop, location) => {
  // Wrapper for backward compatibility
  return getMarketPrice(crop, location);
};

// AI Farmer Assistant API function
export const fetchFarmerAssistant = async (query, language = 'en') => {
  console.log('[API] Sending query to AI assistant:', query, 'Language:', language);
  
  return apiCall('/api/farmer-assistant', {
    method: 'POST',
    body: JSON.stringify({ 
      query,
      language 
    }),
  });
};

export const getSuggestedQuestions = async () => {
  return apiCall('/api/farmer-assistant/suggestions');
};

// Crop Health Analysis API function
export const analyzeCropHealth = async (formData) => {
  console.log('[API] Starting crop health analysis upload...');
  
  try {
    const result = await apiCall('/api/crop-health-analyze', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set multipart/form-data
    });
    
    console.log('[API] Health analysis successful:', result);
    return result;
  } catch (error) {
    console.error('[API] Health analysis failed:', error.message);
    throw error;
  }
};