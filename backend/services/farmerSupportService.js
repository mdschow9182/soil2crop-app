/**
 * Farmer Support Service
 * Manages farmer questions, problems, and support requests
 */

const FarmerSupport = require('../models/FarmerSupport');
const logger = require('../utils/logger');

class FarmerSupportService {
  /**
   * Create a new farmer support request
   * @param {Object} requestData - Support request data
   * @returns {Promise<Object>} Created support request
   */
  async createSupportRequest(requestData) {
    try {
      const supportRequest = await FarmerSupport.create(requestData);
      logger.info(`[FarmerSupport] Created request: ${supportRequest._id}`);
      
      return supportRequest;
    } catch (error) {
      logger.error('[FarmerSupport] Error creating request:', error.message);
      throw error;
    }
  }

  /**
   * Get support request by ID
   * @param {string} requestId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  async getSupportRequestById(requestId) {
    try {
      return await FarmerSupport.findById(requestId)
        .populate('farmerId', 'name mobile language district');
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching request:', error.message);
      return null;
    }
  }

  /**
   * Get all support requests for a farmer
   * @param {string} farmerId - Farmer's MongoDB ObjectId
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getFarmerSupportRequests(farmerId, options = {}) {
    try {
      const { limit = 20, skip = 0, type, status } = options;
      
      const query = { farmerId };
      if (type) query.type = type;
      if (status) query.status = status;

      return await FarmerSupport.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-__v');
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching requests:', error.message);
      return [];
    }
  }

  /**
   * Update support request
   * @param {string} requestId - Request ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated request
   */
  async updateSupportRequest(requestId, updateData) {
    try {
      const updated = await FarmerSupport.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true, runValidators: true }
      );
      
      logger.info(`[FarmerSupport] Updated request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[FarmerSupport] Error updating request:', error.message);
      return null;
    }
  }

  /**
   * Add response to support request
   * @param {string} requestId - Request ID
   * @param {string} response - Response text
   * @param {string} respondedBy - Admin/expert ID
   * @returns {Promise<Object|null>}
   */
  async addResponse(requestId, response, respondedBy) {
    try {
      const updated = await this.updateSupportRequest(requestId, {
        response,
        respondedBy,
        respondedAt: new Date(),
        status: 'in_progress'
      });
      
      logger.info(`[FarmerSupport] Added response to request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[FarmerSupport] Error adding response:', error.message);
      return null;
    }
  }

  /**
   * Mark request as resolved
   * @param {string} requestId - Request ID
   * @returns {Promise<Object|null>}
   */
  async resolveRequest(requestId) {
    try {
      const updated = await this.updateSupportRequest(requestId, {
        resolved: true,
        status: 'resolved'
      });
      
      logger.info(`[FarmerSupport] Resolved request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[FarmerSupport] Error resolving request:', error.message);
      return null;
    }
  }

  /**
   * Add farmer feedback
   * @param {string} requestId - Request ID
   * @param {number} rating - Rating (1-5)
   * @param {string} comments - Optional comments
   * @returns {Promise<Object|null>}
   */
  async addFeedback(requestId, rating, comments = '') {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const updated = await this.updateSupportRequest(requestId, {
        'farmerFeedback.rating': rating,
        'farmerFeedback.comments': comments
      });
      
      logger.info(`[FarmerSupport] Added feedback for request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[FarmerSupport] Error adding feedback:', error.message);
      return null;
    }
  }

  /**
   * Get support statistics
   * @param {string} farmerId - Optional farmer ID for filtered stats
   * @returns {Promise<Object>}
   */
  async getSupportStatistics(farmerId = null) {
    try {
      const stats = await FarmerSupport.getStatistics(farmerId);
      
      // Calculate additional metrics
      const total = stats.total || 0;
      const questions = stats.question || 0;
      const problems = stats.problem || 0;
      
      return {
        total,
        questions,
        problems,
        tip_requests: stats.tip_request || 0,
        contact_requests: stats.contact_request || 0
      };
    } catch (error) {
      logger.error('[FarmerSupport] Error getting statistics:', error.message);
      return {
        total: 0,
        questions: 0,
        problems: 0,
        tip_requests: 0,
        contact_requests: 0
      };
    }
  }

  /**
   * Get recent support requests with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getRecentSupportRequests(filters = {}) {
    try {
      const { 
        type, 
        status, 
        priority,
        limit = 50,
        sortBy = 'createdAt'
      } = filters;

      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (priority) query.priority = priority;

      const sortOptions = {};
      sortOptions[sortBy] = -1;

      return await FarmerSupport.find(query)
        .populate('farmerId', 'name mobile district')
        .sort(sortOptions)
        .limit(limit)
        .select('-__v');
    } catch (error) {
      logger.error('[FarmerSupport] Error fetching recent requests:', error.message);
      return [];
    }
  }
}

module.exports = new FarmerSupportService();
