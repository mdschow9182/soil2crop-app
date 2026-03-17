// ================================
// LOAD ENVIRONMENT VARIABLES (FIRST)
// ================================
require('dotenv').config();

// ================================
// CORE IMPORTS (ONLY ONCE)
// ================================
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { sanitizeBody, sanitizeQuery } = require("./middleware/sanitization");
const logger = require("./utils/logger");

// ================================
// MONGODB CONNECTION
// ================================
const { connectMongoDB, getConnectionInfo } = require('./mongo.db');

// Connect to MongoDB before starting server
connectMongoDB();

// ================================
// INTERNAL IMPORTS
// ================================
const { parseSoilPDF } = require("./utils/pdfParser");
const { validateId } = require("./middleware/validation");
const { ensureOwnFarmer } = require("./middleware/auth");
const { validateImageFile, validatePdfFile } = require("./utils/fileValidation");

const farmerService = require("./services/farmerService");
const soilService = require("./services/soilService");
const aiService = require("./services/aiService");
const mlService = require("./services/mlCropPrediction");
const alertService = require("./services/alertService");
const cropImageService = require("./services/cropImageService");
const smsService = require("./services/smsService");
const schemeService = require("./services/schemeService");
const marketPriceService = require("./services/marketPriceService");
const weatherService = require("./services/weatherService");
const aiFarmerAssistant = require("./services/aiFarmerAssistant");
const cropHealthService = require("./services/cropHealthService");
const diseaseDetectionService = require("./services/diseaseDetection");

// Import route modules
const farmerRoutes = require('./routes/farmers');
const helpRoutes = require('./routes/help');
const farmerSupportRoutes = require('./routes/farmerSupport');
const cropCalendarRoutes = require('./routes/cropCalendar');

// ================================
// APP INIT
// ================================
const app = express();

// SECURITY: Read environment variables
const PORT = process.env.PORT || 3000;
// CORS: Allow frontend on various ports for development
// 5173 = Vite default, 8080-8084 = common dev ports, 3000 = backend
const CORS_ORIGIN = process.env.CORS_ORIGIN || [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8082",
  "http://localhost:8083",
  "http://localhost:8084",
  "http://localhost:3000"
];
const NODE_ENV = process.env.NODE_ENV || "development";

// Setup CORS with array of allowed origins for demo flexibility
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from any localhost port and from CORS_ORIGIN
    if (!origin) return callback(null, true);
    if (Array.isArray(CORS_ORIGIN) && CORS_ORIGIN.includes(origin)) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));
app.use(express.json());

// ================================
// RATE LIMITING
// ================================
// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);
app.use('/login', authLimiter);
app.use('/auth', authLimiter);
app.use('/alerts', apiLimiter);

// TEMPORARILY DISABLED: Sanitization middleware (debugging)
// Apply sanitization to all JSON body requests
// app.use(sanitizeBody(['soil_report', 'crop_image'])); // Exclude file uploads
// app.use(sanitizeQuery());

// ================================
// UPLOAD DIRECTORIES
// ================================
const uploadsDir = path.join(__dirname, "uploads");
const soilReportsDir = path.join(uploadsDir, "soil-reports");
const cropImagesDir = path.join(uploadsDir, "crop-images");

console.log('[Startup] Creating upload directories...');
[uploadsDir, soilReportsDir, cropImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log('[Startup] Creating directory:', dir);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log('[Startup] Directory exists:', dir);
  }
});
console.log('[Startup] Upload directories ready');

