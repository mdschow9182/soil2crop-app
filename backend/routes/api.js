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
const auth = require('../middleware/auth');

// Auth Routes
const authRoutes = require('./auth');
console.log('Auth routes imported:', !!authRoutes);

// Mount auth routes
router.use('/auth', authRoutes);
console.log('Auth routes mounted at /auth');
console.log('Full auth route path will be: /api/auth/*');

// Soil Report Routes (File Upload)
const soilReportRoutes = require('./soilreport');
console.log('Soil report routes imported:', !!soilReportRoutes);

// Mount soil report routes
router.use('/soilreport', soilReportRoutes);
console.log('Soil report routes mounted at /soilreport');

// Weather Routes
const weatherRoutes = require('./weather');
console.log('Weather routes imported:', !!weatherRoutes);

// Mount weather routes
router.use('/weather', weatherRoutes);
console.log('Weather routes mounted at /weather');

// Crop Suggestion Routes
const cropSuggestionRoutes = require('./cropSuggestion');
console.log('Crop suggestion routes imported:', !!cropSuggestionRoutes);

// Mount crop suggestion routes
router.use('/crop-suggestion', cropSuggestionRoutes);
console.log('Crop suggestion routes mounted at /crop-suggestion');

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const handleErrorResponse = (res, error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  console.error('Server error:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

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

// Account creation lives only at /auth/register so every account requires credentials.

// ============================================
// FARMER FETCH (IMPORTANT FIX)
// ============================================

router.get('/farmers/:farmerId', auth, auth.requireOwner('farmerId'), async (req, res) => {
  try {
    const { farmerId } = req.params;

    console.log('🔍 Fetching farmer:', farmerId);

    const user = await User.findOne({
      userId: farmerId
    });

    if (!user) {
      console.log('❌ Farmer not found:', farmerId);
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    console.log('✅ Farmer found:', farmerId);

    res.json({
      success: true,
      farmer: {
        _id: user._id,
        farmer_id: user.userId,
        name: user.name || 'Farmer',
        mobile: user.mobile,
        district: user.district,
        language: user.language,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Farmer fetch error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch farmer'
    });
  }
});

// ============================================
// UPDATE LANGUAGE
// ============================================

router.put(
  '/farmers/:farmerId/language',
  auth,
  auth.requireOwner('farmerId'),
  [
    body('language').isIn([
      'en', 'hi', 'te', 'ta', 'kn', 'ml'
    ]),
    validate
  ],
  async (req, res) => {
    try {
      const { farmerId } = req.params;
      const { language } = req.body;

      const user = await User.findOneAndUpdate(
        { userId: farmerId },
        { language },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Farmer not found'
        });
      }

      res.json({
        success: true,
        message: 'Language updated',
        farmer: {
          _id: user._id,
          farmer_id: user.userId,
          language: user.language
        }
      });

    } catch (error) {
      console.error('Language update error:', error);

      res.status(500).json({
        success: false,
        message: 'Update failed'
      });
    }
  }
);

// ============================================
// GET SOIL REPORTS
// ============================================

router.get(
  '/reports/:userId',
  auth,
  auth.requireOwner('userId'),
  async (req, res) => {
    try {
      console.log('🔍 Fetching soil reports for user:', req.params.userId);

      const reports = await SoilReport.find({
        userId: req.farmerId
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reports
      });

    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Fetch failed'
      });
    }
  }
);

// ============================================
// RECOMMENDATIONS
// ============================================

router.get(
  '/recommendations/:userId',
  auth,
  auth.requireOwner('userId'),
  async (req, res) => {

    try {

      const {
        reportId,
        district
      } = req.query;

      if (!reportId) {
        return res.status(400).json({
          success: false,
          message: 'reportId is required'
        });
      }

      const result =
        await recommendationService
          .generateRecommendations(
            req.farmerId,
            reportId,
            district
          );

      res.json(result);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: 'Recommendation failed'
      });

    }
  }
);

// ============================================
// FEEDBACK
// ============================================

router.post(
  '/feedback',
  auth,
  [
    body('userId').notEmpty(),
    body('soilReportId').notEmpty(),
    body('cropChosen').notEmpty(),
    validate
  ],
  async (req, res) => {

    try {

      if (req.body.userId !== req.farmerId) return res.status(403).json({ success: false, message: 'Cannot submit feedback for another farmer' });
      const report = await SoilReport.findOne({ reportId: req.body.soilReportId, userId: req.farmerId });
      if (!report) return res.status(404).json({ success: false, message: 'Soil report not found for this farmer' });
      let feedback = await Feedback.create(req.body);

      if (!feedback.feedbackId) {
        feedback.feedbackId = 'FB' + Date.now().toString(36).toUpperCase();
      }

      res.status(201).json({
        success: true,
        message: 'Feedback saved',
        data: feedback
      });

    } catch (error) {
      console.error(error);
      return handleErrorResponse(res, error);
    }
  }
);

// ============================================
// GET CROPS
// ============================================

router.get(
  '/crops',
  async (req, res) => {

    try {

      const crops =
        await Crop.find({});

      res.json({
        success: true,
        data: crops
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: 'Crop fetch failed'
      });

    }
  }
);

// ============================================
// ALERTS (Placeholder endpoints for frontend compatibility)
// ============================================

router.get('/alerts/:farmerId', auth, auth.requireOwner('farmerId'), async (req, res) => {
  // Return empty alerts array
  res.json({
    success: true,
    data: []
  });
});

router.put('/alerts/:alertId/read', auth, async (req, res) => {
  res.json({
    success: true,
    message: 'Alert marked as read'
  });
});

router.put('/alerts/farmer/:farmerId/read-all', auth, auth.requireOwner('farmerId'), async (req, res) => {
  res.json({
    success: true,
    message: 'All alerts marked as read'
  });
});

router.delete('/alerts/:alertId', auth, async (req, res) => {
  res.json({
    success: true,
    message: 'Alert deleted'
  });
});

// ============================================
// GOVERNMENT SCHEMES (Placeholder endpoints)
// ============================================

router.get('/schemes/recommendations', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// ============================================
// MARKET PRICES (Placeholder endpoints)
// ============================================

router.get('/market-prices', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

router.get('/market-prices/all', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

router.get('/market-trends', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

router.get('/market-trends/weekly', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// ============================================
// CROP RECOMMENDATION (Placeholder endpoint)
// ============================================

router.post('/crop-recommendation', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// ============================================
// AI FARMER ASSISTANT (Placeholder endpoint)
// ============================================

router.post('/farmer-assistant', async (req, res) => {
  res.json({
    success: true,
    data: {
      response: 'Assistant feature coming soon'
    }
  });
});

router.get('/farmer-assistant/suggestions', async (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// ============================================
// CROP HEALTH ANALYSIS (Placeholder endpoint)
// ============================================

router.post('/crop-health-analyze', async (req, res) => {
  res.json({
    success: true,
    data: {
      analysis: 'Analysis feature coming soon'
    }
  });
});

// ============================================
// TEST DATABASE CONNECTION
// ============================================

router.get('/test-db', async (req, res) => {
  try {
    // Test database connection
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      success: true,
      connected: isConnected,
      database: mongoose.connection.name || 'N/A',
      host: mongoose.connection.host || 'N/A'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: error.message
    });
  }
});

module.exports = router;
