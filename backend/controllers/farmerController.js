/**
 * Farmer Controller
 * Handles all farmer-related HTTP requests
 */

const farmerService = require('../services/farmerService');
const logger = require('../utils/logger');

class FarmerController {
  /**
   * Get farmer by ID
   * GET /farmers/:id
   */
  async getFarmer(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      const farmer = await farmerService.getFarmerById(id);
      
      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: 'Farmer not found'
        });
      }

      logger.info(`[FarmerController] Retrieved farmer: ${id}`);
      
      res.json({
        success: true,
        message: 'Farmer retrieved successfully',
        data: {
          _id: farmer._id,
          id: farmer.id,
          name: farmer.name,
          mobile: farmer.mobile,
          language: farmer.language,
          district: farmer.district,
          createdAt: farmer.createdAt,
          updatedAt: farmer.updatedAt
        }
      });
    } catch (error) {
      logger.error('[FarmerController] Error fetching farmer:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farmer profile',
        error: error.message
      });
    }
  }

  /**
   * Login or register farmer
   * POST /farmers/login
   */
  async loginOrRegister(req, res) {
    try {
      const { name, mobile, language, district } = req.body;
      
      // Validation
      if (!name || !mobile) {
        return res.status(400).json({
          success: false,
          message: 'Name and mobile number are required'
        });
      }

      // Validate mobile format (10 digits)
      if (!/^\d{10}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be a valid 10-digit number'
        });
      }

      // Validate language
      const validLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'ml'];
      if (language && !validLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: `Language must be one of: ${validLanguages.join(', ')}`
        });
      }

      logger.info(`[FarmerController] Login/Register request for mobile: ${mobile}`);

      // Create or get farmer
      const farmer = await farmerService.createOrGetFarmer({
        name,
        mobile,
        language: language || 'en',
        district: district || 'Unknown'
      });

      logger.info(`[FarmerController] Successfully processed farmer: ${farmer._id}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: farmer._id,
          id: farmer.id,
          name: farmer.name,
          mobile: farmer.mobile,
          language: farmer.language,
          district: farmer.district,
          createdAt: farmer.createdAt,
          updatedAt: farmer.updatedAt
        }
      });
    } catch (error) {
      logger.error('[FarmerController] Login/Register error:', error.message);
      
      // Handle duplicate key error (mobile number)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Mobile number already registered'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process login/registration',
        error: error.message
      });
    }
  }

  /**
   * Update farmer language
   * PUT /farmers/:id/language
   */
  async updateLanguage(req, res) {
    try {
      const { id } = req.params;
      const { language } = req.body;

      // Validation
      if (!language) {
        return res.status(400).json({
          success: false,
          message: 'Language is required'
        });
      }

      const validLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'ml'];
      if (!validLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: `Language must be one of: ${validLanguages.join(', ')}`
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      logger.info(`[FarmerController] Updating language for farmer ${id} to ${language}`);

      const updated = await farmerService.updateLanguage(id, language);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Farmer not found or language update failed'
        });
      }

      logger.info(`[FarmerController] Language updated successfully for farmer ${id}`);

      res.json({
        success: true,
        message: 'Language updated successfully',
        data: {
          id,
          language
        }
      });
    } catch (error) {
      logger.error('[FarmerController] Language update error:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update language',
        error: error.message
      });
    }
  }

  /**
   * Get all farmers (for admin purposes)
   * GET /farmers
   */
  async getAllFarmers(req, res) {
    try {
      const farmers = await farmerService.getAllFarmers();
      
      res.json({
        success: true,
        message: 'Farmers retrieved successfully',
        data: farmers.map(farmer => ({
          _id: farmer._id,
          id: farmer.id,
          name: farmer.name,
          mobile: farmer.mobile,
          language: farmer.language,
          district: farmer.district,
          createdAt: farmer.createdAt,
          updatedAt: farmer.updatedAt
        }))
      });
    } catch (error) {
      logger.error('[FarmerController] Error fetching all farmers:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farmers list',
        error: error.message
      });
    }
  }

  /**
   * Get farmer statistics
   * GET /farmers/stats
   */
  async getFarmerStats(req, res) {
    try {
      const stats = await farmerService.getFarmerStats();
      
      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('[FarmerController] Error fetching statistics:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }
}

module.exports = new FarmerController();
