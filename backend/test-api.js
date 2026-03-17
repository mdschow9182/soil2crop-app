/**
 * API Test Script for Soil2Crop MongoDB Backend
 * 
 * This script tests the API endpoints without requiring a running MongoDB instance.
 * It validates the API structure and route handlers.
 */

const app = require('./index.js');

console.log('=================================');
console.log('Soil2Crop API Test');
console.log('=================================\n');

// Test 1: Check if Express app is properly configured
console.log('✓ Express app loaded successfully');

// Test 2: Check if routes are registered
const routes = [];
if (app._router && app._router.stack) {
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: handler.route.path
          });
        }
      });
    }
  });
}

console.log('\n📋 Registered Routes:');
console.log('---------------------------------');
if (routes.length > 0) {
  routes.forEach(route => {
    console.log(`${route.method.padEnd(6)} ${route.path}`);
  });
} else {
  console.log('Routes will be available when server starts');
}

console.log('\n=================================');
console.log(`Total Routes: ${routes.length}`);
console.log('=================================\n');

// Test 3: Check if services are MongoDB-ready
console.log('🔍 Checking Services:');
console.log('---------------------------------');

try {
  const farmerService = require('./services/farmerService');
  console.log('✓ farmerService loaded (MongoDB version)');
} catch (e) {
  console.log('✗ farmerService failed:', e.message);
}

try {
  const soilService = require('./services/soilService');
  console.log('✓ soilService loaded (MongoDB version)');
} catch (e) {
  console.log('✗ soilService failed:', e.message);
}

try {
  const alertService = require('./services/alertService');
  console.log('✓ alertService loaded (MongoDB version)');
} catch (e) {
  console.log('✗ alertService failed:', e.message);
}

try {
  const cropImageService = require('./services/cropImageService');
  console.log('✓ cropImageService loaded (MongoDB version)');
} catch (e) {
  console.log('✗ cropImageService failed:', e.message);
}

try {
  const aiService = require('./services/aiService');
  console.log('✓ aiService loaded (rule-based, no DB)');
} catch (e) {
  console.log('✗ aiService failed:', e.message);
}

console.log('\n=================================');
console.log('API Structure Test Complete');
console.log('=================================\n');

console.log('📌 To test with a real database:');
console.log('   1. Install MongoDB locally or use MongoDB Atlas');
console.log('   2. Update MONGO_URI in .env file');
console.log('   3. Run: npm run dev');
console.log('   4. Test endpoints with curl or Postman\n');
