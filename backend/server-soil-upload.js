/**
 * Soil2Crop Backend - Soil Report Upload Server
 * 
 * A clean, focused Express server for handling soil report uploads.
 * Use this as a standalone server or integrate into your existing index.js
 */

// ================================
// 1. LOAD ENVIRONMENT VARIABLES
// ================================
require('dotenv').config();

// ================================
// 2. CORE IMPORTS
// ================================
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// ================================
// 3. APP CONFIGURATION
// ================================
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for React frontend (localhost:8080)
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// 4. UPLOAD DIRECTORY SETUP
// ================================
const uploadsDir = path.join(__dirname, 'uploads');
const soilReportsDir = path.join(uploadsDir, 'soil-reports');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory:', uploadsDir);
}

if (!fs.existsSync(soilReportsDir)) {
  fs.mkdirSync(soilReportsDir, { recursive: true });
  console.log('✓ Created soil-reports directory:', soilReportsDir);
}

// ================================
// 5. MULTER CONFIGURATION
// ================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, soilReportsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter - only allow PDF and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF and images are allowed.`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ================================
// 6. ROUTES
// ================================

/**
 * GET /test
 * Simple health check endpoint
 */
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend running successfully',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

/**
 * POST /soil-reports/upload
 * Upload a soil report (PDF or image)
 */
app.post('/soil-reports/upload', upload.single('soil_report'), (req, res) => {
  try {
    console.log('\n===== SOIL REPORT UPLOAD RECEIVED =====');
    
    // Check if file was uploaded
    if (!req.file) {
      console.log('❌ No file received in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please attach a soil report file.'
      });
    }

    // Log file details for debugging
    console.log('✓ File uploaded successfully:');
    console.log('  - Original Name:', req.file.originalname);
    console.log('  - MIME Type:', req.file.mimetype);
    console.log('  - Size:', (req.file.size / 1024).toFixed(2), 'KB');
    console.log('  - Saved Path:', req.file.path);
    console.log('  - Field Name:', req.file.fieldname);
    
    // Check for farmer_id in request body
    const farmerId = req.body.farmer_id;
    if (farmerId) {
      console.log('  - Farmer ID:', farmerId);
    } else {
      console.log('  ⚠️  No farmer_id provided (optional field)');
    }

    console.log('=====================================\n');

    // Return success response
    res.json({
      success: true,
      message: 'Soil report uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      farmer_id: farmerId || null
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload soil report',
      error: error.message
    });
  }
});

/**
 * Multer error handler middleware
 */
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.log('❌ File size limit exceeded');
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    console.log('❌ Invalid file type rejected:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Handle other errors
  console.error('❌ Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred during upload'
  });
});

/**
 * GET /
 * Root endpoint with API information
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Soil2Crop Upload API',
    version: '1.0.0',
    endpoints: {
      test: 'GET /test',
      upload: 'POST /soil-reports/upload'
    }
  });
});

// ================================
// 7. START SERVER
// ================================
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║     🌱 SOIL2CROP UPLOAD SERVER RUNNING                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('📍 Server URL: http://localhost:' + PORT);
  console.log('🔗 Test Endpoint: http://localhost:' + PORT + '/test');
  console.log('📤 Upload Endpoint: http://localhost:' + PORT + '/soil-reports/upload');
  console.log('\n✅ CORS enabled for:');
  console.log('   - http://localhost:8080');
  console.log('   - http://localhost:5173');
  console.log('   - http://localhost:3000');
  console.log('\n💾 Files saved to:', soilReportsDir);
  console.log('\n⏰ Server started at:', new Date().toLocaleString());
  console.log('\n' + '='.repeat(60) + '\n');
});

// Export app for testing/integration
module.exports = app;
