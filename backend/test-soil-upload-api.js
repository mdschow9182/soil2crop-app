/**
 * Test Soil Upload Backend
 * 
 * This script tests the soil report upload endpoint
 * Run this AFTER starting the server with: node server-soil-upload.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000';

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║        🧪 SOIL UPLOAD BACKEND - TEST SUITE              ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Test results
const results = {
  testEndpoint: { status: 'PENDING', time: null },
  rootEndpoint: { status: 'PENDING', time: null },
  uploadPdf: { status: 'PENDING', time: null, extracted: 0 },
  uploadWithoutFile: { status: 'PENDING', time: null }
};

/**
 * Test 1: GET /test endpoint
 */
async function testRootEndpoint() {
  console.log('📋 Test 1: GET / (Root endpoint)');
  console.log('   URL:', `${API_URL}/`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${API_URL}/`);
    const endTime = Date.now();
    
    results.rootEndpoint.time = endTime - startTime;
    
    if (response.data.success && response.data.message === 'Soil2Crop Upload API') {
      results.rootEndpoint.status = 'SUCCESS';
      console.log('   ✅ PASSED\n');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    } else {
      results.rootEndpoint.status = 'FAILED';
      console.log('   ❌ FAILED - Unexpected response\n');
    }
  } catch (error) {
    results.rootEndpoint.status = 'ERROR';
    console.log('   💥 ERROR:', error.message, '\n');
  }
}

/**
 * Test 2: GET /test endpoint
 */
async function testTestEndpoint() {
  console.log('📋 Test 2: GET /test (Health check)');
  console.log('   URL:', `${API_URL}/test`);
  
  try {
    const startTime = Date.now();
    const response = await axios.get(`${API_URL}/test`);
    const endTime = Date.now();
    
    results.testEndpoint.time = endTime - startTime;
    
    if (response.data.success && response.data.message === 'Backend running successfully') {
      results.testEndpoint.status = 'SUCCESS';
      console.log('   ✅ PASSED\n');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    } else {
      results.testEndpoint.status = 'FAILED';
      console.log('   ❌ FAILED - Unexpected response\n');
    }
  } catch (error) {
    results.testEndpoint.status = 'ERROR';
    console.log('   💥 ERROR:', error.message, '\n');
  }
}

/**
 * Test 3: POST /soil-reports/upload without file
 */
async function testUploadWithoutFile() {
  console.log('\n📋 Test 3: POST /soil-reports/upload (without file - should fail)');
  console.log('   URL:', `${API_URL}/soil-reports/upload`);
  
  try {
    const startTime = Date.now();
    const formData = new FormData();
    formData.append('farmer_id', 'test123');
    
    const response = await axios.post(
      `${API_URL}/soil-reports/upload`,
      formData,
      { headers: formData.getHeaders() }
    );
    const endTime = Date.now();
    
    results.uploadWithoutFile.time = endTime - startTime;
    
    // We expect this to fail with 400 status
    if (response.status === 400 && !response.data.success) {
      results.uploadWithoutFile.status = 'SUCCESS';
      console.log('   ✅ PASSED (Correctly rejected missing file)\n');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    } else {
      results.uploadWithoutFile.status = 'FAILED';
      console.log('   ❌ FAILED - Should have returned 400 error\n');
    }
  } catch (error) {
    results.uploadWithoutFile.status = 'ERROR';
    console.log('   💥 ERROR:', error.message, '\n');
  }
}

/**
 * Test 4: POST /soil-reports/upload with PDF
 */
async function testUploadPdf() {
  console.log('\n📋 Test 4: POST /soil-reports/upload (with PDF file)');
  
  // Create a test PDF
  const testPdfPath = path.join(__dirname, 'test-sample.pdf');
  const pdfContent = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj
4 0 obj<< /Length 100 >>stream
BT/F1 12 Tf 50 700 Td
(TEST SOIL REPORT) Tj 0 -20 Td
(pH : 7.2) Tj
ET
endstream endobj
xref 0 5 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n
0000000115 00000 n 0000000214 00000 n
trailer << /Size 5 /Root 1 0 R >> startxref 365 %%EOF`;
  
  fs.writeFileSync(testPdfPath, pdfContent);
  console.log('   ✓ Created test PDF:', testPdfPath);
  
  try {
    const startTime = Date.now();
    const formData = new FormData();
    formData.append('soil_report', fs.createReadStream(testPdfPath));
    formData.append('farmer_id', 'test-farmer-123');
    
    console.log('   📤 Uploading file...');
    const response = await axios.post(
      `${API_URL}/soil-reports/upload`,
      formData,
      { 
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync()
        }
      }
    );
    const endTime = Date.now();
    
    results.uploadPdf.time = endTime - startTime;
    
    if (response.data.success) {
      results.uploadPdf.status = 'SUCCESS';
      console.log('   ✅ PASSED\n');
      console.log('   Upload Response:');
      console.log('   - Success:', response.data.success);
      console.log('   - Message:', response.data.message);
      console.log('   - Filename:', response.data.file.filename);
      console.log('   - Original Name:', response.data.file.originalname);
      console.log('   - Size:', (response.data.file.size / 1024).toFixed(2), 'KB');
      console.log('   - Processing Time:', results.uploadPdf.time, 'ms');
    } else {
      results.uploadPdf.status = 'FAILED';
      console.log('   ❌ FAILED - Upload failed\n');
      console.log('   Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    results.uploadPdf.status = 'ERROR';
    console.log('   💥 ERROR:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log();
  } finally {
    // Cleanup test file
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
      console.log('   ✓ Cleaned up test file\n');
    }
  }
}

/**
 * Print Summary
 */
function printSummary() {
  console.log('═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60) + '\n');
  
  const tests = Object.entries(results);
  const passed = tests.filter(([_, r]) => r.status === 'SUCCESS').length;
  const failed = tests.filter(([_, r]) => ['FAILED', 'ERROR'].includes(r.status)).length;
  const pending = tests.filter(([_, r]) => r.status === 'PENDING').length;
  
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏳ Pending: ${pending}\n`);
  
  console.log('Detailed Results:\n');
  console.log('┌──────────────────────────────┬──────────┬─────────────┐');
  console.log('│ Test                         │ Status   │ Time (ms)   │');
  console.log('├──────────────────────────────┼──────────┼─────────────┤');
  
  tests.forEach(([name, result]) => {
    const statusIcon = result.status === 'SUCCESS' ? '✅' : 
                       result.status === 'FAILED' ? '❌' : 
                       result.status === 'ERROR' ? '💥' : '⏳';
    
    console.log(`│ ${name.padEnd(28)} │ ${statusIcon} ${result.status.padEnd(6)} │ ${(result.time || 'N/A').toString().padEnd(11)} │`);
  });
  
  console.log('└──────────────────────────────┴──────────┴─────────────┘\n');
  
  if (passed === tests.length) {
    console.log('🎉 ALL TESTS PASSED! Backend is working correctly.\n');
  } else if (failed > 0 || pending > 0) {
    console.log('⚠️  Some tests failed or are pending. Check the logs above.\n');
  }
  
  console.log('═'.repeat(60));
  console.log('Test completed at:', new Date().toLocaleString());
  console.log('═'.repeat(60) + '\n');
}

/**
 * Main test runner
 */
async function runTests() {
  // Check if server is running
  console.log('🔍 Checking if backend server is running...\n');
  
  try {
    await axios.get(API_URL + '/test', { timeout: 2000 });
    console.log('✅ Backend server is running on port 3000\n');
  } catch (error) {
    console.log('❌ Backend server not responding!');
    console.log('   Please start the server first:');
    console.log('   cd backend');
    console.log('   node server-soil-upload.js\n');
    process.exit(1);
  }
  
  // Run all tests
  await testRootEndpoint();
  await testTestEndpoint();
  await testUploadWithoutFile();
  await testUploadPdf();
  
  // Print summary
  printSummary();
}

// Run tests
runTests().catch(console.error);
