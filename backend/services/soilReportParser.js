/**
 * Soil Report Parser Service
 * 
 * Research Relevance:
 * - Attempts automated extraction of soil test values
 * - Logs parsing attempts for accuracy improvement research
 * - Falls back to manual input when automation fails
 * 
 * ACCURACY LIMITATIONS:
 * - PDF parsing depends on document structure (scanned vs digital)
 * - OCR accuracy varies with image quality (70-95% typical)
 * - Field detection uses pattern matching, not guaranteed
 * - ALWAYS allow farmer to correct extracted values
 */

const fs = require('fs');
const path = require('path');

class SoilReportParser {
  /**
   * Parse soil report file (PDF or image)
   * @param {string} filePath - Path to uploaded file
   * @param {string} mimetype - File MIME type
   * @returns {Promise<Object>} - Extracted values with confidence
   */
  async parseSoilReport(filePath, mimetype) {
    const startTime = Date.now();
    const result = {
      success: false,
      extracted: {
        ph: null,
        nitrogen: null,
        phosphorus: null,
        potassium: null,
        soil_type: null
      },
      confidence: {
        overall: 0,
        ph: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0
      },
      raw_text: null,
      parsing_method: null,
      parsing_duration_ms: 0,
      requires_manual_review: true,
      notes: []
    };

    try {
      // Determine parsing method based on file type
      if (mimetype === 'application/pdf') {
        result.parsing_method = 'pdf-parse';
        await this.parsePDF(filePath, result);
      } else if (mimetype.startsWith('image/')) {
        result.parsing_method = 'tesseract-ocr';
        await this.parseImage(filePath, result);
      } else {
        result.notes.push('Unsupported file type for automated parsing');
        result.parsing_method = 'none';
      }

      // Calculate overall confidence
      const confidences = Object.values(result.confidence).filter(c => c > 0);
      result.confidence.overall = confidences.length > 0 
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
        : 0;

      // Determine if manual review is needed
      result.requires_manual_review = result.confidence.overall < 0.7;
      result.success = result.confidence.overall >= 0.5;

      result.parsing_duration_ms = Date.now() - startTime;

      // Log parsing attempt for research
      this.logParsingAttempt(filePath, result);

    } catch (error) {
      console.error('Soil report parsing error:', error);
      result.notes.push(`Parsing error: ${error.message}`);
      result.parsing_duration_ms = Date.now() - startTime;
      this.logParsingAttempt(filePath, result, error);
    }

    return result;
  }