// ================================
// MULTER CONFIG
// ================================
const soilUpload = multer({
  dest: soilReportsDir,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const cropUpload = multer({
  dest: cropImagesDir,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ================================
// MULTER ERROR HANDLER
// ================================
// Handle multer-specific errors before they reach route handlers
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    logger.error('[Multer] File size limit exceeded');
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILES') {
    logger.error('[Multer] Too many files uploaded');
    return res.status(400).json({
      success: false,
      message: 'Only one file allowed per upload.'
    });
  }
  
  if (err.message && err.message.includes('fileFilter')) {
    logger.error('[Multer] File type rejected:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Pass other errors to next handler
  next(err);
});

// ================================
// ROOT
// ================================
app.get("/", (req, res) => {
  res.json({
    message: "Soil2Crop Backend running",
    version: "3.0.0"
  });
});

// ================================
// FARMER API ROUTES (Modular)
// ================================
// Register modular farmer routes at /api/farmers
app.use('/api/farmers', farmerRoutes);

// ================================
// HELP/FEEDBACK API ROUTES
// ================================
// Register help and feedback routes at /api/help
app.use('/api/help', helpRoutes);

// ================================
// FARMER SUPPORT API ROUTES
// ================================
// Register farmer support routes at /api/farmer-support
app.use('/api/farmer-support', farmerSupportRoutes);

// ================================
// CROP CALENDAR API ROUTES
// ================================
// Register crop calendar routes at /api/crop-calendar
app.use('/api/crop-calendar', cropCalendarRoutes);

// ================================
// MARKET TRENDS API ROUTES
// ================================
// Register market trends routes at /api/market-trends
const marketTrendsRoutes = require('./routes/marketTrends');
app.use('/api/market-trends', marketTrendsRoutes);

// ================================
// AI FARMER ASSISTANT API ROUTES
// ================================
// Register AI farmer assistant routes at /api/farmer-assistant
const farmerAssistantRoutes = require('./routes/farmerAssistant');
app.use('/api/farmer-assistant', farmerAssistantRoutes);

// Test upload endpoint
app.get("/upload-test", (req, res) => {
  res.json({
    success: true,
    message: "Upload endpoints available",
    endpoints: {
      soil_upload: "POST /soil-reports/upload",
      crop_upload: "POST /crop-images/upload"
    },
    multer_configured: true,
    upload_dirs: {
      soil_reports: soilReportsDir,
      crop_images: cropImagesDir
    }
  });
});

// ================================
// HEALTH CHECK
// ================================
app.get("/health", (req, res) => {
  const dbInfo = getConnectionInfo();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      type: 'MongoDB',
      ...dbInfo
    }
  });
});

// ================================
// MONGODB TEST ENDPOINT
// ================================
app.get("/api/test-db", (req, res) => {
  const connectionInfo = getConnectionInfo();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    database: {
      ...connectionInfo,
      readyStateMeaning: {
        0: 'disconnected - No connection established',
        1: 'connected - Successfully connected to MongoDB',
        2: 'connecting - Connection attempt in progress',
        3: 'disconnecting - Disconnection in progress',
        4: 'unauthorized - Invalid credentials'
      }[connectionInfo.readyState] || 'unknown state'
    },
    message: connectionInfo.isConnected 
      ? 'MongoDB is connected and operational' 
      : 'MongoDB is NOT connected'
  });
});

