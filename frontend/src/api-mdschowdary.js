// API Service for Soil2Crop Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
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
  return apiCall('/soil-reports/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // Remove Content-Type to let browser set multipart/form-data
  });
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