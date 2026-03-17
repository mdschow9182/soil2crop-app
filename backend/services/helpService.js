/**
 * Help/Feedback Service
 * Manages farmer support requests and feedback
 */

const HelpRequest = require('../models/HelpRequest');
const logger = require('../utils/logger');

class HelpService {
  /**
   * Create a new help request/feedback
   * @param {Object} requestData - Help request data
   * @returns {Promise<Object>} Created help request
   */
  async createHelpRequest(requestData) {
    try {
      const helpRequest = await HelpRequest.create(requestData);
      logger.info(`[HelpService] Created help request: ${helpRequest._id}`);
      
      return helpRequest;
    } catch (error) {
      logger.error('[HelpService] Error creating help request:', error.message);
      throw error;
    }
  }

  /**
   * Get help request by ID
   * @param {string} requestId - MongoDB ObjectId
   * @returns {Promise<Object|null>}
   */
  async getHelpRequestById(requestId) {
    try {
      return await HelpRequest.findById(requestId).populate('farmerId', 'name mobile language');
    } catch (error) {
      logger.error('[HelpService] Error fetching help request:', error.message);
      return null;
    }
  }

  /**
   * Get all help requests for a farmer
   * @param {string} farmerId - Farmer's MongoDB ObjectId
   * @param {Object} options - Query options (limit, skip, status)
   * @returns {Promise<Array>}
   */
  async getFarmerHelpRequests(farmerId, options = {}) {
    try {
      const { limit = 20, skip = 0, status } = options;
      
      const query = { farmerId };
      if (status) {
        query.status = status;
      }

      return await HelpRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-__v');
    } catch (error) {
      logger.error('[HelpService] Error fetching farmer help requests:', error.message);
      return [];
    }
  }

  /**
   * Update help request status
   * @param {string} requestId - Help request ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated help request
   */
  async updateHelpRequest(requestId, updateData) {
    try {
      const updated = await HelpRequest.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true, runValidators: true }
      );
      
      logger.info(`[HelpService] Updated help request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[HelpService] Error updating help request:', error.message);
      return null;
    }
  }

  /**
   * Resolve a help request
   * @param {string} requestId - Help request ID
   * @param {string} resolution - Resolution description
   * @param {string} resolvedBy - Admin/farmer ID who resolved
   * @returns {Promise<Object|null>}
   */
  async resolveHelpRequest(requestId, resolution, resolvedBy) {
    try {
      const updated = await this.updateHelpRequest(requestId, {
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date()
      });
      
      logger.info(`[HelpService] Resolved help request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[HelpService] Error resolving help request:', error.message);
      return null;
    }
  }

  /**
   * Add satisfaction rating
   * @param {string} requestId - Help request ID
   * @param {number} rating - Rating (1-5)
   * @param {string} comments - Optional comments
   * @returns {Promise<Object|null>}
   */
  async addSatisfactionRating(requestId, rating, comments = '') {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const updated = await this.updateHelpRequest(requestId, {
        farmerSatisfaction: rating,
        farmerComments: comments
      });
      
      logger.info(`[HelpService] Added satisfaction rating for request: ${requestId}`);
      return updated;
    } catch (error) {
      logger.error('[HelpService] Error adding satisfaction rating:', error.message);
      return null;
    }
  }

  /**
   * Get help request statistics
   * @param {string} farmerId - Optional farmer ID for filtered stats
   * @returns {Promise<Object>}
   */
  async getHelpStatistics(farmerId = null) {
    try {
      const stats = await HelpRequest.getStatistics(farmerId);
      
      // Calculate additional metrics
      const total = stats.total || 0;
      const open = stats.open || 0;
      const resolved = stats.resolved || 0;
      
      const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(2) : 0;
      const openRate = total > 0 ? ((open / total) * 100).toFixed(2) : 0;

      return {
        total,
        open,
        in_progress: stats.in_progress || 0,
        resolved,
        closed: stats.closed || 0,
        resolution_rate: parseFloat(resolutionRate),
        open_rate: parseFloat(openRate)
      };
    } catch (error) {
      logger.error('[HelpService] Error getting statistics:', error.message);
      return {
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        resolution_rate: 0,
        open_rate: 0
      };
    }
  }

  /**
   * Get recent help requests with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getRecentHelpRequests(filters = {}) {
    try {
      const { 
        status, 
        category, 
        priority,
        limit = 50,
        sortBy = 'createdAt'
      } = filters;

      const query = {};
      if (status) query.status = status;
      if (category) query.category = category;
      if (priority) query.priority = priority;

      const sortOptions = {};
      sortOptions[sortBy] = -1;

      return await HelpRequest.find(query)
        .populate('farmerId', 'name mobile district')
        .sort(sortOptions)
        .limit(limit)
        .select('-__v');
    } catch (error) {
      logger.error('[HelpService] Error fetching recent help requests:', error.message);
      return [];
    }
  }
}

module.exports = new HelpService();
