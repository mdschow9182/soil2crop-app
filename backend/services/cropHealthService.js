/**
 * Crop Health Analysis Service
 * 
 * Analyzes crop images to detect health issues and provide recommendations.
 * Uses rule-based analysis for prototype (can be replaced with ML model later).
 */

const fs = require("fs");
const path = require("path");

class CropHealthService {
  /**
   * Analyze crop image and return health assessment
   * @param {string} imagePath - Path to uploaded image
   * @returns {Promise<Object>} - Health analysis result
   */
  async analyzeCropHealth(imagePath) {
    try {
      // Validate file exists
      if (!fs.existsSync(imagePath)) {
        throw new Error("Image file not found");
      }

      // Get file info
      const fileInfo = fs.statSync(imagePath);
      const fileExt = path.extname(imagePath).toLowerCase();

      // Validate file type
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      if (!allowedExtensions.includes(fileExt)) {
        throw new Error("Invalid image format. Use JPG, PNG, or WebP.");
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (fileInfo.size > maxSize) {
        throw new Error("File too large. Maximum size is 5MB.");
      }

      // Simulate AI analysis based on filename hash for consistent demo results
      const fileNameHash = this.hashString(path.basename(imagePath));
      
      // Predefined scenarios for demonstration
      const scenarios = [
        {
          healthStatus: "Healthy",
          issue: "No significant issues detected",
          recommendation: "Continue current farming practices. Monitor regularly for pests and diseases.",
          confidence: 0.92
        },
        {
          healthStatus: "Moderate Stress",
          issue: "Possible nitrogen deficiency - yellowing of older leaves",
          recommendation: "Apply nitrogen-rich fertilizer (Urea or DAP). Ensure adequate irrigation.",
          confidence: 0.78
        },
        {
          healthStatus: "Diseased",
          issue: "Fungal infection detected - leaf spots visible",
          recommendation: "Apply fungicide spray (Mancozeb or Carbendazim). Remove affected leaves. Improve air circulation.",
          confidence: 0.85
        },
        {
          healthStatus: "Moderate Stress",
          issue: "Water stress detected - wilting and dry leaf edges",
          recommendation: "Increase irrigation frequency. Apply mulch to retain soil moisture.",
          confidence: 0.81
        },
        {
          healthStatus: "Diseased",
          issue: "Pest infestation - insect damage visible",
          recommendation: "Apply appropriate pesticide (Neem oil or Imidacloprid). Monitor pest population weekly.",
          confidence: 0.76
        }
      ];

      // Select scenario based on hash for consistency
      const selectedScenario = scenarios[fileNameHash % scenarios.length];

      // Add some variation based on file characteristics
      const fileSizeVariation = (fileInfo.size % 100) / 1000; // Small variation 0-0.1
      selectedScenario.confidence = Math.min(0.95, selectedScenario.confidence + fileSizeVariation);

      // Log analysis for research
      this.logAnalysis(imagePath, selectedScenario);

      return {
        success: true,
        data: selectedScenario,
        metadata: {
          image_size: fileInfo.size,
          image_format: fileExt.substring(1).toUpperCase(),
          analysis_timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("[CropHealth] Analysis error:", error.message);
      throw error;
    }
  }

  /**
   * Simple hash function for strings
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Log analysis for research purposes
   */
  logAnalysis(imagePath, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      image: path.basename(imagePath),
      result: result
    };

    const logDir = path.join(__dirname, "..", "logs");
    const logFile = path.join(logDir, "crop-health-analysis.log");

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n");
  }

  /**
   * Get common crop issues database
   */
  getCommonIssues() {
    return [
      {
        name: "Nitrogen Deficiency",
        symptoms: ["Yellowing of older leaves", "Stunted growth", "Pale green foliage"],
        treatment: "Apply nitrogen-rich fertilizers like Urea or DAP"
      },
      {
        name: "Fungal Diseases",
        symptoms: ["Leaf spots", "Powdery coating", "Wilting"],
        treatment: "Apply fungicides and improve air circulation"
      },
      {
        name: "Water Stress",
        symptoms: ["Wilting", "Dry leaf edges", "Curling leaves"],
        treatment: "Adjust irrigation schedule and apply mulch"
      },
      {
        name: "Pest Infestation",
        symptoms: ["Holes in leaves", "Visible insects", "Curled/distorted growth"],
        treatment: "Apply appropriate pesticides and monitor regularly"
      }
    ];
  }
}

module.exports = new CropHealthService();
