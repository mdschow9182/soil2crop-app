/**
 * Market Trends Controller
 * 
 * Handles HTTP requests for market trends data
 */

const marketTrendsService = require('../services/marketTrendsService');
const logger = require('../utils/logger');

class MarketTrendsController {
  /**
   * GET /api/market-trends?crop={name}&location={location}
   * Get market trends for a specific crop
   */
  async getMarketTrends(req, res) {
    try {
      const { crop, location } = req.query;
      
      if (!crop) {
        return res.status(400).json({
          success: false,
          message: 'Crop name is required'
        });
      }
      
      logger.info(`Fetching market trends for ${crop} in ${location || 'default location'}`);
      
      const trends = marketTrendsService.getMarketTrends(crop, location);
      
      res.json(trends);
    } catch (error) {
      logger.error('Error fetching market trends:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch market trends',
        error: error.message
      });
    }
  }

  /**
   * GET /api/market-trends/list?crops=crop1,crop2,crop3&location={location}
   * Get market trends for multiple crops
   */
  async getMultipleCropTrends(req, res) {
    try {
      const { crops, location } = req.query;
      
      if (!crops) {
        return res.status(400).json({
          success: false,
          message: 'Crops parameter is required (comma-separated list)'
        });
      }
      
      const cropsArray = crops.split(',').map(c => c.trim());
      
      logger.info(`Fetching market trends for multiple crops: ${cropsArray.join(', ')}`);
      
      const trends = marketTrendsService.getMultipleCropTrends(cropsArray, location);
      
      res.json(trends);
    } catch (error) {
      logger.error('Error fetching multiple crop trends:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch market trends for multiple crops',
        error: error.message
      });
    }
  }

  /**
   * GET /api/market-trends/weekly?crop={name}&location={location}
   * Get weekly trend summary
   */
  async getWeeklyTrendSummary(req, res) {
    try {
      const { crop, location } = req.query;
      
      if (!crop) {
        return res.status(400).json({
          success: false,
          message: 'Crop name is required'
        });
      }
      
      logger.info(`Fetching weekly trend summary for ${crop}`);
      
      const summary = marketTrendsService.getWeeklyTrendSummary(crop, location);
      
      res.json(summary);
    } catch (error) {
      logger.error('Error fetching weekly trend summary:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch weekly trend summary',
        error: error.message
      });
    }
  }

  /**
   * GET /api/market-trends/comparison?crops=crop1,crop2,crop3
   * Compare trends across multiple crops
   */
  async compareCropTrends(req, res) {
    try {
      const { crops, location } = req.query;
      
      if (!crops) {
        return res.status(400).json({
          success: false,
          message: 'Crops parameter is required'
        });
      }
      
      const cropsArray = crops.split(',').map(c => c.trim());
      
      logger.info(`Comparing trends for crops: ${cropsArray.join(', ')}`);
      
      const comparison = [];
      
      cropsArray.forEach(crop => {
        const trendData = marketTrendsService.getMarketTrends(crop, location);
        comparison.push({
          crop: trendData.data.crop,
          currentPrice: trendData.data.currentPrice,
          trend: trendData.data.trend,
          trendPercent: trendData.data.trendPercent,
          recommendation: trendData.data.recommendation
        });
      });
      
      // Sort by trend (best performing first)
      comparison.sort((a, b) => parseFloat(b.trendPercent) - parseFloat(a.trendPercent));
      
      res.json({
        success: true,
        count: comparison.length,
        data: {
          comparison,
          bestPerformer: comparison[0],
          worstPerformer: comparison[comparison.length - 1]
        }
      });
    } catch (error) {
      logger.error('Error comparing crop trends:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to compare crop trends',
        error: error.message
      });
    }
  }
}

module.exports = new MarketTrendsController();
