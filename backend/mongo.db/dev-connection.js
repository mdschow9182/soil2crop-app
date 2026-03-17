/**
 * Development MongoDB Connection
 * Uses MongoDB Memory Server for testing without real MongoDB
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod = null;

const connectDevMongoDB = async () => {
  try {
    console.log('[MongoDB] Starting in-memory MongoDB for development...');
    
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log(`[MongoDB] In-memory MongoDB started at: ${uri}`);
    
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('=================================');
    console.log('✅ MongoDB Connected (In-Memory)');
    console.log('Database: soil2crop (dev mode)');
    console.log('=================================');
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to start in-memory MongoDB:', error.message);
    throw error;
  }
};

const disconnectDevMongoDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      console.log('[MongoDB] In-memory MongoDB stopped');
    }
  } catch (error) {
    console.error('Error stopping in-memory MongoDB:', error.message);
  }
};

module.exports = {
  connectDevMongoDB,
  disconnectDevMongoDB
};
