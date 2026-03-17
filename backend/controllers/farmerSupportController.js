/**
 * Farmer Support Controller
 * Handles farmer questions, problems, and support requests
 */

const farmerSupportService = require('../services/farmerSupportService');
const logger = require('../utils/logger');

class FarmerSupportController {
  /**
   * Submit new support request
   * POST /api/farmer-support
   */
  async submitSupportRequest(req, res) {
    try {
      const { 
        type, 
        title, 
        message, 
        cropType,
        farmLocation,
        priority 
      } = req.body;

      // Get farmer ID from request
      const farmerId = req.farmerId || req.body.farmerId;

      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      // Validation
      if (!type || !message) {
        return res.status(400).json({
          success: false,
          message: 'Type and message are required'
        });
      }

      logger.info(`[FarmerSupport] Submitting ${type} request from farmer: ${farmerId}`);

      const supportRequest = await farmerSupportService.createSupportRequest({
        farmerId,
        type,
        title,
        message,
        cropType,
        farmLocation,
        priority: priority || 'medium',
        language: req.language || 'en'
      });

      logger.info(`[FarmerSupport] Request created: ${supportRequest._id}`);

      res.status(201).json({
        success: true,
        message: 'Your request has been submitted successfully',
        data: {
          id: supportRequest.id,
          requestId: supportRequest._id,
          type: supportRequest.type,
          title: supportRequest.title,
          status: supportRequest.status,
          createdAt: supportRequest.createdAt
        }
      });
    } catch (error) {
      logger.error('[FarmerSupport] Error submitting request:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to submit request. Please try again.',
        error: error.message
      });
    }
  }

  /**
   * Get farmer's support requests
   * GET /api/farmer-support/my-requests
   */
  async getMySupportRequests(req, res) {
    try {
      const farmerId = req.farmerId || req.query.farmerId;

      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      const { limit = 20, skip = 0, type, status } = req.query;

      const requests = await farmerSupportService.getFarmerSupportRequests(farmerId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        type,
        status
      });

      logger.info(`[FarmerSupport] Retrieved ${requests.length} requests for farmer: ${farmerId}`);

      res.json({
        success: true,
        message: 'Support requests retrieved successfully',
        data: requests.map(request => ({
          id: request.id,
          type: request.type,
          title: request.title,
          message: request.message,
          status: request.status,
          priority: request.priority,
          response: request.response,
          respondedAt: request.respondedAt,
          resolved: request.resolved,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }))
      });
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching requests:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support requests',
        error: error.message
      });
    }
  }

  /**
   * Get specific support request
   * GET /api/farmer-support/:id
   */
  async getSupportRequest(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Request ID is required'
        });
      }

      const request = await farmerSupportService.getSupportRequestById(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Support request not found'
        });
      }

      logger.info(`[FarmerSupport] Retrieved request: ${id}`);

      res.json({
        success: true,
        message: 'Support request retrieved successfully',
        data: {
          id: request.id,
          farmerId: request.farmerId?._id,
          farmerName: request.farmerId?.name,
          type: request.type,
          title: request.title,
          message: request.message,
          cropType: request.cropType,
          farmLocation: request.farmLocation,
          priority: request.priority,
          status: request.status,
          image: request.image,
          response: request.response,
          respondedAt: request.respondedAt,
          resolved: request.resolved,
          helpful: request.helpful,
          farmerFeedback: request.farmerFeedback,
          language: request.language,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt
        }
      });
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching request:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support request',
        error: error.message
      });
    }
  }

  /**
   * Add feedback to resolved request
   * PUT /api/farmer-support/:id/feedback
   */
  async addFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, comments } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const updated = await farmerSupportService.addFeedback(id, rating, comments);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Support request not found'
        });
      }

      logger.info(`[FarmerSupport] Rated request: ${id} with ${rating} stars`);

      res.json({
        success: true,
        message: 'Thank you for your feedback!',
        data: {
          id: updated.id,
          farmerFeedback: updated.farmerFeedback
        }
      });
    } catch (error) {
      logger.error('[FarmerSupport] Error adding feedback:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  }

  /**
   * Get support statistics for a farmer
   * GET /api/farmer-support/stats
   */
  async getSupportStats(req, res) {
    try {
      const farmerId = req.farmerId || req.query.farmerId;

      if (!farmerId) {
        return res.status(400).json({
          success: false,
          message: 'Farmer ID is required'
        });
      }

      const stats = await farmerSupportService.getSupportStatistics(farmerId);

      logger.info(`[FarmerSupport] Retrieved statistics for farmer: ${farmerId}`);

      res.json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching statistics:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  /**
   * Get all support requests (Admin view)
   * GET /api/farmer-support/all
   */
  async getAllSupportRequests(req, res) {
    try {
      const { type, status, priority, limit = 50 } = req.query;

      const filters = {
        type,
        status,
        priority,
        limit: parseInt(limit)
      };

      const requests = await farmerSupportService.getRecentSupportRequests(filters);

      logger.info(`[FarmerSupport] Retrieved ${requests.length} requests (admin view)`);

      res.json({
        success: true,
        message: 'Support requests retrieved successfully',
        data: requests.map(request => ({
          id: request.id,
          farmerId: request.farmerId?._id,
          farmerName: request.farmerId?.name,
          farmerMobile: request.farmerId?.mobile,
          type: request.type,
          title: request.title,
          message: request.message,
          cropType: request.cropType,
          priority: request.priority,
          status: request.status,
          response: request.response,
          resolvedAt: request.respondedAt,
          createdAt: request.createdAt
        }))
      });
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching all requests:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support requests',
        error: error.message
      });
    }
  }
}

module.exports = new FarmerSupportController();
