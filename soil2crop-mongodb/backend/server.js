const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if using memory database mode (fallback when MongoDB unavailable)
const useMemoryDB = process.env.USE_MEMORY_DB === "true";

if (useMemoryDB) {
  console.log('=================================');
  console.log('⚠️  RUNNING IN MEMORY DATABASE MODE');
  console.log('MongoDB connection disabled');
  console.log('Data will be stored temporarily in RAM');
  console.log('=================================');
} else {
  // Database connection
  const { connectDB, getConnectionInfo } = require('./config/database');
  
  // Connect to MongoDB
  connectDB();
}

// Routes
const apiRoutes = require('./src/routes/api');

// IoT Routes
const iotRoutes = require('./routes/iotRoutes');

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Soil2Crop API',
    version: '1.0.0'
  });
});

// ============================================
// MONGODB CONNECTION TEST ENDPOINT
// ============================================
app.get('/api/test-db', (req, res) => {
  if (useMemoryDB) {
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        mode: 'MEMORY_DB',
        status: 'active',
        readyState: 'N/A - Memory Mode',
        isConnected: true
      },
      message: 'Running in memory database mode - no MongoDB connection'
    });
  }
  
  const connectionInfo = getConnectionInfo();
  
  // Return connection status
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    database: {
      ...connectionInfo,
      // readyState explanation
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

// Simple DB status check (for load balancers)
app.get('/api/db-status', (req, res) => {
  if (useMemoryDB) {
    return res.status(200).json({ 
      status: 'memory-mode', 
      mode: 'in-memory database' 
    });
  }
  
  const info = getConnectionInfo();
  
  if (info.isConnected) {
    res.status(200).json({ status: 'connected', db: info.database });
  } else {
    res.status(503).json({ status: 'disconnected', readyState: info.readyState });
  }
});

// API Routes
app.use('/api', apiRoutes);

// IoT Routes (must be mounted after main API routes)
app.use('/api/iot', iotRoutes);
console.log('[IoT] IoT routes mounted at /api/iot');

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('=================================');
  console.log('Soil2Crop API Server Running');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});

module.exports = app;


