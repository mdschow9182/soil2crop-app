/**
 * Input Sanitization Middleware
 * 
 * Prevents XSS and injection attacks by sanitizing user input
 */

const validator = require('validator');

class Sanitizer {
  /**
   * Sanitize string input
   * @param {any} str - Input string to sanitize
   * @returns {any} - Sanitized string
   */
  static sanitizeString(str) {
    // Return as-is if not a string
    if (!str || typeof str !== 'string') {
      return str;
    }
    
    try {
      // Escape HTML special characters to prevent XSS
      return validator.escape(str.trim());
    } catch (error) {
      // If validation fails, return original value
      console.warn('[Sanitizer] Failed to sanitize:', error.message);
      return str;
    }
  }

  /**
   * Sanitize object properties
   * @param {Object} obj - Object with string values to sanitize
   * @param {Array<string>} [excludeFields=[]] - Fields to exclude from sanitization
   * @returns {Object} - Object with sanitized values
   */
  static sanitizeObject(obj, excludeFields = []) {
    // Handle null/undefined/non-object
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = {};
    try {
      for (const [key, value] of Object.entries(obj)) {
        if (excludeFields.includes(key)) {
          sanitized[key] = value;
        } else if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => this.sanitizeObject(item, excludeFields));
        } else if (typeof value === 'object' && value !== null) {
          // Recursively sanitize nested objects
          sanitized[key] = this.sanitizeObject(value, excludeFields);
        } else {
          // Keep numbers, booleans, null, undefined as-is
          sanitized[key] = value;
        }
      }
    } catch (error) {
      console.error('[Sanitizer] Error sanitizing object:', error.message);
      return obj; // Return original on error
    }
    return sanitized;
  }

  /**
   * Sanitize array of objects
   * @param {Array} arr - Array of objects to sanitize
   * @param {Array<string>} [excludeFields=[]] - Fields to exclude
   * @returns {Array} - Array with sanitized objects
   */
  static sanitizeArray(arr, excludeFields = []) {
    if (!Array.isArray(arr)) {
      return arr;
    }
    return arr.map(item => this.sanitizeObject(item, excludeFields));
  }
}

/**
 * Middleware to sanitize request body
 */
const sanitizeBody = (excludeFields = []) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = Sanitizer.sanitizeObject(req.body, excludeFields);
    }
    next();
  };
};

/**
 * Middleware to sanitize request query parameters
 */
const sanitizeQuery = () => {
  return (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
      req.query = Sanitizer.sanitizeObject(req.query);
    }
    next();
  };
};

/**
 * Middleware to sanitize request params
 */
const sanitizeParams = () => {
  return (req, res, next) => {
    if (req.params && typeof req.params === 'object') {
      req.params = Sanitizer.sanitizeObject(req.params);
    }
    next();
  };
};

module.exports = {
  Sanitizer,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams
};
