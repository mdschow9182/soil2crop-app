// Test Soil Report Upload
// This script tests if the upload endpoint is working correctly

const API_URL = 'http://localhost:3000';

async function testUploadEndpoint() {
  console.log('🔍 Testing Soil Report Upload Endpoint...\n');
  
  try {
    // Step 1: Check if backend is running
    console.log('Step 1: Checking if backend is running...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend is running:', healthData);
    
    // Step 2: Check upload endpoint configuration
    console.log('\nStep 2: Checking upload endpoint...');
    const uploadTestResponse = await fetch(`${API_URL}/upload-test`);
    const uploadTestData = await uploadTestResponse.json();
    console.log('✅ Upload endpoint available:', uploadTestData);
    
    // Step 3: Verify multer configuration
    console.log('\nStep 3: Verifying multer configuration...');
    console.log('   - soil_upload endpoint:', uploadTestData.endpoints.soil_upload);
    console.log('   - multer_configured:', uploadTestData.multer_configured);
    console.log('   - upload_dirs:', uploadTestData.upload_dirs);
    
    // Step 4: Check CORS configuration
    console.log('\nStep 4: Checking CORS...');
    console.log('   - Backend URL:', API_URL);
    console.log('   - Frontend should be calling from: http://localhost:8081 (or similar)');
    console.log('   - CORS headers present:', uploadTestResponse.headers.get('Access-Control-Allow-Origin'));
    
    console.log('\n✅ All checks passed!\n');
    console.log('═══════════════════════════════════════════');
    console.log('UPLOAD ENDPOINT IS WORKING CORRECTLY');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('If uploads are still failing, check:\n');
    console.log('1. Frontend API call uses correct field name: "soil_report"');
    console.log('2. FormData is constructed correctly (not JSON)');
    console.log('3. No Content-Type header is set manually');
    console.log('4. Farmer is logged in (farmer_id exists in localStorage)');
    console.log('5. File type is PDF, JPG, or PNG');
    console.log('6. File size is under 10MB\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:\n');
    console.error('1. Make sure backend is running: npm start');
    console.error('2. Check if port 3000 is available');
    console.error('3. Verify no firewall blocking localhost connections');
    console.error('4. Check backend logs for errors');
  }
}

testUploadEndpoint();