// ================================
// LOGIN (Legacy endpoint)
// ================================
app.post("/login", async (req, res) => {
  try {
    logger.info("[Login] Request received", { body: req.body });
    const { name, mobile, language = "en" } = req.body;

    if (!name || !mobile) {
      logger.warn("[Login] Missing required fields", { hasName: !!name, hasMobile: !!mobile });
      return res.status(400).json({ 
        success: false,
        message: "Name and mobile required" 
      });
    }

    const farmer = await farmerService.createOrGetFarmer({ name, mobile, language });
    logger.info("[Login] Success", { farmerId: farmer.id });
    res.json({
      success: true,
      data: {
        farmer_id: farmer.id,
        name: farmer.name,
        language: farmer.language
      }
    });
  } catch (error) {
    logger.error("[Login] Error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
});

// ================================
// AUTH LOGIN (New endpoint - same functionality)
// ================================
app.post("/auth/login", async (req, res) => {
  try {
    logger.info("[Auth/Login] Request received", { body: req.body });
    const { name, mobile, language = "en" } = req.body;

    if (!name || !mobile) {
      logger.warn("[Auth/Login] Missing required fields");
      return res.status(400).json({ 
        success: false,
        message: "Name and mobile required" 
      });
    }

    const farmer = await farmerService.createOrGetFarmer({ name, mobile, language });
    logger.info("[Auth/Login] Success", { farmerId: farmer.id });
    res.json({
      success: true,
      message: "Login successful",
      data: {
        farmer_id: farmer.id,
        name: farmer.name,
        language: farmer.language
      }
    });
  } catch (error) {
    logger.error("[Auth/Login] Error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
});

// ================================
// SOIL REPORT UPLOAD (PDF/IMAGE)
// ================================
app.post(
  "/soil-reports/upload",
  soilUpload.single("soil_report"),
  async (req, res) => {
    try {
      // DETAILED LOGGING FOR DEBUGGING
      logger.info("[Soil/Upload] ====== UPLOAD REQUEST STARTED ======");
      logger.info("[Soil/Upload] Request headers:", JSON.stringify(req.headers, null, 2));
      logger.info("[Soil/Upload] Request body:", JSON.stringify(req.body, null, 2));
      logger.info("[Soil/Upload] Has file:", !!req.file);
      
      if (req.file) {
        logger.info("[Soil/Upload] File details:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          filename: req.file.filename
        });
      } else {
        logger.error("[Soil/Upload] No file received in request");
      }
      
      if (!req.file || !req.body.farmer_id) {
        logger.warn("[Soil/Upload] Missing file or farmer_id", { 
          hasFile: !!req.file, 
          hasFarmerId: !!req.body.farmer_id 
        });
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "File and farmer_id required" 
        });
      }

      const farmerId = req.body.farmer_id;
      logger.info("[Soil/Upload] Processing", { farmerId, filename: req.file.originalname });
      
      // SECURITY: Validate farmer_id is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        logger.error("[Soil/Upload] Invalid farmer_id", { farmerId });
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "Invalid farmer_id: must be a valid MongoDB ObjectId" 
        });
      }

      // SECURITY: Validate file type before processing
      let fileValidation;
      if (req.file.mimetype === 'application/pdf') {
        fileValidation = validatePdfFile(req.file);
      } else if (req.file.mimetype.startsWith('image/')) {
        fileValidation = validateImageFile(req.file);
      } else {
        fileValidation = { valid: false, error: "Unsupported file type" };
      }

      if (!fileValidation.valid) {
        logger.error("[Soil/Upload] File validation failed", { error: fileValidation.error });
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: fileValidation.error 
        });
      }

      const relativePath = `uploads/soil-reports/${req.file.filename}`;
      const mimetype = req.file.mimetype;

      let parseResult;
      let extractedValues = {};

      // Parse based on file type
      if (mimetype === 'application/pdf') {
        logger.info("[Soil/Upload] Parsing PDF");
        parseResult = await parseSoilPDF(req.file.path);
        extractedValues = parseResult.extracted || {};
        const extractedCount = Object.values(extractedValues).filter(v => v !== null && v !== undefined).length;
        if (extractedCount === 0) {
          logger.warn("[Soil/Upload] No values extracted, manual entry required");
          extractedValues = {};
          parseResult.notes = parseResult.notes || ["No readable text found. Manual input required."];
        }
      } else if (mimetype.startsWith('image/')) {
        logger.info("[Soil/Upload] Processing image with OCR");
        // Use the SoilReportParser for images which includes OCR
        const soilReportParser = require('./services/soilReportParser');
        parseResult = await soilReportParser.parseSoilReport(req.file.path, mimetype);
        extractedValues = parseResult.extracted || {};
        const extractedCount = Object.values(extractedValues).filter(v => v !== null && v !== undefined).length;
        if (extractedCount === 0) {
          logger.warn("[Soil/Upload] No values extracted from image, manual entry required");
          extractedValues = {};
          parseResult.notes = parseResult.notes || ["Could not extract values from image. Please enter manually."];
        } else {
          logger.info("[Soil/Upload] Image OCR successful, extracted " + extractedCount + " values");
        }
      }

      // Save to database
      const soilReport = await soilService.createSoilReport({
        farmer_id: farmerId,
        file_path: relativePath,
        ph: extractedValues.ph || null,
        nitrogen: extractedValues.nitrogen || null,
        phosphorus: extractedValues.phosphorus || null,
        potassium: extractedValues.potassium || null,
        soil_type: extractedValues.soil_type || null,
        fertility_level: null
      });

      logger.info("[Soil/Upload] Report created", { reportId: soilReport.id });

      res.json({
        success: true,
        data: {
          extracted_values: extractedValues,
          parsing_notes: parseResult.notes || [],
          report_id: soilReport.id
        }
      });
    } catch (err) {
      logger.error("[Soil/Upload] Critical error:", err.message);
      console.error("Soil report upload error:", err);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          logger.info("[Soil/Upload] File cleaned up after error");
        } catch (cleanupErr) {
          logger.error("[Soil/Upload] Failed to cleanup file:", cleanupErr.message);
        }
      }
      
      res.status(500).json({ 
        success: false,
        message: "Upload failed. Please try again or enter values manually.",
        error: err.message,
        debug: NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
);

// ================================
// SOIL → CROP
// ================================
app.post("/soil2crop", async (req, res) => {
  console.log("[Backend] /soil2crop endpoint hit");
  console.log("[Backend] Request body:", req.body);
  
  const { farmer_id, soilType, pH, nitrogen, phosphorus, potassium } = req.body;

  if (!farmer_id) {
    console.log("[Backend] Missing farmer_id");
    return res.status(400).json({ 
      success: false,
      message: "Missing required field: farmer_id" 
    });
  }

  // Validate farmer_id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(farmer_id)) {
    console.log("[Backend] Invalid farmer_id format:", farmer_id);
    return res.status(400).json({ 
      success: false,
      message: "Invalid farmer_id: must be a valid MongoDB ObjectId" 
    });
  }

  if (!soilType || !pH) {
    console.log("[Backend] Missing soilType or pH");
    return res.status(400).json({ 
      success: false,
      message: "Please provide both pH and Soil Type for crop recommendations" 
    });
  }

  try {
    console.log("[Backend] Generating crop recommendation:", {
      farmer_id: farmer_id,
      soilType,
      pH: Number(pH),
      nitrogen: nitrogen ? Number(nitrogen) : null,
      phosphorus: phosphorus ? Number(phosphorus) : null,
      potassium: potassium ? Number(potassium) : null
    });

    // Prepare data for ML prediction
    const soilData = {
      soil_type: soilType,
      ph: Number(pH),
      nitrogen: nitrogen ? Number(nitrogen) : undefined,
      phosphorus: phosphorus ? Number(phosphorus) : undefined,
      potassium: potassium ? Number(potassium) : undefined,
      season: req.body.season || 'Kharif',
      rainfall_mm: req.body.rainfall_mm ? Number(req.body.rainfall_mm) : undefined,
      temperature_avg: req.body.temperature_avg ? Number(req.body.temperature_avg) : undefined
    };

    let recommendation;
    let method = 'rule-based';

    // Try ML prediction first
    try {
      console.log("[Backend] Attempting ML-based prediction...");
      const mlRecommendation = await mlService.generateRecommendation(soilData);
      
      if (mlRecommendation.success && mlRecommendation.data.ml_predictions) {
        console.log("[Backend] ML prediction successful");
        method = 'ml-based';
        
        // Transform ML response to match frontend expectations
        recommendation = {
          // NEW: ML-based structure
          ml_predictions: mlRecommendation.data.ml_predictions,
          model_version: mlRecommendation.data.model_version,
          disclaimer: mlRecommendation.data.disclaimer,
          
          // LEGACY: Keep for backward compatibility
          recommended_crops: mlRecommendation.data.ml_predictions.map(p => p.crop),
          confidence: mlRecommendation.data.ml_predictions[0]?.probability || 0.8,
          reasoning: `ML-based prediction using ${mlRecommendation.data.model_version}`,
          ai_method: 'machine-learning',
          
          // Soil health (from rule-based as fallback)
          soil_health: {
            score: 75,
            status: 'Good',
            color: '#90EE90',
            description: 'Soil health is good for cultivation',
            recommendations: []
          }
        };
      } else {
        throw new Error('ML prediction did not return valid results');
      }
    } catch (mlError) {
      console.warn("[Backend] ML prediction failed, falling back to rule-based:", mlError.message);
      // Fallback to rule-based AI
      console.log("[Backend] Using rule-based recommendation...");
      method = 'rule-based';
      
      const legacyResult = aiService.generateRecommendation(soilData);
      
      recommendation = {
        ...legacyResult,
        fallback_reason: 'ML prediction unavailable - using rule-based system',
        ml_error: NODE_ENV === 'development' ? mlError.message : undefined
      };
    }

    console.log("[Backend] Recommendation generated:", {
      crops: recommendation.recommended_crops?.length || 0,
      confidence: recommendation.confidence,
      method: method
    });

    res.json({
      success: true,
      method: method,
      data: recommendation
    });
  } catch (err) {
    console.error("[Backend] Crop recommendation error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate recommendation" 
    });
  }
});

