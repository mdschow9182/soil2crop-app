// API Service for Soil2Crop Frontend
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const isAndroidLanBuild = import.meta.env.MODE === 'android';

const isPrivateLanIpv4 = (hostname) => {
  const octets = hostname.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false;

  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
};

const pointsToLoopback = (() => {
  if (!configuredApiUrl) return false;
  try {
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(configuredApiUrl).hostname.toLowerCase());
  } catch {
    return false;
  }
})();

const hasSecureProductionUrl = (() => {
  if (!configuredApiUrl || pointsToLoopback) return false;

  try {
    const url = new URL(configuredApiUrl);
    return url.protocol === 'https:'
      || (isAndroidLanBuild && url.protocol === 'http:' && isPrivateLanIpv4(url.hostname));
  } catch {
    return false;
  }
})();

export const API_BASE_URL = import.meta.env.PROD
  ? (hasSecureProductionUrl ? configuredApiUrl : '')
  : (configuredApiUrl || 'http://localhost:5001');

// Helper function for API calls
export const apiCall = async (endpoint, options = {}) => {
  if (!API_BASE_URL) {
    throw new Error('Production API is not configured. Set VITE_API_URL to the reachable production API before building.');
  }
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
  }
  
  // Check if this is a file upload (FormData)
  const isFormDataUpload = options.body instanceof FormData;
  
  const headers = isFormDataUpload
    ? { ...options.headers }
    : {
        'Content-Type': 'application/json',
        ...options.headers,
      };
  if (isFormDataUpload) {
    delete headers['Content-Type'];
    delete headers['content-type'];
  }

  const farmerId = localStorage.getItem('farmer_id');
  if (farmerId && !headers['x-farmer-id']) headers['x-farmer-id'] = farmerId;
  const token = localStorage.getItem('soil2crop_token');
  if (token && !headers.Authorization && !headers.authorization) headers.Authorization = `Bearer ${token}`;

  const config = {
    ...options,
    headers, // Let the browser add the multipart boundary for FormData.
  };
  delete config.params;

  try {
    const response = await fetch(url.toString(), config);
    
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

// Axios-shaped adapter retained for existing imports. All requests share this
// module's base URL and fetch implementation.
const request = async (method, endpoint, data, options = {}) => ({
  data: await apiCall(endpoint, {
    ...options,
    method,
    body: data === undefined ? options.body : (data instanceof FormData ? data : JSON.stringify(data)),
  }),
});

const api = {
  get: (endpoint, options) => request('GET', endpoint, undefined, options),
  post: (endpoint, data, options) => request('POST', endpoint, data, options),
  put: (endpoint, data, options) => request('PUT', endpoint, data, options),
  delete: (endpoint, options) => request('DELETE', endpoint, undefined, options),
  request: (options) => request(options.method || 'GET', options.url, options.data, options),
};

export default api;

// Farmer API functions
export const loginFarmer = async ({ mobile, password, language = 'en' }) => {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ mobile, password, language }),
  });
};

export const registerFarmer = async ({ name, mobile, password, district, language = 'en' }) => apiCall('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({ name, mobile, password, district, language }),
});

export const getFarmerById = async (farmerId) => {
  return apiCall(`/api/farmers/${farmerId}`);
};

export const updateFarmerLanguage = async (farmerId, language) => {
  return apiCall(`/api/farmers/${farmerId}/language`, {
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
    const result = await apiCall('/api/soilreport/upload', {
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
  return apiCall('/api/soilreport', {
    method: 'POST',
    body: JSON.stringify({
      userId: soilData.userId,
      reportId: soilData.reportId,
      soilParameters: soilData.soilParameters,
      nitrogen: soilData.nitrogen,
      phosphorus: soilData.phosphorus,
      potassium: soilData.potassium,
      ph: soilData.ph,
      soilType: soilData.soilType,
    }),
  });
};

export const getSoilReports = async (userId) => {
  return apiCall(`/api/reports/${userId}`);
};

// Crop Image API functions
export const uploadCropImage = async (formData) => {
  return apiCall('/api/crop-images/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // Remove Content-Type to let browser set multipart/form-data
  });
};

// Alert API functions
export const getAlerts = async (farmerId) => {
  return apiCall(`/api/alerts/${farmerId}`);
};

export const markAlertAsRead = async (alertId) => {
  return apiCall(`/api/alerts/${alertId}/read`, {
    method: 'PUT',
  });
};

export const markAllAlertsAsRead = async (farmerId) => {
  return apiCall(`/api/alerts/farmer/${farmerId}/read-all`, {
    method: 'PUT',
  });
};

export const deleteAlert = async (alertId) => {
  return apiCall(`/api/alerts/${alertId}`, {
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

// Existing crop-suggestion API now accepts only a saved, farmer-confirmed report.
export const getVerifiedCropAdvice = async ({ farmerId, reportId, district }) => {
  return apiCall('/api/crop-suggestion', {
    method: 'POST',
    body: JSON.stringify({ farmer_id: farmerId, reportId, district }),
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
