const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SoilReport = require('../models/SoilReport');
const recommendationService = require('../services/recommendationService');
const auth = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'A farmer ID and saved soil report ID are required.', errors: errors.array() });
  next();
};

const createAdvice = async (req, res) => {
  try {
    const { farmer_id: farmerId, reportId, district = null } = req.body;
    if (farmerId !== req.userId && farmerId !== req.farmerId) return res.status(403).json({ success: false, message: 'Cannot request advice for another farmer' });
    if (!mongoose.Types.ObjectId.isValid(farmerId) && farmerId !== req.farmerId) return res.status(400).json({ success: false, message: 'Invalid farmer ID.' });

    const farmer = await User.findOne({ $or: [{ _id: farmerId }, { userId: farmerId }] });
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found.' });
    const report = await SoilReport.findOne({ reportId, userId: farmer.userId });
    if (!report) return res.status(404).json({ success: false, message: 'Soil report not found for this farmer.' });

    const result = await recommendationService.generateRecommendations(farmer.userId, reportId, district);
    return res.json(result);
  } catch (error) {
    console.error('Crop advice request failed:', error);
    return res.status(500).json({ success: false, message: 'Crop advice could not be generated.' });
  }
};

const requiredReportFields = [
  body('farmer_id').notEmpty().withMessage('Farmer ID is required'),
  body('reportId').notEmpty().withMessage('Saved soil report ID is required'),
  validate
];

// Canonical recommendation contract: saved report only; raw OCR/form values are ignored.
router.post('/', auth, requiredReportFields, createAdvice);

// Keep the existing compatibility path, delegating to the exact same verified-data engine.
router.post('/soil-based', auth, requiredReportFields, createAdvice);

module.exports = router;