// ================================
// CROP IMAGE UPLOAD
// ================================
app.post(
  "/crop-images/upload",
  cropUpload.single("crop_image"),
  async (req, res) => {
    try {
      if (!req.file || !req.body.farmer_id) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "File and farmer_id required" 
        });
      }

      const farmerId = req.body.farmer_id;

      // SECURITY: Validate farmer_id is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "Invalid farmer_id: must be a valid MongoDB ObjectId" 
        });
      }

      // SECURITY: Validate file type before processing
      const fileValidation = validateImageFile(req.file);
      if (!fileValidation.valid) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: fileValidation.error 
        });
      }

      const relativePath = `uploads/crop-images/${req.file.filename}`;

      // Simulate AI analysis
      const analysis = cropImageService.simulateAIAnalysis(req.file.path);

      // Save to database
      const imageRecord = await cropImageService.createCropImage({
        farmer_id: farmerId,
        image_path: relativePath,
        analysis_result: JSON.stringify(analysis),
        health_score: analysis.health_score
      });

      res.json({
        success: true,
        data: {
          image_id: imageRecord.id,
          analysis: analysis
        }
      });
    } catch (err) {
      console.error("Crop image upload error:", err);
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        success: false,
        message: "Image upload failed" 
      });
    }
  }
);

// ================================
// ALERTS (ENABLED)
// ================================
app.get("/alerts/:farmer_id", validateId("farmer_id"), async (req, res) => {
  try {
    const alerts = await alertService.getAlertsByFarmer(req.params.farmer_id);
    res.json({
      success: true,
      data: alerts
    });
  } catch (err) {
    logger.error("Get alerts error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch alerts"
    });
  }
});

