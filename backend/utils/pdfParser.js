// Hybrid Soil Report Parser with OCR Fallback
// Supports both digital PDFs (direct text extraction) and scanned PDFs (OCR)
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const pdfjsLib = require("pdfjs-dist");
const { fromPath } = require("pdf2pic");


/**
 * Extract soil values from text using pattern matching
 * 
 * OCR is required for scanned PDFs where text cannot be directly extracted.
 * This function handles both standard and OCR-derived text with flexible patterns.
 * 
 * @param {string} text - Raw text from PDF or OCR
 * @param {Object} options - Options (e.g., { sourceType: 'ocr' })
 * @returns {Object} - Extracted values and notes
 */
function extractSoilValues(text, options = {}) {
  const extracted = {
    ph: null,
    nitrogen: null,
    phosphorus: null,
    potassium: null,
    soil_type: null
  };
  const notes = [];

  // pH extraction patterns - supports multiple formats
  const phPatterns = [
    /pH\s*[:=-]?\s*(\d+\.?\d*)/i,               // pH : 6.5 or pH = 6.5
    /ph\s*value\s*[:=-]?\s*(\d+\.?\d*)/i,       // pH value: 7.1
    /soil\s*ph\s*[:=-]?\s*(\d+\.?\d*)/i,        // Soil pH - 7.1
    /acidity\s*[:=-]?\s*(\d+\.?\d*)/i,          // Acidity: 6.5
    /(\d+\.?\d*)\s*(?:pH|ph)/i,                 // 6.5 pH
    /(?:pH|ph)\s*[-–]?\s*(\d+\.?\d*)/i          // pH - 6.5
  ];

  for (const pattern of phPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 14) {
        extracted.ph = value;
        notes.push(`pH detected: ${value}`);
        break;
      }
    }
  }

  // Nitrogen patterns - support kg/ha, ppm, mg/kg
  const nitrogenPatterns = [
    /nitrogen\s*\(n\)?\s*[:=-]?\s*(\d+\.?\d*)/i,        // Nitrogen (N) : 220
    /Nitrogen\s*\(kg\/ha\)\s*[:=-]?\s*(\d+\.?\d*)/i,    // Nitrogen (kg/ha) : 220
    /available\s*nitrogen\s*[:=-]?\s*(\d+\.?\d*)/i,     // Available Nitrogen: 220
    /available\s*n\s*[:=-]?\s*(\d+\.?\d*)/i,            // Available N : 220
    /n\s*[-–]?\s*(\d+\.?\d*)\s*kg\/ha/i,                // N - 220 kg/ha
    /\bn\s*[:=-]?\s*(\d+\.?\d*)\s*(kg\/ha|ppm|mg\/kg|%)?/i
  ];

  for (const pattern of nitrogenPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 2000) {
        extracted.nitrogen = value;
        notes.push(`Nitrogen detected: ${value}`);
        break;
      }
    }
  }

  // Phosphorus patterns
  const phosphorusPatterns = [
    /phosphorus\s*\(p\)?\s*[:=-]?\s*(\d+\.?\d*)/i,      // Phosphorus (P) : 34
    /available\s*phosphorus\s*[:=-]?\s*(\d+\.?\d*)/i,   // Available Phosphorus = 34
    /available\s*p\s*[:=-]?\s*(\d+\.?\d*)/i,            // Available P : 34
    /p2o5\s*[:=-]?\s*(\d+\.?\d*)/i,                     // P2O5 : 50
    /phosphorus\s*[-–]?\s*(\d+\.?\d*)\s*mg\/kg/i,       // Phosphorus - 34 mg/kg
    /\bp\s*[:=-]?\s*(\d+\.?\d*)\s*(kg\/ha|ppm|mg\/kg|%)?/i
  ];

  for (const pattern of phosphorusPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 500) {
        extracted.phosphorus = value;
        notes.push(`Phosphorus detected: ${value}`);
        break;
      }
    }
  }

  // Potassium patterns
  const potassiumPatterns = [
    /potassium\s*\(k\)?\s*[:=-]?\s*(\d+\.?\d*)/i,       // Potassium (K) : 180
    /available\s*potassium\s*[:=-]?\s*(\d+\.?\d*)/i,    // Available Potassium: 180
    /available\s*k\s*[:=-]?\s*(\d+\.?\d*)/i,            // Available K : 180
    /k2o\s*[:=-]?\s*(\d+\.?\d*)/i,                      // K2O : 200
    /potassium\s*k\s*[:=-]?\s*(\d+\.?\d*)/i,            // Potassium K : 180
    /\bk\s*[:=-]?\s*(\d+\.?\d*)\s*(kg\/ha|ppm|mg\/kg|%)?/i
  ];

  for (const pattern of potassiumPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1]);
      if (value >= 0 && value <= 1000) {
        extracted.potassium = value;
        notes.push(`Potassium detected: ${value}`);
        break;
      }
    }
  }

  // Soil type patterns
  const soilTypePatterns = [
    /soil\s*type\s*[:=-]?\s*(sandy|loamy?|clay|silt|peat|silty|gravelly)/i,
    /soil\s*texture\s*[:=-]?\s*(sandy|loamy?|clay|silt|peat|silty|gravelly)/i,
    /texture\s*[:=-]?\s*(sandy|loamy?|clay|silt|peat|silty|gravelly)/i
  ];

  for (const pattern of soilTypePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let type = match[1].toLowerCase();
      if (type.includes('sand')) extracted.soil_type = 'Sandy';
      else if (type.includes('loam')) extracted.soil_type = 'Loamy';
      else if (type.includes('clay')) extracted.soil_type = 'Clay';
      else if (type.includes('silt')) extracted.soil_type = 'Loamy';
      else if (type.includes('gravel')) extracted.soil_type = 'Gravelly';
      else extracted.soil_type = type.charAt(0).toUpperCase() + type.slice(1);
      notes.push(`Soil type detected: ${extracted.soil_type}`);
      break;
    }
  }

  return { extracted, notes };
}

