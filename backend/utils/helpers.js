/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Format date to ISO string
 */
const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Generate random ID
 */
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Calculate confidence score based on data quality
 */
const calculateConfidenceScore = (data) => {
  let score = 100;
  
  // Reduce score for missing fields
  if (!data.nitrogen) score -= 20;
  if (!data.phosphorus) score -= 20;
  if (!data.potassium) score -= 20;
  if (!data.ph) score -= 20;
  
  // Reduce score for out-of-range values
  if (data.ph && (data.ph < 0 || data.ph > 14)) score -= 10;
  if (data.nitrogen && (data.nitrogen < 0 || data.nitrogen > 500)) score -= 10;
  
  return Math.max(0, score);
};

/**
 * Validate soil parameters
 */
const validateSoilParams = (params) => {
  const errors = [];
  
  if (params.ph && (params.ph < 0 || params.ph > 14)) {
    errors.push('pH must be between 0 and 14');
  }
  
  if (params.nitrogen && (params.nitrogen < 0 || params.nitrogen > 500)) {
    errors.push('Nitrogen must be between 0 and 500');
  }
  
  if (params.phosphorus && (params.phosphorus < 0 || params.phosphorus > 100)) {
    errors.push('Phosphorus must be between 0 and 100');
  }
  
  if (params.potassium && (params.potassium < 0 || params.potassium > 500)) {
    errors.push('Potassium must be between 0 and 500');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Sleep utility for delays
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  formatDate,
  generateId,
  calculateConfidenceScore,
  validateSoilParams,
  sleep
};