app.put("/alerts/:alert_id/read", validateId("alert_id"), async (req, res) => {
  try {
    const result = await alertService.markAsRead(req.params.alert_id);
    res.json({ 
      success: result,
      message: result ? "Alert marked as read" : "Alert not found"
    });
  } catch (err) {
    logger.error("Mark alert as read error:", err);
    res.status(500).json({ success: false });
  }
});

app.put("/alerts/farmer/:farmer_id/read-all", validateId("farmer_id"), async (req, res) => {
  try {
    const count = await alertService.markAllAsRead(req.params.farmer_id);
    res.json({ 
      success: true,
      message: `${count} alerts marked as read`
    });
  } catch (err) {
    logger.error("Mark all alerts as read error:", err);
    res.status(500).json({ success: false });
  }
});

app.delete("/alerts/:alert_id", validateId("alert_id"), async (req, res) => {
  try {
    const result = await alertService.deleteAlert(req.params.alert_id);
    res.json({ 
      success: result,
      message: result ? "Alert deleted" : "Alert not found"
    });
  } catch (err) {
    logger.error("Delete alert error:", err);
    res.status(500).json({ success: false });
  }
});

// Create alert endpoint (for testing/demo purposes)
app.post("/alerts", async (req, res) => {
  try {
    const { farmer_id, message, type = 'info' } = req.body;
    
    if (!farmer_id || !message) {
      return res.status(400).json({
        success: false,
        message: "farmer_id and message are required"
      });
    }
    
    const alert = await alertService.createAlert({ farmer_id, message, type });
    res.json({
      success: true,
      data: alert
    });
  } catch (err) {
    logger.error("Create alert error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to create alert"
    });
  }
});

