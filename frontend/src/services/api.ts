import api from '@/api';

type ApiPayload = Record<string, unknown>;

/**
 * API Service Methods
 */
const apiService = {
  // Health check
  health: () => api.get('/health'),

  // User endpoints
  register: (data: ApiPayload) => api.post('/api/auth/register', data),
  login: (data: ApiPayload) => api.post('/api/auth/login', data),

  // Soil report endpoints
  submitSoilReport: (data: ApiPayload) => api.post('/api/soilreport', data),
  getSoilReports: (userId: string) => api.get(`/api/reports/${userId}`),

  // Recommendation endpoints
  getRecommendations: (userId: string, params: ApiPayload) => 
    api.get(`/api/recommendations/${userId}`, { params }),

  // Crop endpoints
  getCrops: () => api.get('/api/crops'),

  // IoT endpoints
  getSensorData: (farmerId: string) => 
    api.get(`/api/iot/sensor-data/${farmerId}`),
  updateSensorData: (data: ApiPayload) => api.post('/api/iot/sensor-data', data),
  getSensorHistory: (farmerId: string) => 
    api.get(`/api/iot/sensor-history/${farmerId}`),

  // Feedback endpoints
  submitFeedback: (data: ApiPayload) => api.post('/api/feedback', data),
  getFeedbackStats: (district: string) => 
    api.get(`/api/feedback/stats/${district}`),

  // Generic request method
  request: (config: ApiPayload) => api.request(config),
};

export default api;
export { apiService };
