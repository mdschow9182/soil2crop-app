const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dns = require('node:dns');

// In-memory MongoDB instance (singleton)
let memMongoServer;

/**
 * Optionally override Node's c-ares resolvers for MongoDB SRV/TXT lookups.
 * MONGODB_URI stays the single source of truth; when unset, Node uses its
 * normal resolver (including on cloud hosts). This is useful on networks where
 * the OS resolver works for nslookup but refuses Node's DNS queries.
 */
const configureMongoDnsResolvers = (configuredServers = process.env.MONGODB_DNS_SERVERS) => {
  if (!configuredServers || !configuredServers.trim()) return false;

  const servers = configuredServers.split(',').map((server) => server.trim());
  if (servers.some((server) => !server)) {
    throw new Error('MONGODB_DNS_SERVERS must be a comma-separated list of DNS server IP addresses');
  }

  try {
    dns.setServers(servers);
  } catch (error) {
    throw new Error(`Invalid MONGODB_DNS_SERVERS configuration: ${error.message}`);
  }

  console.log(`MongoDB DNS resolver override enabled (${servers.length} resolver${servers.length === 1 ? '' : 's'}).`);
  return true;
};

/**
 * Start in-memory MongoDB for development/testing
 */
const startMemoryDB = async () => {
  try {
    console.log('Starting in-memory MongoDB...');
    
    // Create in-memory server
    memMongoServer = await MongoMemoryServer.create();
    const mongoUri = memMongoServer.getUri();
    
    console.log('=================================');
    console.log('In-Memory MongoDB Started');
    console.log(`URI: ${mongoUri}`);
    console.log('=================================');
    
    // Connect Mongoose to in-memory DB
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('In-Memory MongoDB Connected');
    return conn;
  } catch (error) {
    console.error('Failed to start in-memory MongoDB:', error.message);
    throw error;
  }
};

const stopMemoryDB = async () => {
  await mongoose.disconnect();
  if (memMongoServer) {
    await memMongoServer.stop();
    memMongoServer = null;
  }
};

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

    // The MongoDB driver resolves mongodb+srv SRV/TXT records through Node's
    // dns.resolve* APIs. Apply an explicit override before mongoose.connect();
    // otherwise leave the host's normal DNS configuration untouched.
    configureMongoDnsResolvers();

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
    } else if (/whitelist|access list|IP address/i.test(error.message)) {
      console.error('Possible cause: the API host IP is not allowed by the MongoDB Atlas network access list.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('Reason: Invalid MongoDB URI hostname.');
    } else if (/TLS|SSL|tlsv\d alert/i.test(error.message)) {
      console.error('Possible cause: TLS negotiation was rejected. Check the host trust store, network inspection/firewall, and Atlas network access settings.');
    }
    
    // Exit process with failure (optional - remove for graceful degradation)
    process.exit(1);
  }
};

module.exports = { connectDB, isConnected, getConnectionStatus, getConnectionInfo, startMemoryDB, stopMemoryDB, configureMongoDnsResolvers };
