/**
 * MongoDB Connection Module for Soil2Crop
 * 
 * Handles connection to MongoDB Atlas with proper error handling,
 * connection state monitoring, and graceful shutdown.
 */

const mongoose = require('mongoose');
const { connectDevMongoDB } = require('./dev-connection');

// ============================================
// MONGOOSE CONNECTION READYSTATE VALUES
// ============================================
// 0 = disconnected    - No connection established
// 1 = connected       - Successfully connected ✓
// 2 = connecting      - Connection attempt in progress
// 3 = disconnecting   - Closing connection
// 4 = unauthorized    - Invalid credentials

/**
 * Check if MongoDB is connected
 * @returns {boolean} - true if connected (readyState === 1)
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection status as readable string
 * @returns {string} - Connection status description
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    4: 'unauthorized'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Get detailed connection info
 * @returns {object} - Connection details
 */
const getConnectionInfo = () => {
  return {
    readyState: mongoose.connection.readyState,
    status: getConnectionStatus(),
    host: mongoose.connection.host || 'N/A',
    database: mongoose.connection.name || 'N/A',
    port: mongoose.connection.port || 'N/A',
    isConnected: isConnected()
  };
};

/**
 * Connect to MongoDB Atlas
 * @returns {Promise<Connection>} - Mongoose connection
 */
const connectMongoDB = async () => {
  try {
    // Check if using in-memory DB for development
    if (process.env.USE_MEMORY_DB === 'true') {
      console.log('[MongoDB] Using in-memory database for development');
      return await connectDevMongoDB();
    }

    // Log connection attempt
    console.log('[MongoDB] Connecting to database...');
    console.log(`[MongoDB] Current readyState: ${mongoose.connection.readyState} (${getConnectionStatus()})`);

    // Prevent multiple connection attempts
    if (mongoose.connection.readyState === 1) {
      console.log('[MongoDB] Already connected');
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      console.log('[MongoDB] Connection already in progress...');
      return mongoose.connection;
    }

    // Validate MONGO_URI exists
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined. Please check your .env file.');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoUri, {
      // Connection options for production stability
      maxPoolSize: 10,              // Maximum connections in pool
      serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
      socketTimeoutMS: 45000,       // Close sockets after 45 seconds of inactivity
    });

    // Log successful connection
    console.log('=================================');
    console.log('✅ MongoDB Connected Successfully');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`ReadyState: ${conn.connection.readyState} (connected)`);
    console.log('=================================');

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconnected');
    });

    return conn;

  } catch (error) {
    console.error('=================================');
    console.error('❌ MongoDB Connection Failed');
    console.error(`Error: ${error.message}`);
    console.error('=================================');
    
    // Common error explanations
    if (error.message.includes('ECONNREFUSED')) {
      console.error('[MongoDB] Reason: Cannot reach MongoDB server. Check network/firewall.');
    } else if (error.message.includes('authentication failed')) {
      console.error('[MongoDB] Reason: Invalid username or password in connection string.');
    } else if (error.message.includes('IP')) {
      console.error('[MongoDB] Reason: IP address not whitelisted in MongoDB Atlas.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('[MongoDB] Reason: Invalid MongoDB URI hostname.');
    }
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error('[MongoDB] Error during disconnect:', error.message);
  }
};

module.exports = {
  connectMongoDB,
  disconnectMongoDB,
  isConnected,
  getConnectionStatus,
  getConnectionInfo
};
