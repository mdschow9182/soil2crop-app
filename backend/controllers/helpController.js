/**
 * Help/Feedback Controller
 * Handles farmer support requests and feedback
 */

const helpService = require('../services/helpService');
const logger = require('../utils/logger');

class HelpController {
  /**
   * Submit new help request/feedback
   * POST /api/help
   */
  async submitHelpRequest(req, res) {
    try {
      const { 
        category, 
        subject, 
        description, 
        priority,
        contactPreference,
        phoneNumber,
        email 
      } = req.body;

      // Get farmer ID from request (set by auth middleware or passed explicitly)
      const farmerId = req.farmerId || req.body.farmerId;

      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      // Validation
      if (!category || !subject || !description) {
        return res.status(400).json({
          success: false,
          message: 'Category, subject, and description are required'
        });
      }

      logger.info(`[HelpController] Submitting help request from farmer: ${farmerId}`);

      const helpRequest = await helpService.createHelpRequest({
        farmerId,
        category,
        subject,
        description,
        priority: priority || 'medium',
        contactPreference: contactPreference || 'none',
        phoneNumber,
        email,
        language: req.language || 'en'
      });

      logger.info(`[HelpController] Help request created: ${helpRequest._id}`);

      res.status(201).json({
        success: true,
        message: 'Your feedback has been submitted successfully',
        data: {
          id: helpRequest.id,
          requestId: helpRequest._id,
          category: helpRequest.category,
          subject: helpRequest.subject,
          status: helpRequest.status,
          createdAt: helpRequest.createdAt
        }
      });
    } catch (error) {
      logger.error('[HelpController] Error submitting help request:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback. Please try again.',
        error: error.message
      });
    }
  }

  /**
   * Get farmer's help requests
   * GET /api/help/my-requests
   */
  async getMyHelpRequests(req, res) {
    try {
      const farmerId = req.farmerId || req.query.farmerId;

      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      const { limit = 20, skip = 0, status } = req.query;

      const requests = await helpService.getFarmerHelpRequests(farmerId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        status
      });

      logger.info(`[HelpController] Retrieved ${requests.length} help requests for farmer: ${farmerId}`);

      res.json({
        success: true,
        message: 'Help requests retrieved successfully',
        data: requests.map(request => ({
          id: request.id,
          category: request.category,
          subject: request.subject,
          description: request.description,
          status: request.status,
          priority: request.priority,
          resolution: request.resolution,
          resolvedAt: request.resolvedAt,
          farmerSatisfaction: request.farmerSatisfaction,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }))
      });
    } catch (error) {
      logger.error('[HelpController] Error fetching help requests:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch help requests',
        error: error.message
      });
    }
  }

  /**
   * Get specific help request
   * GET /api/help/:id
   */
  async getHelpRequest(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Request ID is required'
        });
      }

      const request = await helpService.getHelpRequestById(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Help request not found'
        });
      }

      logger.info(`[HelpController] Retrieved help request: ${id}`);

      res.json({
        success: true,
        message: 'Help request retrieved successfully',
        data: {
          id: request.id,
          farmerId: request.farmerId?._id,
          farmerName: request.farmerId?.name,
          category: request.category,
          subject: request.subject,
          description: request.description,
          priority: request.priority,
          status: request.status,
          contactPreference: request.contactPreference,
          phoneNumber: request.phoneNumber,
          email: request.email,
          language: request.language,
          resolution: request.resolution,
          resolvedAt: request.resolvedAt,
          farmerSatisfaction: request.farmerSatisfaction,
          farmerComments: request.farmerComments,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }
      });
    } catch (error) {
      logger.error('[HelpController] Error fetching help request:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch help request',
        error: error.message
      });
    }
  }

  /**
   * Update help request (add satisfaction rating)
   * PUT /api/help/:id/rate
   */
  async rateHelpRequest(req, res) {
    try {
      const { id } = req.params;
      const { rating, comments } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const updated = await helpService.addSatisfactionRating(id, rating, comments);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Help request not found'
        });
      }

      logger.info(`[HelpController] Rated help request: ${id} with ${rating} stars`);

      res.json({
        success: true,
        message: 'Thank you for your feedback!',
        data: {
          id: updated.id,
          farmerSatisfaction: updated.farmerSatisfaction,
          farmerComments: updated.farmerComments
        }
      });
    } catch (error) {
      logger.error('[HelpController] Error rating help request:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to submit rating',
        error: error.message
      });
    }
  }

  /**
   * Get help statistics for a farmer
   * GET /api/help/stats
   */
  async getHelpStats(req, res) {
    try {
      const farmerId = req.farmerId || req.query.farmerId;

      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      const stats = await helpService.getHelpStatistics(farmerId);

      logger.info(`[HelpController] Retrieved help statistics for farmer: ${farmerId}`);

      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('[HelpController] Error fetching statistics:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  /**
   * Get all help requests (Admin view)
   * GET /api/help/all
   */
  async getAllHelpRequests(req, res) {
    try {
      const { status, category, priority, limit = 50 } = req.query;

      const filters = {
        status,
        category,
        priority,
        limit: parseInt(limit)
      };

      const requests = await helpService.getRecentHelpRequests(filters);

      logger.info(`[HelpController] Retrieved ${requests.length} help requests (admin view)`);

      res.json({
        success: true,
        message: 'Help requests retrieved successfully',
        data: requests.map(request => ({
          id: request.id,
          farmerId: request.farmerId?._id,
          farmerName: request.farmerId?.name,
          farmerMobile: request.farmerId?.mobile,
          category: request.category,
          subject: request.subject,
          description: request.description,
          priority: request.priority,
          status: request.status,
          resolution: request.resolution,
          resolvedAt: request.resolvedAt,
          createdAt: request.createdAt
        }))
      });
    } catch (error) {
      logger.error('[HelpController] Error fetching all help requests:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch help requests',
        error: error.message
      });
    }
  }
}

module.exports = new HelpController();
