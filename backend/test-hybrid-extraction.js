/**
 * Test Hybrid Soil Report Extraction System
 * 
 * This script tests the complete hybrid extraction workflow:
 * 1. Digital PDF (direct text extraction)
 * 2. Scanned PDF (OCR fallback)
 * 3. Image files (direct OCR)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000';
const TEST_FARMER_ID = '69b1980e8fbc2ab6ba7b0519'; // From seed database

// Test results tracking
const results = {
  digitalPdf: { status: 'PENDING', time: null, extracted: 0 },
  scannedPdf: { status: 'PENDING', time: null, extracted: 0 },
  imageJpg: { status: 'PENDING', time: null, extracted: 0 },
  imagePng: { status: 'PENDING', time: null, extracted: 0 }
};

/**
 * Create test files
 */
function createTestFiles() {
  console.log('📝 Creating test files...\n');
  
  // 1. Digital PDF with clear text
  const digitalPdfPath = path.join(__dirname, 'test-digital-soil-report.pdf');
  const digitalPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 700 Td
(SOIL TEST REPORT) Tj
0 -20 Td
(pH : 7.2) Tj
0 -20 Td
(Nitrogen (N) : 220 kg/ha) Tj
0 -20 Td
(Phosphorus (P) : 34 mg/kg) Tj
0 -20 Td
(Potassium (K) : 180 ppm) Tj
0 -20 Td
(Soil Type : Loamy) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
465
%%EOF`;
  fs.writeFileSync(digitalPdfPath, digitalPdfContent);
  console.log('✓ Created digital PDF:', digitalPdfPath);
  
  // Note: For real testing, you would need actual PDF files
  // These placeholders demonstrate the concept
  
  console.log('\n⚠️  NOTE: For complete testing, please provide:\n');
  console.log('   1. A real digital PDF with extractable text');
  console.log('   2. A scanned PDF (image-based, no text layer)');
  console.log('   3. A JPG image of a soil report');
  console.log('   4. A PNG image of a soil report\n');
  console.log('   Place them in the backend folder and rename this script.\n');
}

/**
 * Test upload endpoint
 */
async function testUpload(fileType, filePath) {
  const testName = fileType.replace(/([A-Z])/g, ' $1').trim();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing ${testName}`);
  console.log(`${'='.repeat(60)}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    console.log('   Skipping test...\n');
    results[fileType].status = 'SKIPPED';
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('soil_report', fs.createReadStream(filePath));
    formData.append('farmer_id', TEST_FARMER_ID);
    
    const startTime = Date.now();
    
    console.log('📡 Sending request...');
    console.log('   File:', path.basename(filePath));
    console.log('   Size:', (fs.statSync(filePath).size / 1024).toFixed(2), 'KB');
    
    const response = await axios.post(
      `${API_URL}/soil-reports/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds for OCR processing
      }
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    results[fileType].time = duration;
    
    if (response.data.success) {
      const extracted = response.data.data.extracted_values || {};
      const extractedCount = Object.values(extracted).filter(v => v !== null && v !== undefined).length;
      
      results[fileType].status = 'SUCCESS';
      results[fileType].extracted = extractedCount;
      
      console.log('\n✅ SUCCESS!\n');
      console.log(`⏱️  Processing time: ${duration}ms`);
      console.log(`📊 Values extracted: ${extractedCount}/5`);
      
      if (extractedCount > 0) {
        console.log('\n📋 Extracted Values:');
        Object.entries(extracted).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`   ✓ ${key}: ${value}`);
          }
        });
      }
      
      if (response.data.data.parsing_notes && response.data.data.parsing_notes.length > 0) {
        console.log('\n📝 Parsing Notes:');
        response.data.data.parsing_notes.forEach((note, idx) => {
          console.log(`   ${idx + 1}. ${note}`);
        });
      }
      
      console.log(`\n💾 Report ID: ${response.data.data.report_id}`);
      
    } else {
      results[fileType].status = 'FAILED';
      console.log('\n❌ FAILED');
      console.log('   Error:', response.data.message || 'Unknown error');
    }
    
  } catch (error) {
    results[fileType].status = 'ERROR';
    console.log('\n💥 ERROR');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   Cannot connect to server');
      console.log('   Make sure backend is running: npm run dev');
    } else if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message || error.message);
    } else {
      console.log('   Message:', error.message);
    }
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const tests = Object.entries(results);
  const passed = tests.filter(([_, r]) => r.status === 'SUCCESS').length;
  const failed = tests.filter(([_, r]) => ['FAILED', 'ERROR'].includes(r.status)).length;
  const skipped = tests.filter(([_, r]) => r.status === 'SKIPPED').length;
  
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}\n`);
  
  console.log('Detailed Results:\n');
  console.log('┌─────────────────────┬──────────┬──────────┬──────────┐');
  console.log('│ Test Type           │ Status   │ Time (ms)│ Extracted│');
  console.log('├─────────────────────┼──────────┼──────────┼──────────┤');
  
  tests.forEach(([type, result]) => {
    const statusIcon = result.status === 'SUCCESS' ? '✅' : 
                       result.status === 'FAILED' ? '❌' : 
                       result.status === 'ERROR' ? '💥' : '⚠️ ';
    
    console.log(`│ ${type.padEnd(19)} │ ${statusIcon} ${result.status.padEnd(6)} │ ${(result.time || 'N/A').toString().padEnd(8)} │ ${(result.extracted || 0).toString().padEnd(8)} │`);
  });
  
  console.log('└─────────────────────┴──────────┴──────────┴──────────┘\n');
  
  // Recommendations
  console.log('💡 Recommendations:\n');
  
  if (results.digitalPdf.status === 'SUCCESS' && results.digitalPdf.extracted >= 4) {
    console.log('✅ Digital PDF extraction working well');
  } else {
    console.log('⚠️  Digital PDF: Check pdf-parse installation and PDF format');
  }
  
  if (results.scannedPdf.status === 'SUCCESS') {
    console.log('✅ OCR fallback for scanned PDFs functional');
  } else {
    console.log('⚠️  Scanned PDF OCR: Verify Tesseract.js and pdf2pic setup');
  }
  
  if (results.imageJpg.status === 'SUCCESS' || results.imagePng.status === 'SUCCESS') {
    console.log('✅ Image OCR processing operational');
  } else {
    console.log('⚠️  Image OCR: Check Tesseract.js configuration');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test completed at:', new Date().toLocaleString());
  console.log('='.repeat(60) + '\n');
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     HYBRID SOIL REPORT EXTRACTION - TEST SUITE          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Check if server is running
  try {
    await axios.get(API_URL, { timeout: 2000 });
    console.log('✅ Backend server is running\n');
  } catch (error) {
    console.log('❌ Backend server not responding!');
    console.log('   Please start the backend: cd backend && npm run dev\n');
    process.exit(1);
  }
  
  // Create test files
  createTestFiles();
  
  // Run tests
  // Note: Replace these paths with actual test file paths
  await testUpload('digitalPdf', path.join(__dirname, 'test-digital-soil-report.pdf'));
  await testUpload('scannedPdf', path.join(__dirname, 'test-scanned-soil-report.pdf'));
  await testUpload('imageJpg', path.join(__dirname, 'test-soil-report.jpg'));
  await testUpload('imagePng', path.join(__dirname, 'test-soil-report.png'));
  
  // Print summary
  printSummary();
}

// Run tests
runTests().catch(console.error);
