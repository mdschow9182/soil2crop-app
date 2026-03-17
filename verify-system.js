#!/usr/bin/env node

/**
 * Soil2Crop Startup Verification Script
 * Run this to verify all systems are operational
 */

const http = require('http');

const API_URL = 'http://localhost:3000';
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m'
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Backend is running
test('Backend server is reachable', async () => {
  const res = await makeRequest('/');
  if (res.status === 200 && res.data.message) {
    return { pass: true, message: `Backend version: ${res.data.version}` };
  }
  throw new Error('Backend not responding correctly');
});

// Test 2: Health check endpoint
test('Health check endpoint works', async () => {
  const res = await makeRequest('/health');
  if (res.status === 200 && res.data.status === 'ok') {
    return { pass: true, message: `Uptime: ${res.data.uptime.toFixed(2)}s` };
  }
  throw new Error('Health check failed');
});

// Test 3: Database connection
test('Database is accessible', async () => {
  // Try to create a test farmer
  const res = await makeRequest('/login', 'POST', {
    name: 'Test User',
    mobile: '9999999999',
    language: 'en'
  });
  if (res.status === 200 && res.data.success) {
    return { pass: true, message: `Farmer ID: ${res.data.data.farmer_id}` };
  }
  throw new Error('Database operation failed');
});

// Run all tests
async function runTests() {
  log('\n🔍 Soil2Crop System Verification\n', 'info');
  log('Testing backend at: ' + API_URL + '\n', 'info');

  for (const { name, fn } of tests) {
    try {
      const result = await fn();
      passed++;
      log(`✓ ${name}`, 'success');
      if (result.message) {
        log(`  ${result.message}`, 'info');
      }
    } catch (error) {
      failed++;
      log(`✗ ${name}`, 'error');
      log(`  ${error.message}`, 'error');
    }
  }

  log(`\n📊 Results: ${passed} passed, ${failed} failed\n`, failed === 0 ? 'success' : 'error');
  
  if (failed === 0) {
    log('✅ All systems operational!\n', 'success');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Check backend logs.\n', 'error');
    process.exit(1);
  }
}

// Check if backend is running first
http.get(API_URL, () => {
  runTests();
}).on('error', () => {
  log('\n❌ Backend is not running!', 'error');
  log('Start backend with: cd backend && npm start\n', 'warn');
  process.exit(1);
});
