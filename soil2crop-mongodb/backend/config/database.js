const mongoose = require('mongoose');

// ============================================
// MONGOOSE CONNECTION READYSTATE VALUES
// ============================================
// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting
// 4 = invalid credentials (unauthorized)

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
    99: 'uninitialized'
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
 */
const connectDB = async () => {
  try {
    // Log connection attempt
    console.log('Connecting to MongoDB...');
    console.log(`Current readyState: ${mongoose.connection.readyState} (${getConnectionStatus()})`);

    // Prevent multiple connection attempts
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      console.log('MongoDB connection already in progress...');
      return mongoose.connection;
    }

    // Validate MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection options for production stability
      maxPoolSize: 10,           // Maximum connections in pool
      serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
      socketTimeoutMS: 45000,    // Close sockets after 45 seconds of inactivity
    });

    // Log successful connection
    console.log('=================================');
    console.log('MongoDB Connected Successfully');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`ReadyState: ${conn.connection.readyState} (connected)`);
    console.log('=================================');

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;

  } catch (error) {
    console.error('=================================');
    console.error('MongoDB Connection Failed');
    console.error(`Error: ${error.message}`);
    console.error('=================================');
    
    // Common error explanations
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Reason: Cannot reach MongoDB server. Check network/firewall.');
    } else if (error.message.includes('authentication failed')) {
      console.error('Reason: Invalid username or password in connection string.');
    } else if (error.message.includes('IP')) {
      console.error('Reason: IP address not whitelisted in MongoDB Atlas.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('Reason: Invalid MongoDB URI hostname.');
    }
    
    // Exit process with failure (optional - remove for graceful degradation)
    process.exit(1);
  }
};

module.exports = { connectDB, isConnected, getConnectionStatus, getConnectionInfo };
