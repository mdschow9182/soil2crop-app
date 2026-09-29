/**
 * Authentication Middleware
 * Verify JWT tokens for protected routes
 */

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    // Verify token
    if (!process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32)) {
      throw new Error('JWT_SECRET must be configured; production values must contain at least 32 characters');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.userId = decoded.userId;
    req.farmerId = decoded.farmerId;
    req.userMobile = decoded.mobile;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

auth.requireOwner = (paramName) => (req, res, next) => {
  const requestedId = req.params[paramName];
  if (requestedId !== req.userId && requestedId !== req.farmerId) {
    return res.status(403).json({ success: false, message: 'You cannot access another farmer’s data' });
  }
  next();
};

module.exports = auth;
