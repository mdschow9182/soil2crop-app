const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Models
const User = require('../models/User');
const SoilReport = require('../models/SoilReport');
const Crop = require('../models/Crop');
const Feedback = require('../models/Feedback');

// Services
const recommendationService = require('../services/recommendationService');

// Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// USER ROUTES
// ============================================

/**
 * POST /api/users/register
 * Register a new farmer
 */
router.post('/users/register', [
  body('mobile').isLength({ min: 10, max: 10 }).isNumeric(),
  body('district').notEmpty().trim(),
  body('language').isIn(['en', 'hi', 'te', 'ta', 'kn', 'ml']),
  body('password').isLength({ min: 6 }),
  validate
], async (req, res) => {
  try {
    const { mobile, district, language, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this mobile number'
      });
    }
    
    // Create user
    const user = await User.create({
      mobile,
      district,
      language,
      password
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.userId,
        mobile: user.mobile,
        district: user.district,
        language: user.language
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

/**
 * POST /api/users/login
 * Login user
 */
router.post('/users/login', [
  body('mobile').isLength({ min: 10, max: 10 }),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { mobile, password } = req.body;
    
    const user = await User.findOne({ mobile }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.userId,
        mobile: user.mobile,
        district: user.district,
        language: user.language
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// ============================================
// SOIL REPORT ROUTES
// ============================================

/**
 * POST /api/soilreport
 * Submit soil report
 */
router.post('/soilreport', [
  body('userId').notEmpty(),
  body('nitrogen').isFloat({ min: 0, max: 500 }),
  body('phosphorus').isFloat({ min: 0, max: 100 }),
  body('potassium').isFloat({ min: 0, max: 500 }),
  body('ph').isFloat({ min: 0, max: 14 }),
  body('reportDate').optional().isISO8601(),
  validate
], async (req, res) => {
  try {
    const { userId, nitrogen, phosphorus, potassium, ph, reportDate } = req.body;
    
    const soilReport = await SoilReport.create({
      userId,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      reportDate: reportDate || new Date()
    });
    
    res.status(201).json({
      success: true,
      message: 'Soil report submitted successfully',
      data: {
        reportId: soilReport.reportId,
        nitrogen: soilReport.nitrogen,
        phosphorus: soilReport.phosphorus,
        potassium: soilReport.potassium,
        ph: soilReport.ph,
        confidenceScore: soilReport.confidenceScore,
        confidenceLabel: SoilReport.getConfidenceLabel(soilReport.confidenceScore)
      }
    });
    
  } catch (error) {
    console.error('Soil report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit soil report'
    });
  }
});

/**
 * GET /api/soilreport/:userId
 * Get user's soil reports
 */
router.get('/soilreport/:userId', async (req, res) => {
  try {
    const reports = await SoilReport.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: reports
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch soil reports'
    });
  }
});

// ============================================
// RECOMMENDATION ROUTES
// ============================================

/**
 * GET /api/recommendations/:userId
 * Get crop recommendations
 */
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { reportId, district } = req.query;
    
    if (!reportId || !district) {
      return res.status(400).json({
        success: false,
        message: 'reportId and district are required'
      });
    }
    
    const result = await recommendationService.generateRecommendations(
      userId,
      reportId,
      district
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate recommendations'
    });
  }
});

// ============================================
// FEEDBACK ROUTES
// ============================================

/**
 * POST /api/feedback
 * Submit feedback
 */
router.post('/feedback', [
  body('userId').notEmpty(),
  body('soilReportId').notEmpty(),
  body('cropChosen').notEmpty(),
  body('approximateYield').isFloat({ min: 0 }),
  body('satisfactionLevel').isInt({ min: 1, max: 5 }),
  body('district').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { userId, soilReportId, cropChosen, approximateYield, satisfactionLevel, district } = req.body;
    
    // Get soil report for soil data
    const soilReport = await SoilReport.findOne({ reportId: soilReportId });
    if (!soilReport) {
      return res.status(404).json({
        success: false,
        message: 'Soil report not found'
      });
    }
    
    const feedback = await Feedback.create({
      userId,
      soilReportId,
      cropChosen,
      approximateYield,
      satisfactionLevel,
      district,
      nitrogen: soilReport.nitrogen,
      phosphorus: soilReport.phosphorus,
      potassium: soilReport.potassium,
      ph: soilReport.ph
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        feedbackId: feedback.feedbackId
      }
    });
    
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

/**
 * GET /api/feedback/stats/:district
 * Get feedback statistics for district
 */
router.get('/feedback/stats/:district', async (req, res) => {
  try {
    const stats = await Feedback.getCropStats(req.params.district);
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback stats'
    });
  }
});

// ============================================
// CROP DATABASE ROUTES
// ============================================

/**
 * GET /api/crops
 * Get all crops
 */
router.get('/crops', async (req, res) => {
  try {
    const crops = await Crop.find({}, 'cropId cropName waterRequirement marketVolatility');
    
    res.json({
      success: true,
      data: crops
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crops'
    });
  }
});

module.exports = router;
