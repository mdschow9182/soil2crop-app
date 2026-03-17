/**
 * AI Farmer Assistant Controller
 * 
 * Handles HTTP requests for AI farming assistant
 */

const aiFarmerAssistant = require('../services/aiFarmerAssistant');
const logger = require('../utils/logger');

class AIFarmerAssistantController {
  /**
   * POST /api/farmer-assistant
   * Get AI response to farmer's question
   */
  async getAssistantResponse(req, res) {
    try {
      const { query, language } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query is required'
        });
      }
      
      const userLanguage = language || 'en';
      
      logger.info(`AI Assistant query: "${query}" in ${userLanguage}`);
      
      const response = await aiFarmerAssistant.getResponse(query, userLanguage);
      
      res.json(response);
    } catch (error) {
      logger.error('Error getting AI assistant response:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to process your question',
        error: error.message
      });
    }
  }

  /**
   * GET /api/farmer-assistant/suggestions
   * Get suggested questions
   */
  async getSuggestedQuestions(req, res) {
    try {
      const suggestions = aiFarmerAssistant.getSuggestedQuestions();
      
      res.json({
        success: true,
        count: suggestions.length,
        data: suggestions
      });
    } catch (error) {
      logger.error('Error getting suggested questions:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suggested questions',
        error: error.message
      });
    }
  }
}

module.exports = new AIFarmerAssistantController();
