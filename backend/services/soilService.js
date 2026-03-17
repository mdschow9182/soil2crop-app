/**
 * Soil Service (MongoDB Version)
 * 
 * Research Relevance:
 * - Stores historical soil data for trend analysis
 * - Links soil conditions to crop outcomes
 * - Supports precision agriculture research
 */

const { SoilReport } = require('../models');

class SoilService {
  /**
   * Create a new soil report
   * @param {Object} soilData - { farmerId, filePath, ph, nitrogen, phosphorus, potassium, soilType, fertilityLevel }
   * @returns {Promise<Object>} - Created soil report
   */
  async createSoilReport(soilData) {
    const {
      farmer_id,
      farmerId,
      file_path,
      filePath,
      ph = null,
      nitrogen = null,
      phosphorus = null,
      potassium = null,
      soil_type,
      soilType,
      fertility_level,
      fertilityLevel
    } = soilData;

    // Support both snake_case and camelCase
    const farmerIdToUse = farmerId || farmer_id;
    const filePathToUse = filePath || file_path;
    const soilTypeToUse = soilType || soil_type || 'Unknown';
    const fertilityLevelToUse = fertilityLevel || fertility_level || null;

    const soilReport = await SoilReport.create({
      farmerId: farmerIdToUse,
      filePath: filePathToUse,
      ph,
      nitrogen,
      phosphorus,
      potassium,
      soilType: soilTypeToUse,
      fertilityLevel: fertilityLevelToUse
    });

    return soilReport;
  }

  /**
   * Get soil report by ID
   * @param {string} reportId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  async getSoilReportById(reportId) {
    try {
      return await SoilReport.findById(reportId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all soil reports for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Array>}
   */
  async getSoilReportsByFarmer(farmerId) {
    return await SoilReport.find({ farmerId }).sort({ createdAt: -1 });
  }

  /**
   * Get latest soil report for a farmer
   * @param {string} farmerId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  async getLatestSoilReport(farmerId) {
    return await SoilReport.findOne({ farmerId }).sort({ createdAt: -1 });
  }

  /**
   * Update soil report with parsed values
   * @param {string} reportId - MongoDB ObjectId
   * @param {Object} updates 
   * @returns {Promise<boolean>}
   */
  async updateSoilReport(reportId, updates) {
    try {
      const allowedFields = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'soilType', 'fertilityLevel'];
      const updateData = {};

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = updates[key];
        }
      });

      if (Object.keys(updateData).length === 0) return false;

      const result = await SoilReport.findByIdAndUpdate(
        reportId,
        updateData,
        { new: true }
      );

      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get soil statistics for research
   * @returns {Promise<Object>}
   */
  async getSoilStats() {
    const totalReports = await SoilReport.countDocuments();
    
    const soilTypeDistribution = await SoilReport.aggregate([
      { $match: { soilType: { $ne: null } } },
      { $group: { _id: '$soilType', count: { $sum: 1 } } }
    ]);

    const avgPhResult = await SoilReport.aggregate([
      { $match: { ph: { $ne: null } } },
      { $group: { _id: null, avgPh: { $avg: '$ph' } } }
    ]);

    return {
      totalReports,
      soilTypeDistribution: soilTypeDistribution.map(item => ({
        soilType: item._id,
        count: item.count
      })),
      averagePh: avgPhResult[0]?.avgPh || null
    };
  }

  /**
   * Delete soil report
   * @param {string} reportId - MongoDB ObjectId
   * @returns {Promise<boolean>}
   */
  async deleteSoilReport(reportId) {
    try {
      const result = await SoilReport.findByIdAndDelete(reportId);
      return !!result;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new SoilService();
