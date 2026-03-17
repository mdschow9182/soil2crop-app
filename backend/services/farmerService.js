/**
 * Farmer Service (MongoDB Version)
 * 
 * Research Relevance:
 * - Tracks farmer engagement patterns over time
 * - Supports multilingual user base analysis
 * - Enables personalized recommendation systems
 */

const { Farmer } = require('../models');

class FarmerService {
  /**
   * Create a new farmer or return existing one
   * @param {Object} farmerData - { name, mobile, language, district }
   * @returns {Promise<Object>} - Farmer object with id
   */
  async createOrGetFarmer(farmerData) {
    const { name, mobile, language = 'en', district = 'Unknown' } = farmerData;

    // Check if farmer exists
    let farmer = await Farmer.findOne({ mobile });

    if (farmer) {
      // Update name and language if changed
      farmer.name = name;
      farmer.language = language;
      await farmer.save();
      return farmer;
    }

    // Create new farmer
    farmer = await Farmer.create({
      name,
      mobile,
      language,
      district
    });

    return farmer;
  }

  /**
   * Get farmer by ID
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  async getFarmerById(farmerId) {
    try {
      return await Farmer.findById(farmerId);
    } catch (error) {
      // Invalid ObjectId format
      return null;
    }
  }

  /**
   * Get farmer by mobile number
   * @param {string} mobile 
   * @returns {Promise<Object|null>}
   */
  async getFarmerByMobile(mobile) {
    return await Farmer.findOne({ mobile });
  }

  /**
   * Update farmer's preferred language
   * @param {string} farmerId - MongoDB ObjectId
   * @param {string} language 
   * @returns {Promise<boolean>}
   */
  async updateLanguage(farmerId, language) {
    try {
      const result = await Farmer.findByIdAndUpdate(
        farmerId,
        { language },
        { new: true }
      );
      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all farmers (for admin/research purposes)
   * @returns {Promise<Array>}
   */
  async getAllFarmers() {
    return await Farmer.find().sort({ createdAt: -1 });
  }

  /**
   * Get farmer statistics
   * @returns {Promise<Object>}
   */
  async getFarmerStats() {
    const totalFarmers = await Farmer.countDocuments();
    
    const languageDistribution = await Farmer.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } }
    ]);

    return {
      totalFarmers,
      languageDistribution: languageDistribution.map(item => ({
        language: item._id,
        count: item.count
      }))
    };
  }
}

module.exports = new FarmerService();
