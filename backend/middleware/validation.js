/**
 * Input Validation Middleware (MongoDB Version)
 * - Validates MongoDB ObjectId in params
 * - Prevents invalid data
 */

const mongoose = require('mongoose');

/**
 * Validate that a parameter is a valid MongoDB ObjectId
 * @param {string} value - The value to validate
 * @returns {boolean} - True if valid ObjectId
 */
function isValidId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/**
 * Middleware to validate ID parameters
 * Usage: app.get('/endpoint/:id', validateId('id'), handler)
 */
function validateId(...paramNames) {
  return (req, res, next) => {
    for (const param of paramNames) {
      if (req.params[param]) {
        if (!isValidId(req.params[param])) {
          // Invalid ID format
          return res.status(400).json({
            success: false,
            message: `Invalid ${param}: must be a valid MongoDB ObjectId`
          });
        }
      }
    }
    next();
  };
}

module.exports = {
  isValidId,
  validateId
};
