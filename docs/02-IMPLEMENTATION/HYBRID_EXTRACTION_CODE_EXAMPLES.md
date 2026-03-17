# 💻 Hybrid Soil Extraction - Code Examples

## Complete Implementation Examples

This document provides working code examples for integrating the hybrid soil extraction system.

---

## Table of Contents

1. [Backend Integration](#backend-integration)
2. [Frontend Integration](#frontend-integration)
3. [Testing Examples](#testing-examples)
4. [Error Handling](#error-handling)
5. [Customization](#customization)

---

## Backend Integration

### 1. Basic Upload Endpoint

```javascript
// backend/index.js
const express = require('express');
const multer = require('multer');
const { parseSoilPDF } = require('./utils/pdfParser');
const soilReportParser = require('./services/soilReportParser');

const app = express();
const soilUpload = multer({
  dest: 'uploads/soil-reports/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

app.post('/soil-reports/upload', soilUpload.single('soil_report'), async (req, res) => {
  try {
    // Validate input
    if (!req.file || !req.body.farmer_id) {
      return res.status(400).json({
        success: false,
        message: 'File and farmer_id required'
      });
    }

    const { farmer_id } = req.body;
    const { mimetype, path: filePath, filename } = req.file;

    // Parse file based on type
    let parseResult;
    
    if (mimetype === 'application/pdf') {
      console.log('[Upload] Processing PDF...');
      parseResult = await parseSoilPDF(filePath);
    } else if (mimetype.startsWith('image/')) {
      console.log('[Upload] Processing image with OCR...');
      parseResult = await soilReportParser.parseSoilReport(filePath, mimetype);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type'
      });
    }

    // Extract values
    const extractedValues = parseResult.extracted || {};
    
    // Save to database (using your existing service)
    const soilReport = await soilService.createSoilReport({
      farmer_id,
      file_path: `uploads/soil-reports/${filename}`,
      ph: extractedValues.ph || null,
      nitrogen: extractedValues.nitrogen || null,
      phosphorus: extractedValues.phosphorus || null,
      potassium: extractedValues.potassium || null,
      soil_type: extractedValues.soil_type || null
    });

    // Return response
    res.json({
      success: true,
      data: {
        extracted_values: extractedValues,
        parsing_notes: parseResult.notes || [],
        report_id: soilReport.id
      }
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### 2. Advanced Parsing with Retry Logic

```javascript
// backend/utils/advancedPdfParser.js
const { parseSoilPDF } = require('./pdfParser');

async function parseWithRetry(filePath, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Parse] Attempt ${attempt}/${maxRetries}`);
      
      const result = await parseSoilPDF(filePath);
      
      // Check if we got good results
      const extractedCount = Object.values(result.extracted).filter(v => v !== null).length;
      
      if (extractedCount >= 3) {
        console.log(`[Parse] Success: ${extractedCount} values extracted`);
        return result;
      }
      
      // If confidence is low, retry
      if (result.confidence.overall < 0.5 && attempt < maxRetries) {
        console.log(`[Parse] Low confidence (${result.confidence.overall}), retrying...`);
        continue;
      }
      
      return result;
      
    } catch (error) {
      console.error(`[Parse] Attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError;
}

module.exports = { parseWithRetry };
```

---

## Frontend Integration

### 3. React Component with File Upload

```typescript
// frontend/src/components/SoilReportUploader.tsx
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadSoilReport } from '@/api';

interface ExtractedValues {
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  soil_type: string | null;
}

interface UploadResult {
  extracted_values: ExtractedValues;
  parsing_notes: string[];
  report_id: string;
}

export const SoilReportUploader: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedValues, setExtractedValues] = useState<ExtractedValues | null>(null);
  const [parsingNotes, setParsingNotes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF or image files only',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive'
      });
      return;
    }

    setUploadedFile(file);
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('soil_report', file);
      formData.append('farmer_id', localStorage.getItem('farmer_id') || '');

      const result = await uploadSoilReport(formData);

      if (result.success) {
        const data: UploadResult = result.data;
        
        setExtractedValues(data.extracted_values);
        setParsingNotes(data.parsing_notes || []);

        const extractedCount = Object.values(data.extracted_values)
          .filter(v => v !== null && v !== undefined).length;

        toast({
          title: 'Extraction Complete',
          description: `${extractedCount}/5 values extracted successfully`
        });

        // Auto-fill form with extracted values
        autoFillForm(data.extracted_values);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('[Upload] Error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const autoFillForm = (values: ExtractedValues) => {
    // Dispatch custom event or use state management
    const event = new CustomEvent('soil-values-extracted', { detail: values });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn-primary"
        >
          {isUploading ? 'Processing...' : 'Select File'}
        </button>

        {uploadedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {parsingNotes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2">Processing Notes:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
            {parsingNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {extractedValues && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Extracted Values:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(extractedValues).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace('_', ' ')}:</span>
                <span className="font-medium">
                  {value !== null ? value.toString() : 'Not detected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 4. Form with Manual Override

```typescript
// frontend/src/pages/SoilReport.tsx (excerpt)
import { useState, useEffect } from 'react';

export const SoilReport = () => {
  const [formData, setFormData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    soil_type: 'Loamy'
  });

  const [extractedValues, setExtractedValues] = useState<any>(null);

  // Listen for extracted values
  useEffect(() => {
    const handleExtraction = (event: CustomEvent) => {
      const values = event.detail;
      setExtractedValues(values);
      
      // Pre-fill form with extracted values
      if (values.ph) setFormData(prev => ({ ...prev, ph: values.ph.toString() }));
      if (values.nitrogen) setFormData(prev => ({ ...prev, nitrogen: values.nitrogen.toString() }));
      if (values.phosphorus) setFormData(prev => ({ ...prev, phosphorus: values.phosphorus.toString() }));
      if (values.potassium) setFormData(prev => ({ ...prev, potassium: values.potassium.toString() }));
      if (values.soil_type) setFormData(prev => ({ ...prev, soil_type: values.soil_type }));
    };

    window.addEventListener('soil-values-extracted', handleExtraction as EventListener);
    return () => window.removeEventListener('soil-values-extracted', handleExtraction as EventListener);
  }, []);

  const handleSubmit = async () => {
    // Validate pH
    const phNum = parseFloat(formData.ph);
    if (isNaN(phNum) || phNum < 0 || phNum > 14) {
      alert('pH must be between 0 and 14');
      return;
    }

    // Submit to backend
    const payload = {
      farmer_id: localStorage.getItem('farmer_id'),
      ...formData
    };

    const response = await submitSoilData(payload);
    
    if (response.success) {
      // Navigate to recommendations
      navigate('/crop-suggestion', { state: { apiResponse: response } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* pH Field */}
      <div>
        <label className="block text-sm font-medium mb-1">pH Level</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="14"
          value={formData.ph}
          onChange={(e) => setFormData(prev => ({ ...prev, ph: e.target.value }))}
          className="input-field"
          placeholder="7.2"
        />
        {extractedValues?.ph && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Extracted from document: {extractedValues.ph}
          </p>
        )}
      </div>

      {/* Nitrogen Field */}
      <div>
        <label className="block text-sm font-medium mb-1">Nitrogen (kg/ha)</label>
        <input
          type="number"
          value={formData.nitrogen}
          onChange={(e) => setFormData(prev => ({ ...prev, nitrogen: e.target.value }))}
          className="input-field"
          placeholder="220"
        />
        {extractedValues?.nitrogen && (
          <p className="text-xs text-green-600 mt-1">
            ✓ Extracted: {extractedValues.nitrogen} kg/ha
          </p>
        )}
      </div>

      {/* Similar fields for P and K... */}

      <button type="submit" className="btn-primary w-full">
        Get Recommendations
      </button>
    </form>
  );
};
```

---

## Testing Examples

### 5. Unit Test for Value Extraction

```javascript
// backend/tests/extractSoilValues.test.js
const { extractSoilValues } = require('../utils/pdfParser');

describe('extractSoilValues', () => {
  test('should extract pH from various formats', () => {
    const texts = [
      'pH : 7.2',
      'Soil pH - 6.5',
      'pH value: 7.1',
      'Acidity: 6.8'
    ];

    texts.forEach(text => {
      const result = extractSoilValues(text);
      expect(result.extracted.ph).toBeGreaterThan(6);
      expect(result.extracted.ph).toBeLessThan(8);
    });
  });

  test('should extract Nitrogen with units', () => {
    const texts = [
      'Nitrogen (N) : 220 kg/ha',
      'Available N: 180 ppm',
      'N - 200 mg/kg'
    ];

    texts.forEach(text => {
      const result = extractSoilValues(text);
      expect(result.extracted.nitrogen).toBeGreaterThan(100);
      expect(result.extracted.nitrogen).toBeLessThan(300);
    });
  });

  test('should validate pH range', () => {
    const result = extractSoilValues('pH: 15.0'); // Invalid
    expect(result.extracted.ph).toBeNull();
    
    const valid = extractSoilValues('pH: 7.0');
    expect(valid.extracted.ph).toBe(7.0);
  });
});
```

### 6. Integration Test

```javascript
// backend/tests/integration.test.js
const request = require('supertest');
const app = require('../index');
const fs = require('fs');
const path = require('path');

describe('POST /soil-reports/upload', () => {
  test('should upload and extract from digital PDF', async () => {
    const testPdfPath = path.join(__dirname, 'fixtures', 'test-soil-report.pdf');
    
    const response = await request(app)
      .post('/soil-reports/upload')
      .attach('soil_report', testPdfPath)
      .field('farmer_id', '69b1980e8fbc2ab6ba7b0519');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.extracted_values).toHaveProperty('ph');
    expect(response.body.data.extracted_values.ph).toBeGreaterThan(6);
  });

  test('should handle image upload with OCR', async () => {
    const testImagePath = path.join(__dirname, 'fixtures', 'test-report.jpg');
    
    const response = await request(app)
      .post('/soil-reports/upload')
      .attach('soil_report', testImagePath)
      .field('farmer_id', '69b1980e8fbc2ab6ba7b0519');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('should reject invalid file type', async () => {
    const response = await request(app)
      .post('/soil-reports/upload')
      .attach('soil_report', Buffer.from('invalid content'))
      .field('farmer_id', '69b1980e8fbc2ab6ba7b0519');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

---

## Error Handling

### 7. Comprehensive Error Handler

```javascript
// backend/middleware/errorHandler.js
class ExtractionError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ExtractionError';
    this.code = code;
    this.details = details;
  }
}

const handleExtractionErrors = (err, req, res, next) => {
  console.error('[ErrorHandler]', err);

  if (err.name === 'ExtractionError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details
    });
  }

  if (err.message.includes('OCR')) {
    return res.status(503).json({
      success: false,
      message: 'OCR service temporarily unavailable',
      suggestion: 'Please try manual entry or upload a different file'
    });
  }

  if (err.message.includes('timeout')) {
    return res.status(504).json({
      success: false,
      message: 'Processing timeout. File may be too large or complex.',
      suggestion: 'Try uploading a smaller file or enter manually'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    debug: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = { handleExtractionErrors, ExtractionError };
```

### 8. Frontend Error Boundary

```typescript
// frontend/src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900">Something went wrong</h3>
          <p className="text-sm text-red-700 mt-2">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 btn-secondary"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Customization

### 9. Adding Custom Regex Patterns

```javascript
// backend/utils/customPatterns.js
const customPatterns = {
  // Add region-specific patterns
  indiaSpecific: {
    ph: [
      /pH\s*मान\s*[:=-]?\s*(\d+\.?\d*)/i,  // Hindi
      /மண்\s*pH\s*[:=-]?\s*(\d+\.?\d*)/i   // Tamil
    ],
    nitrogen: [
      /नाइट्रोजन\s*[:=-]?\s*(\d+\.?\d*)/i,
      /நைட்ரஜன்\s*[:=-]?\s*(\d+\.?\d*)/i
    ]
  },
  
  // Add laboratory-specific formats
  labFormats: {
    soilHealthCard: [
      /Field\s*No\.\s*\d+\s*\n\s*pH\s*[:=-]?\s*(\d+\.?\d*)/i,
      /Sample\s*ID\s*[:=-]?\s*\w+\s*\n\s*N\s*[:=-]?\s*(\d+)/i
    ]
  }
};

// Merge with main extraction logic
function mergePatterns(basePatterns, customPatterns) {
  return {
    ...basePatterns,
    ...customPatterns
  };
}

module.exports = { customPatterns, mergePatterns };
```

### 10. Confidence Threshold Configuration

```javascript
// backend/config/extraction.config.js
module.exports = {
  // Minimum text length for successful extraction
  MIN_TEXT_LENGTH: 100,
  
  // Minimum OCR text length
  MIN_OCR_TEXT_LENGTH: 50,
  
  // Confidence thresholds
  CONFIDENCE: {
    HIGH: 0.8,    // Auto-accept
    MEDIUM: 0.6,  // Review suggested
    LOW: 0.4      // Manual entry recommended
  },
  
  // Value validation ranges
  RANGES: {
    pH: { min: 3, max: 10, optimal: { min: 6, max: 7.5 } },
    nitrogen: { min: 0, max: 500, unit: 'kg/ha' },
    phosphorus: { min: 0, max: 100, unit: 'kg/ha' },
    potassium: { min: 0, max: 500, unit: 'kg/ha' }
  },
  
  // OCR settings
  OCR: {
    DENSITY: 300,  // DPI
    FORMAT: 'png',
    LANGUAGE: 'eng',
    TIMEOUT: 60000 // ms
  }
};
```

---

## Complete Working Example

### 11. Full-Stack Demo

```javascript
// demo.js - Run this to see the complete system in action
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function demo() {
  console.log('🚀 Soil2Crop Hybrid Extraction Demo\n');
  
  // Create a simple test PDF
  const testPdfContent = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>endobj
4 0 obj<< /Length 150 >>stream
BT/F1 12 Tf 50 700 Td
(SOIL TEST REPORT) Tj 0 -20 Td
(pH : 7.2) Tj 0 -20 Td
(Nitrogen : 220 kg/ha) Tj 0 -20 Td
(Phosphorus : 34 mg/kg) Tj 0 -20 Td
(Potassium : 180 ppm) Tj 0 -20 Td
(Soil Type : Loamy) Tj
ET
endstream endobj
xref 0 5 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n
0000000115 00000 n 0000000214 00000 n
trailer << /Size 5 /Root 1 0 R >> startxref 415 %%EOF`;

  const testPdfPath = path.join(__dirname, 'demo-test.pdf');
  fs.writeFileSync(testPdfPath, testPdfContent);
  
  console.log('📄 Created test PDF\n');
  
  try {
    // Upload
    const formData = new FormData();
    formData.append('soil_report', fs.createReadStream(testPdfPath));
    formData.append('farmer_id', '69b1980e8fbc2ab6ba7b0519');
    
    console.log('📤 Uploading file...');
    const response = await axios.post(
      'http://localhost:3000/soil-reports/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    console.log('\n✅ Upload successful!\n');
    console.log('📊 Extracted Values:');
    console.log(JSON.stringify(response.data.data.extracted_values, null, 2));
    
    console.log('\n📝 Parsing Notes:');
    response.data.data.parsing_notes.forEach(note => console.log(`  • ${note}`));
    
    console.log('\n💾 Report ID:', response.data.data.report_id);
    
    // Cleanup
    fs.unlinkSync(testPdfPath);
    console.log('\n✓ Demo completed!\n');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\nMake sure backend is running: npm run dev\n');
  }
}

// Run demo
demo();
```

---

**These examples provide a complete foundation for integrating the hybrid soil extraction system into your application!** 🎉
