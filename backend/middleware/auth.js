/**
 * Basic Authentication Middleware
 * - Prevents data leakage between farmers
 * - Ensures logged-in farmer can only access their own data
 * - Future: Can be extended to JWT-based auth
 */

/**
 * Middleware to verify farmer owns the requested data
 * Prevents accessing other farmers' data by ID
 * Usage: app.get('/alerts/:farmer_id', ensureOwnFarmer('farmer_id'), handler)
 */
function ensureOwnFarmer(paramName = 'farmer_id') {
  return (req, res, next) => {
    const requestedFarmerId = req.params[paramName] || req.body.farmer_id;
    const loggedInFarmerId = req.headers['x-farmer-id'];

    // For demo: Check if logged-in farmer matches requested farmer
    // In production: Would use JWT token instead of header
    if (loggedInFarmerId && String(requestedFarmerId) !== String(loggedInFarmerId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Cannot access other farmers\' data'
      });
    }

    next();
  };
}

module.exports = {
  ensureOwnFarmer
};