/**
 * Convert PDF page to image buffer using pdf2pic
 * @param {string} filePath - Path to PDF file
 * @param {number} pageNum - Page number (1-based)
 * @returns {Promise<Buffer>} - Image buffer
 */
async function convertPdfPageToImage(filePath, pageNum) {
  try {
    const options = {
      density: 300, // High DPI for better OCR accuracy
      saveFilename: "temp_ocr_page",
      savePath: path.join(__dirname, '..', 'uploads', 'temp'),
      format: "png",
      width: 2480, // A4 size at 300 DPI
      height: 3508,
    };

    // Ensure temp directory exists
    const tempDir = options.savePath;
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const storeAsImage = fromPath(filePath, options);
    const result = await storeAsImage(pageNum, {
      responseType: "buffer"
    });

    return result.buffer;
  } catch (error) {
    console.error("[pdfParser] PDF to image conversion error:", error.message);
    throw error;
  }
}

/**
 * Run OCR on PDF using Tesseract.js
 * Converts PDF to images and runs OCR on each page
 * 
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} - Object containing OCR text and confidence
 */
async function runOCROnPDF(filePath) {
  try {
    console.warn("[pdfParser] Starting OCR on scanned PDF...");
    
    // Load PDF to get page count
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const numPages = pdf.numPages;
    
    let ocrText = '';
    let ocrConfidenceSum = 0;
    let ocrPagesProcessed = 0;

    // Create Tesseract worker
    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`[pdfParser] OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        console.log(`[pdfParser] Processing page ${pageNum}/${numPages}`);
        
        // Convert page to image
        const imageBuffer = await convertPdfPageToImage(filePath, pageNum);
        
        // Run OCR on image
        const result = await worker.recognize(imageBuffer);
        
        ocrText += '\n=== PAGE ' + pageNum + ' ===\n';
        ocrText += result.data.text || '';
        ocrConfidenceSum += result.data.confidence || 0;
        ocrPagesProcessed++;
        
        console.log(`[pdfParser] Page ${pageNum} OCR confidence: ${result.data.confidence}%`);
      } catch (pageError) {
        console.error(`[pdfParser] Error processing page ${pageNum}:`, pageError.message);
        // Continue with next page
      }
    }

    // Terminate worker
    await worker.terminate();

    const avgConfidence = ocrPagesProcessed > 0 ? (ocrConfidenceSum / ocrPagesProcessed) : 0;
    
    console.warn("[pdfParser] OCR completed. Text length:", ocrText.length);
    console.log("[pdfParser] OCR average confidence:", avgConfidence.toFixed(2) + "%");
    
    if (ocrText.length > 0) {
      const preview = ocrText.substring(0, 200).replace(/\n/g, ' ').trim();
      console.log("[pdfParser] OCR text preview:", preview);
    }

    return { text: ocrText, confidence: avgConfidence };
  } catch (ocrErr) {
    console.error("[pdfParser] OCR error:", ocrErr.message);
    throw ocrErr;
  }
}

/**
 * Parse soil report PDF with Text extraction and OCR fallback
 * 
 * Strategy:
 * 1. Try standard text extraction with pdf-parse
 * 2. If text is empty/short, treat as scanned PDF and use OCR
 * 3. Extract soil values from either method
 * 4. Return structured result with confidence scores
 * 
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} - Parse result with extracted values, method used, and confidence
 */
async function parseSoilPDF(filePath) {
  try {
    // ===== VALIDATION =====
    if (!fs.existsSync(filePath)) {
      console.error("[pdfParser] File not found:", filePath);
      return {
        success: true,
        extracted: {
          ph: null,
          nitrogen: null,
          phosphorus: null,
          potassium: null,
          soil_type: null
        },
        notes: ["File not found. Please upload a valid PDF."],
        confidence: {
          overall: 0,
          method: "none"
        }
      };
    }

    const buffer = fs.readFileSync(filePath);
    if (!buffer || buffer.length === 0) {
      return {
        success: true,
        extracted: {
          ph: null,
          nitrogen: null,
          phosphorus: null,
          potassium: null,
          soil_type: null
        },
        notes: ["File is empty. Please upload a valid PDF."],
        confidence: {
          overall: 0,
          method: "none"
        }
      };
    }

    // ===== STEP 1: Try Standard Text Extraction =====
    let data;
    let extractionNotes = [];
    try {
      const pdfParseFunc = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
      data = await pdfParseFunc(buffer);
      const pageCount = (typeof data.numpages === 'number' ? data.numpages : (typeof data.numPages === 'number' ? data.numPages : 0));
      extractionNotes.push(`PDF parsed: ${pageCount} page(s)`);
    } catch (parseErr) {
      console.error("[pdfParser] pdf-parse error:", parseErr.message);
      data = { text: "", numpages: 0 };
      extractionNotes.push("Unable to extract text directly from PDF structure");
    }

    let finalText = '';
    let method = 'none';
    let lowConfidenceReasons = [];

    // ===== STEP 2: Check if Text Extraction Succeeded =====
    if (data.text && data.text.trim().length >= 100) {
      // Text extraction worked
      finalText = data.text.trim();
      method = 'pdf-text';
      console.log("[pdfParser] Text extraction successful, text length:", finalText.length);
    } else {
      // Text extraction failed or insufficient - FALLBACK TO OCR
      console.warn("[pdfParser] Text extraction insufficient (length: " + (data.text?.length || 0) + "). Attempting OCR fallback...");
      extractionNotes.push("No readable text found in PDF. Attempting OCR...");
      
      try {
        // Try OCR fallback
        const ocrResult = await runOCROnPDF(filePath);
        finalText = ocrResult.text;
        method = 'ocr';
        
        if (finalText && finalText.trim().length < 50) {
          // OCR also failed
          extractionNotes.push("OCR also produced minimal text. Manual input required.");
          console.warn("[pdfParser] Both text extraction and OCR failed");
          return {
            success: true,
            extracted: {},
            notes: extractionNotes,
            confidence: { overall: 0, method: 'failed' },
            requires_manual_review: true
          };
        }
        
        console.log("[pdfParser] OCR fallback successful, text length:", finalText.length);
      } catch (ocrError) {
        console.error("[pdfParser] OCR fallback failed:", ocrError.message);
        extractionNotes.push("OCR fallback failed. Manual input required.");
        return {
          success: true,
          extracted: {},
          notes: extractionNotes,
          confidence: { overall: 0, method: 'failed' },
          requires_manual_review: true
        };
      }
    }

    // ===== STEP 3: Extract Soil Values =====
    let extracted = {
      ph: null,
      nitrogen: null,
      phosphorus: null,
      potassium: null,
      soil_type: null
    };
    let extractionPatternNotes = [];

    if (finalText && finalText.length > 10) {
      const result = extractSoilValues(finalText, { sourceType: method });
      extracted = result.extracted;
      extractionPatternNotes = result.notes;
      // Count non-null values
      const extractedCount = Object.values(extracted).filter(v => v !== null).length;
      console.log("[pdfParser] Extracted field count:", extractedCount);
      // If no values extracted, log warning with text length and preview
      if (extractedCount === 0) {
        console.warn("[pdfParser] WARNING: No soil values extracted.", {
          textLength: finalText.length,
          textPreview: finalText.substring(0, 200).replace(/\n/g, ' ').trim()
        });
      }
    } else {
      extractionPatternNotes.push("No text available for extraction");
    }

    // ===== STEP 4: Calculate Confidence Scores =====
    const extractedCount = Object.values(extracted).filter(v => v !== null).length;
    const baseConfidence = Math.min(extractedCount / 5, 1); // 5 possible fields
    
    // Lower confidence for OCR-derived extractions
    const confidenceMultiplier = method === 'ocr' ? 0.7 : (method === 'pdf-text' ? 1.0 : 0);
    const overallConfidence = baseConfidence * confidenceMultiplier;

    const confidence = {
      overall: overallConfidence,
      method: method, // 'pdf-text', 'ocr', 'failed', or 'none'
      ph: extracted.ph ? (method === 'ocr' ? 0.6 : 0.85) : 0,
      nitrogen: extracted.nitrogen ? (method === 'ocr' ? 0.55 : 0.75) : 0,
      phosphorus: extracted.phosphorus ? (method === 'ocr' ? 0.55 : 0.75) : 0,
      potassium: extracted.potassium ? (method === 'ocr' ? 0.55 : 0.75) : 0,
      soil_type: extracted.soil_type ? (method === 'ocr' ? 0.6 : 0.8) : 0
    };

    // ===== STEP 5: Compile Final Notes =====
    const finalNotes = [
      ...extractionNotes,
      ...extractionPatternNotes,
      ...lowConfidenceReasons
    ];

    if (method === 'ocr') {
      finalNotes.push("⚠️ OCR used for scanned PDF - Please verify extracted values");
      finalNotes.push("Extraction confidence: LOW");
    } else if (method === 'pdf-text') {
      finalNotes.push("✓ Text extracted directly from PDF");
      finalNotes.push(`Extraction confidence: ${overallConfidence > 0.7 ? 'MEDIUM' : 'LOW'}`);
    } else {
      finalNotes.push("Unable to extract data. Please enter values manually.");
      finalNotes.push("Extraction confidence: NONE");
    }

    if (extractedCount === 0) {
      finalNotes.push("No soil values found. Please enter values manually.");
    } else if (extractedCount < 3) {
      finalNotes.push(`Only ${extractedCount}/${5} value(s) extracted. Please complete remaining fields.`);
    }

    // ===== STEP 6: Return Structured Response =====
    return {
      success: true,
      extracted: {
        ph: extracted.ph,
        nitrogen: extracted.nitrogen,
        phosphorus: extracted.phosphorus,
        potassium: extracted.potassium,
        soil_type: extracted.soil_type
      },
      notes: finalNotes,
      confidence: confidence,
      requires_manual_review: overallConfidence < 0.6
    };

  } catch (err) {
    console.error("[pdfParser] Unexpected error:", err);
    return {
      success: true,
      extracted: {
        ph: null,
        nitrogen: null,
        phosphorus: null,
        potassium: null,
        soil_type: null
      },
      notes: [`Unexpected error during parsing: ${err.message}. Please enter values manually.`],
      confidence: {
        overall: 0,
        method: "failed"
      },
      requires_manual_review: true
    };
  }
}

module.exports = { parseSoilPDF, extractSoilValues, runOCROnPDF };