// ================================
// FARMER LANGUAGE UPDATE (Legacy - kept for backward compatibility)
// The modular route at /api/farmers/:id/language takes precedence
// ================================
// DEPRECATED: Use PUT /api/farmers/:id/language instead
app.put("/farmers/:farmer_id/language", validateId("farmer_id"), async (req, res) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ 
        success: false,
        message: "Language required" 
      });
    }

    await farmerService.updateLanguage(req.params.farmer_id, language);
    res.json({ 
      success: true,
      data: { language } 
    });
  } catch (err) {
    console.error("Update language error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to update language" 
    });
  }
});

// GET farmer by id (Legacy - kept for backward compatibility)
// DEPRECATED: Use GET /api/farmers/:id instead
app.get('/farmers/:farmer_id', validateId('farmer_id'), async (req, res) => {
  try {
    const farmer = await farmerService.getFarmerById(req.params.farmer_id);
    if (!farmer) {
      return res.status(404).json({ success: false, data: null });
    }
    res.json({ success: true, data: farmer });
  } catch (err) {
    console.error('Get farmer error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch farmer' });
  }
});

// ================================
// SMS TEST ENDPOINT (DEMO MODE - DISABLED)
// ================================
app.post("/sms/test", async (req, res) => {
  // SMS is disabled in demo mode
  res.status(503).json({
    success: false,
    message: "SMS service disabled"
  });
});

// ================================
// SMS SERVICE STATUS (DEMO MODE - DISABLED)
// ================================
app.get("/sms/status", (req, res) => {
  res.status(503).json({
    success: false,
    message: "SMS service disabled"
  });
});

// ================================
// WEATHER API ENDPOINTS
// ================================
app.get("/api/weather", async (req, res) => {
  try {
   const { lat, lon } = req.query;
    
   if (!lat || !lon) {
     return res.status(400).json({
       success: false,
       message: "Latitude and longitude are required"
      });
    }

   const weatherData = await weatherService.getWeatherData(parseFloat(lat), parseFloat(lon));
    
   res.json({
     success: true,
     message: "Weather data retrieved",
      data: weatherData
    });
  } catch (err) {
   logger.error("[Weather API] Error:", err);
   res.status(500).json({
     success: false,
     message: "Failed to fetch weather data"
    });
  }
});

// Get 5-day forecast
app.get("/api/weather/forecast", async (req, res) => {
  try {
   const { lat, lon } = req.query;
    
   if (!lat || !lon) {
     return res.status(400).json({
       success: false,
       message: "Latitude and longitude are required"
      });
    }

   const forecast = await weatherService.getForecast(parseFloat(lat), parseFloat(lon));
    
   res.json({
     success: true,
     message: "Forecast data retrieved",
      data: forecast
    });
  } catch (err) {
   logger.error("[Weather Forecast API] Error:", err);
   res.status(500).json({
     success: false,
     message: "Failed to fetch forecast data"
    });
  }
});

// ================================
// SENSOR (SIMULATED)
// ================================
app.get("/sensor/latest", (req, res) => {
  res.json({
    success: true,
    message: "Sensor data retrieved",
    data: {
      moisture: Math.floor(Math.random() * 40) + 30,
      timestamp: new Date().toISOString()
    }
  });
});

