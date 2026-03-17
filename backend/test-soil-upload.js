/**
 * Test Soil Upload Endpoint
 * This script tests the /soil-reports/upload endpoint
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testUpload() {
  console.log('=================================');
  console.log('🧪 TESTING SOIL UPLOAD ENDPOINT');
  console.log('=================================\n');

  // Create a test PDF file (dummy)
  const testFilePath = path.join(__dirname, 'test-soil-report.pdf');
  const testContent = '%PDF-1.4\nTest Soil Report\npH: 7.2\nNitrogen: 200\nPhosphorus: 30\nPotassium: 180';
  fs.writeFileSync(testFilePath, testContent);
  
  console.log('✓ Created test file:', testFilePath);

  // Prepare form data
  const formData = new FormData();
  formData.append('soil_report', fs.createReadStream(testFilePath));
  formData.append('farmer_id', '69b1980e8fbc2ab6ba7b0519'); // Sample farmer from seed

  console.log('✓ Form data prepared');
  console.log('  - Field: soil_report (file)');
  console.log('  - Field: farmer_id (69b1980e8fbc2ab6ba7b0519)');
  console.log('');

  try {
    console.log('📡 Sending POST request to http://localhost:3000/soil-reports/upload...');
    
    const response = await axios.post(
      'http://localhost:3000/soil-reports/upload',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ FAILED!');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Error: Backend server is not running on port 3000');
      console.log('Solution: Run "npm start" in backend folder');
    } else {
      console.log('Error:', error.message);
    }
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n✓ Test file cleaned up');
    }

    console.log('\n=================================');
    console.log('TEST COMPLETE');
    console.log('=================================\n');
  }
}

// Run test
testUpload();