  /**
   * Parse PDF document
   * LIMITATION: Scanned PDFs may not contain extractable text
   */
  async parsePDF(filePath, result) {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse.default(dataBuffer);
      
      result.raw_text = pdfData.text;
      
      // Check if PDF has extractable text
      if (!pdfData.text || pdfData.text.trim().length < 50) {
        result.notes.push('PDF appears to be scanned (no extractable text). OCR may be needed.');
        result.confidence.overall = 0;
        return;
      }

      // Extract values from text
      this.extractSoilValues(pdfData.text, result);
      result.notes.push(`PDF parsed successfully. ${pdfData.numpages} page(s) processed.`);

    } catch (error) {
      result.notes.push(`PDF parsing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse image using OCR
   * LIMITATION: OCR accuracy depends on image quality, lighting, resolution
   */
  async parseImage(filePath, result) {
    try {
      // Dynamic import for tesseract
      const { createWorker } = require('tesseract.js');
      
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();

      result.raw_text = text;

      if (!text || text.trim().length < 20) {
        result.notes.push('OCR produced minimal text. Image quality may be insufficient.');
        result.confidence.overall = 0;
        return;
      }

      // Extract values from OCR text
      this.extractSoilValues(text, result);
      result.notes.push('OCR completed. Text extracted from image.');

    } catch (error) {
      result.notes.push(`OCR failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract soil values from text using pattern matching
   * LIMITATION: Pattern matching is heuristic, not guaranteed
   */
  extractSoilValues(text, result) {
    const lowerText = text.toLowerCase();

    // pH extraction patterns
    const phPatterns = [
      /ph\s*[:=]?\s*(\d+\.?\d*)/i,
      /ph\s*value\s*[:=]?\s*(\d+\.?\d*)/i,
      /soil\s*ph\s*[:=]?\s*(\d+\.?\d*)/i,
      /acidity\s*[:=]?\s*(\d+\.?\d*)/i,
      /(\d+\.?\d*)\s*ph/i
    ];
    result.extracted.ph = this.extractWithPatterns(text, phPatterns, 0, 14);
    result.confidence.ph = result.extracted.ph ? 0.75 : 0;

    // Nitrogen extraction patterns (various units: kg/ha, ppm, %)
    const nitrogenPatterns = [
      /nitrogen\s*\(n\)?\s*[:=]?\s*(\d+\.?\d*)/i,
      /n\s*[:=]?\s*(\d+\.?\d*)\s*(kg\/ha|ppm|mg\/kg|%)?/i,
      /total\s*nitrogen\s*[:=]?\s*(\d+\.?\d*)/i,
      /available\s*n\s*[:=]?\s*(\d+\.?\d*)/i
    ];
    result.extracted.nitrogen = this.extractWithPatterns(text, nitrogenPatterns, 0, 1000);
    result.confidence.nitrogen = result.extracted.nitrogen ? 0.7 : 0;

    // Phosphorus extraction
    const phosphorusPatterns = [
      /phosphorus\s*\(p\)?\s*[:=]?\s*(\d+\.?\d*)/i,
      /p\s*[:=]?\s*(\d+\.?\d*)\s*(kg\/ha|ppm|mg\/kg|%)?/i,
      /available\s*p\s*[:=]?\s*(\d+\.?\d*)/i,
      /p2o5\s*[:=]?\s*(\d+\.?\d*)/i
    ];
    result.extracted.phosphorus = this.extractWithPatterns(text, phosphorusPatterns, 0, 500);
    result.confidence.phosphorus = result.extracted.phosphorus ? 0.7 : 0;

    // Potassium extraction
    const potassiumPatterns = [
      /potassium\s*\(k\)?\s*[:=]?\s*(\d+\.?\d*)/i,
      /k\s*[:=]?\s*(\d+\.?\d*)\s*(kg\/ha|ppm|mg\/kg|%)?/i,
      /available\s*k\s*[:=]?\s*(\d+\.?\d*)/i,
      /k2o\s*[:=]?\s*(\d+\.?\d*)/i
    ];
    result.extracted.potassium = this.extractWithPatterns(text, potassiumPatterns, 0, 1000);
    result.confidence.potassium = result.extracted.potassium ? 0.7 : 0;

    // Soil type extraction
    const soilTypePatterns = [
      /soil\s*type\s*[:=]?\s*(sandy|loamy|clay|silt|peat)/i,
      /soil\s*texture\s*[:=]?\s*(sandy|loamy|clay|silt|peat)/i,
      /texture\s*[:=]?\s*(sandy|loamy|clay|silt|peat)/i
    ];
    result.extracted.soil_type = this.extractSoilType(text, soilTypePatterns);

    // Adjust confidence based on value ranges
    this.validateExtractedValues(result);
  }

  /**
   * Try multiple regex patterns to extract a value
   */
  extractWithPatterns(text, patterns, minVal, maxVal) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        // Validate range
        if (!isNaN(value) && value >= minVal && value <= maxVal) {
          return value;
        }
      }
    }
    return null;
  }

  /**
   * Extract soil type from text
   */
  extractSoilType(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Normalize to standard types
        const type = match[1].toLowerCase();
        if (type.includes('sand')) return 'Sandy';
        if (type.includes('loam')) return 'Loamy';
        if (type.includes('clay')) return 'Clay';
        if (type.includes('silt')) return 'Loamy'; // Silt loam grouped with loamy
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return null;
  }

  /**
   * Validate extracted values and adjust confidence
   */
  validateExtractedValues(result) {
    // pH should be between 3 and 10 for most soils
    if (result.extracted.ph !== null) {
      if (result.extracted.ph < 3 || result.extracted.ph > 10) {
        result.confidence.ph *= 0.5;
        result.notes.push(`pH value ${result.extracted.ph} seems unusual. Please verify.`);
      }
    }

    // Flag if no values were extracted
    const extractedCount = Object.values(result.extracted).filter(v => v !== null).length;
    if (extractedCount === 0) {
      result.notes.push('No soil values could be automatically extracted. Manual input required.');
      result.requires_manual_review = true;
    } else if (extractedCount < 3) {
      result.notes.push(`Only ${extractedCount} value(s) extracted. Please verify and complete remaining fields.`);
      result.requires_manual_review = true;
    }
  }

  /**
   * Log parsing attempts for research analysis
   * Helps improve parsing accuracy over time
   */
  logParsingAttempt(filePath, result, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      filename: path.basename(filePath),
      method: result.parsing_method,
      duration_ms: result.parsing_duration_ms,
      success: result.success,
      confidence: result.confidence,
      extracted_count: Object.values(result.extracted).filter(v => v !== null).length,
      requires_manual_review: result.requires_manual_review,
      error: error ? error.message : null
    };

    // Append to research log file
    const logPath = path.join(__dirname, '..', 'logs', 'parsing-research.log');
    const logDir = path.dirname(logPath);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    console.log('Parsing attempt logged:', logEntry.filename);
  }
}

module.exports = new SoilReportParser();