// ================================
// GOVERNMENT SCHEME RECOMMENDATIONS
// ================================
app.get("/api/schemes/recommendations", async (req, res) => {
  try {
    const { soil_type, crop_selected, field_size, farmer_location } = req.query;
    
    console.log("[Backend] Scheme recommendations request:", {
      soil_type,
      crop_selected,
      field_size,
      farmer_location
    });

    const recommendations = schemeService.getRecommendations({
      soil_type,
      crop_selected,
      field_size: field_size ? parseFloat(field_size) : null,
      farmer_location
    });

    res.json({
      success: true,
      message: "Scheme recommendations generated",
      data: {
        recommended_schemes: recommendations,
        count: recommendations.length
      }
    });
  } catch (err) {
    console.error("[Backend] Scheme recommendations error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate scheme recommendations"
    });
  }
});

// ================================
// MARKET PRICE API
// ================================
app.get("/api/market-prices", async (req, res) => {
  try {
    const { crop, location } = req.query;
    
    console.log("[Backend] Market price request:", { crop, location });

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required"
      });
    }

    const priceData = marketPriceService.getMarketPrice(crop, location || 'default');

    res.json({
      success: true,
      message: "Market prices retrieved",
      data: priceData
    });
  } catch (err) {
    console.error("[Backend] Market price error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve market prices"
    });
  }
});

// Get all market prices for a location
app.get("/api/market-prices/all", async (req, res) => {
  try {
    const { location } = req.query;
    
    console.log("[Backend] All market prices request:", { location });

    const allPrices = marketPriceService.getAllPrices(location || 'default');

    res.json({
      success: true,
      message: "All market prices retrieved",
      data: {
        prices: allPrices,
        count: allPrices.length,
        location: location || 'All India'
      }
    });
  } catch (err) {
    console.error("[Backend] All market prices error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve market prices"
    });
  }
});

// NEW: Market Intelligence API - Price trends and predictions
app.get("/api/market/intelligence", async (req, res) => {
  try {
    const { crop, location } = req.query;
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required"
      });
    }

    const intelligence = marketPriceService.getMarketIntelligence(crop, location || 'default');

    res.json({
      success: true,
      message: "Market intelligence retrieved",
      data: intelligence
    });
  } catch (err) {
    console.error("[Backend] Market intelligence error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve market intelligence"
    });
  }
});

// NEW: Best Time to Sell API
app.get("/api/market/best-time-to-sell", async (req, res) => {
  try {
    const { crop, location } = req.query;
    
    if (!crop) {
      return res.status(400).json({
        success: false,
        message: "Crop name is required"
      });
    }

    const recommendation = marketPriceService.getBestTimeToSell(crop, location || 'default');

    res.json({
      success: true,
      message: "Selling recommendation generated",
      data: recommendation
    });
  } catch (err) {
    console.error("[Backend] Best time to sell error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendation"
    });
  }
});

// NEW: Profit Estimation API
app.get("/api/market/profit-estimate", async (req, res) => {
  try {
    const { crop, yield_per_acre, total_acres, location } = req.query;
    
    if (!crop || !yield_per_acre || !total_acres) {
      return res.status(400).json({
        success: false,
        message: "Crop, yield per acre, and total acres are required"
      });
    }

    const profitEstimate = marketPriceService.estimateProfit(
      crop, 
      parseFloat(yield_per_acre), 
      parseFloat(total_acres),
      location || 'default'
    );

    res.json({
      success: true,
      message: "Profit estimation calculated",
      data: profitEstimate
    });
  } catch (err) {
    console.error("[Backend] Profit estimate error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to calculate profit estimate"
    });
  }
});

// ================================
// WEATHER API ENDPOINTS
// ================================
app.get("/api/weather", async (req, res) => {
  try {
    const { location } = req.query;
    
    logger.info(`[Weather] Fetching weather data for ${location || 'default location'}`);
    
    const weatherData = await weatherService.getWeatherData(location);
    
    res.json({
      success: true,
      message: "Weather data retrieved successfully",
      data: weatherData
    });
  } catch (err) {
    logger.error("[Weather] Failed to fetch weather data:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      error: err.message
    });
  }
});

