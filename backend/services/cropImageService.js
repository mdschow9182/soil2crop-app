/**
 * Crop Image Service (MongoDB Version)
 * 
 * Handles crop image uploads and AI analysis
 */

const { CropImage } = require('../models');

class CropImageService {
  /**
   * Create a new crop image record
   * @param {Object} imageData - { farmerId, imagePath, analysisResult, healthScore }
   * @returns {Promise<Object>} - Created image record
   */
  async createCropImage(imageData) {
    const {
      farmer_id,
      farmerId,
      image_path,
      imagePath,
      analysis_result,
      analysisResult,
      health_score,
      healthScore
    } = imageData;

    // Support both snake_case and camelCase
    const farmerIdToUse = farmerId || farmer_id;
    const imagePathToUse = imagePath || image_path;
    const analysisResultToUse = analysisResult || analysis_result || {};
    const healthScoreToUse = healthScore !== undefined ? healthScore : health_score;

    const cropImage = await CropImage.create({
      farmerId: farmerIdToUse,
      imagePath: imagePathToUse,
      analysisResult: analysisResultToUse,
      healthScore: healthScoreToUse
    });

    return cropImage;
  }

  /**
   * Get crop image by ID
   * @param {string} imageId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  async getCropImageById(imageId) {
    try {
      return await CropImage.findById(imageId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all crop images for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Array>}
   */
  async getCropImagesByFarmer(farmerId) {
    return await CropImage.find({ farmerId }).sort({ createdAt: -1 });
  }

  /**
   * Delete crop image
   * @param {string} imageId - MongoDB ObjectId
   * @returns {Promise<boolean>}
   */
  async deleteCropImage(imageId) {
    try {
      const result = await CropImage.findByIdAndDelete(imageId);
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Simulate AI analysis for crop image
   * @param {string} imagePath 
   * @returns {Object} - Simulated analysis result
   */
  simulateAIAnalysis(imagePath) {
    // Simulate AI analysis with random health score
    const healthScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    const conditions = [
      { name: 'Healthy', probability: 0.7 },
      { name: 'Minor Stress', probability: 0.2 },
      { name: 'Disease Risk', probability: 0.1 }
    ];

    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      health_score: healthScore,
      condition: condition.name,
      confidence: condition.probability,
      recommendations: [
        'Monitor regularly',
        'Maintain irrigation schedule',
        'Check for pest activity'
      ]
    };
  }
}

module.exports = new CropImageService();
