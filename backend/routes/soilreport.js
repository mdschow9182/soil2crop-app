const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { extractDocument } = require('../services/documentExtractor');
const { PARAMETERS } = require('../services/soilParameterConfig');
const auth = require('../middleware/auth');

// Models
const SoilReport = require('../models/SoilReport');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDF, JPG, JPEG, PNG
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// POST /api/soilreport/upload
// File upload endpoint
// ============================================

const processUpload = async (req, res) => {
    try {
      console.log('📥 Soil Report Upload Request');
      console.log('Request Body:', req.body);
      console.log('File Info:', req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');

      // Validate file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please attach a soil report PDF or image.'
        });
      }

      // Validate farmer_id
      const { farmer_id } = req.body;
      
      if (!farmer_id) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }
      if (farmer_id !== req.userId) return res.status(403).json({ success: false, message: 'Cannot upload a report for another farmer' });

      // Check if farmer_id is valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(farmer_id)) {
        console.log('❌ Invalid ObjectId format:', farmer_id);
        return res.status(400).json({
          success: false,
          message: 'Invalid farmer ID format'
        });
      }

      // Verify farmer exists
      const farmer = await User.findOne({ 
        $or: [
          { _id: farmer_id },
          { userId: farmer_id }
        ]
      });

      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: 'Farmer not found'
        });
      }

      console.log('✅ Farmer verified:', farmer.userId);

      const signatures = {
        'application/pdf': Buffer.from('%PDF-'),
        'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]),
        'image/jpg': Buffer.from([0xff, 0xd8, 0xff]),
        'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      };
      const signature = signatures[req.file.mimetype];
      if (!signature || !req.file.buffer.subarray(0, signature.length).equals(signature)) {
        return res.status(400).json({ success: false, message: 'File content does not match its declared format.' });
      }

      let extraction;
      try {
        extraction = await extractDocument({ buffer: req.file.buffer, mimeType: req.file.mimetype });
      } catch (error) {
        console.error('Soil report extraction failed:', error);
        extraction = { status: 'failed', extractionMethod: null, extractedText: '', parameters: Object.fromEntries(Object.keys(PARAMETERS).map((key) => [key, { value: null, unit: null, confidence: 0, status: 'missing', source: null, originalText: null }])), notes: ['The file could not be read. Enter soil values manually.'] };
      }

      const storedParameters = Object.fromEntries(Object.entries(extraction.parameters).map(([key, value]) => [key, { ...value, source: extraction.extractionMethod }]));
      const soilReport = await SoilReport.create({
        userId: farmer.userId || farmer_id,
        filePath: null, fileName: req.file.originalname, fileType: req.file.mimetype, fileSize: req.file.size,
        soilParameters: storedParameters, extractionStatus: extraction.status === 'failed' ? 'failed' : 'pending_review',
        extractionMethod: extraction.extractionMethod, extractedText: extraction.extractedText,
        parsingNotes: extraction.notes, soilType: 'Unknown'
      });

      console.log('✅ Soil report created:', soilReport.reportId);

      // Return success with report
      res.status(201).json({
        success: true,
        message: 'Soil report uploaded successfully',
        report: {
          reportId: soilReport.reportId,
          userId: soilReport.userId,
          createdAt: soilReport.createdAt,
          fileName: soilReport.fileName,
          extractionStatus: soilReport.extractionStatus,
          extractionMethod: soilReport.extractionMethod,
          parameters: soilReport.soilParameters,
          parsingNotes: soilReport.parsingNotes,
          extracted_values: Object.fromEntries(Object.entries(storedParameters).map(([key, item]) => [key, item.value])),
          parsing_notes: soilReport.parsingNotes,
          file: {
            name: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype
          }
        }
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      // Handle multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => ({
          field: e.path,
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Generic error
      res.status(500).json({
        success: false,
        message: 'Upload failed. Please try again.'
      });
    }
};

router.post('/upload', auth, (req, res, next) => upload.single('soil_report')(req, res, (error) => {
  if (!error) return next();
  const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
    ? 'File too large. Maximum size is 10MB.' : error.message || 'Upload failed';
  return res.status(400).json({ success: false, message });
}), processUpload);

// ============================================
// POST /api/soilreport
// Manual data submission (existing endpoint wrapper)
// ============================================

router.post(
  '/',
  auth,
  [
    body('userId').notEmpty().withMessage('userId is required'),
    validate
  ],
  async (req, res) => {
    try {
      console.log('📥 Incoming soil payload:', req.body);

      const { userId: requestedUserId, reportId, soilParameters = {}, ...legacy } = req.body;
      const userId = req.farmerId;
      if (requestedUserId !== userId) return res.status(403).json({ success: false, message: 'Cannot save a report for another farmer' });
      if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
      const accepted = {};
      for (const key of Object.keys(PARAMETERS)) {
        const supplied = soilParameters[key];
        const legacyKey = ({ ph: 'ph', nitrogen: 'nitrogen', phosphorus: 'phosphorus', potassium: 'potassium' })[key];
        const raw = supplied && typeof supplied === 'object' ? supplied.value : (legacyKey ? legacy[legacyKey] : undefined);
        if (raw === '' || raw === undefined || raw === null) {
          accepted[key] = { value: null, unit: supplied?.unit || null, source: 'manual', confidence: 1, status: 'missing' };
          continue;
        }
        const value = Number(raw);
        if (!Number.isFinite(value)) return res.status(400).json({ success: false, message: `${PARAMETERS[key].label} must be numeric` });
        accepted[key] = { value, unit: supplied?.unit || null, source: 'manual', confidence: 1, status: supplied?.status === 'extracted' ? 'verified' : 'manually_entered', originalText: supplied?.originalText || null };
      }
      const scalar = { nitrogen: accepted.nitrogen.value, phosphorus: accepted.phosphorus.value, potassium: accepted.potassium.value, ph: accepted.ph.value };
      let soilReport;
      if (reportId) {
        soilReport = await SoilReport.findOne({ reportId, userId });
        if (!soilReport) return res.status(404).json({ success: false, message: 'Pending soil report not found' });
        soilReport.soilParameters = accepted;
        Object.assign(soilReport, scalar, { soilType: legacy.soilType || soilReport.soilType, extractionStatus: Object.values(accepted).some((item) => item.status === 'verified') ? 'verified' : 'manually_entered', parsingNotes: [] });
        await soilReport.save();
      } else {
        soilReport = await SoilReport.create({ userId, soilParameters: accepted, ...scalar, extractionMethod: 'manual', extractionStatus: 'manually_entered', soilType: legacy.soilType || 'Unknown' });
      }
      const confidenceLabel = SoilReport.getConfidenceLabel(soilReport.confidenceScore);

      res.status(201).json({
        success: true,
        message: 'Soil report saved',
        report: {
          reportId: soilReport.reportId,
          userId: soilReport.userId,
          nitrogen: soilReport.nitrogen,
          phosphorus: soilReport.phosphorus,
          potassium: soilReport.potassium,
          ph: soilReport.ph,
          confidenceScore: soilReport.confidenceScore,
          confidenceLabel,
          createdAt: soilReport.createdAt,
          updatedAt: soilReport.updatedAt
        }
      });

    } catch (error) {
      console.error('Soil error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to save soil report'
      });
    }
  }
);

module.exports = router;