// Drought alert endpoint
app.get("/api/weather/drought-alert", async (req, res) => {
  try {
    const { location, days } = req.query;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location parameter is required"
      });
    }
    
    logger.info(`[Weather] Fetching drought alert for ${location} (${days || 7} days)`);
    
    const droughtAlert = await weatherService.getDroughtAlert(location, parseInt(days) || 7);
    
    res.json({
      success: true,
      message: "Drought alert retrieved successfully",
      data: droughtAlert
    });
  } catch (err) {
    logger.error("[Weather] Failed to fetch drought alert:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drought alert",
      error: err.message
    });
  }
});

// ================================
// AI FARMER ASSISTANT
// ================================
// Chat-based Q&A system for farming queries
app.post("/api/farmer-assistant", async (req, res) => {
  try {
    const { query, language = 'en' } = req.body;
    
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }
    
    logger.info("[AI Assistant] Processing query:", query, "Language:", language);
    
    // Pass language parameter to service
    const response = await aiFarmerAssistant.getResponse(query, language);
    
    logger.info("[AI Assistant] Response sent, confidence:", response.confidence, "Language:", language);
    
    res.json(response);
  } catch (error) {
    logger.error("[AI Assistant] Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to process query",
      error: error.message
    });
  }
});

// Get suggested questions
app.get("/api/farmer-assistant/suggestions", (req, res) => {
  try {
    const suggestions = aiFarmerAssistant.getSuggestedQuestions();
    res.json({ suggestions });
  } catch (error) {
    logger.error("[AI Assistant] Failed to get suggestions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get suggestions",
      error: error.message
    });
  }
});

// ================================
// CROP HEALTH ANALYSIS
// ================================
// Analyze crop image for health issues
app.post(
  "/api/crop-health-analyze",
  cropUpload.single("crop_image"),
  async (req, res) => {
    try {
      logger.info("[CropHealth] Request received", { hasFile: !!req.file, hasFarmerId: !!req.body.farmer_id });
      
      if (!req.file || !req.body.farmer_id) {
        logger.warn("[CropHealth] Missing file or farmer_id");
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "Image and farmer_id required" 
        });
      }

      const farmerId = req.body.farmer_id;

      // SECURITY: Validate farmer_id is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        logger.error("[CropHealth] Invalid farmer_id", { farmerId });
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: "Invalid farmer_id" 
        });
      }

      // SECURITY: Validate file type
      const fileValidation = validateImageFile(req.file);
      if (!fileValidation.valid) {
        logger.error("[CropHealth] File validation failed", { error: fileValidation.error });
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false,
          message: fileValidation.error 
        });
      }

      logger.info("[CropHealth] Analyzing image:", req.file.originalname);
      
      // Perform REAL disease detection using CNN model
      const analysisResult = await diseaseDetectionService.detectDisease(req.file.path);
      
      logger.info("[CropHealth] Analysis complete:", {
        disease: analysisResult.data.disease_detected,
        confidence: analysisResult.data.confidence,
        severity: analysisResult.data.severity
      });

      res.json(analysisResult);
    } catch (err) {
      logger.error("[CropHealth] Critical error:", err.message);
      console.error("Crop health analysis error:", err);
      
      // Clean up file on error
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
          logger.info("[CropHealth] File cleaned up after error");
        } catch (cleanupErr) {
          logger.error("[CropHealth] Failed to cleanup file:", cleanupErr.message);
        }
      }
      
      res.status(500).json({ 
        success: false,
        message: "Analysis failed. Please try again.",
        error: err.message
      });
    }
  }
);

// ================================
// FILE UPLOAD SECURITY
// ================================
// NOTE: Uploads are NOT served as static files for security
// Use API endpoints to retrieve file metadata instead
// This prevents directory traversal and unauthorized access
// app.use("/uploads", express.static(uploadsDir)); // DISABLED

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
  console.log("=================================");
  console.log("Soil2Crop Backend RUNNING");
  console.log("Listening on http://localhost:" + PORT);
  console.log("Port:", PORT);
  console.log("Environment:", NODE_ENV);
  console.log("CORS Origin:", CORS_ORIGIN);
  console.log("=================================");
});

module.exports = app;
