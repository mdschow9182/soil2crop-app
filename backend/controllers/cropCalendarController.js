/**
 * Crop Calendar Controller
 * Handles crop lifecycle timeline requests
 */

const cropCalendarService = require('../services/cropCalendarService');
const logger = require('../utils/logger');

class CropCalendarController {
  /**
   * Get crop calendar for a specific crop
   * GET /api/crop-calendar?crop=rice
   */
  async getCropCalendar(req, res) {
    try {
      const { crop } = req.query;

      if (!crop) {
        return res.status(400).json({
          success: false,
          message: 'Crop name is required'
        });
      }

      logger.info(`[CropCalendar] Fetching calendar for crop: ${crop}`);

      const calendar = cropCalendarService.getCropCalendar(crop);

      if (!calendar) {
        return res.status(404).json({
          success: false,
          message: `Crop calendar not found for: ${crop}`,
          availableCrops: Object.keys(cropCalendarService.cropCalendars)
        });
      }

      logger.info(`[CropCalendar] Found calendar for ${calendar.cropName}`);

      res.json({
        success: true,
        message: 'Crop calendar retrieved successfully',
        data: {
          crop: calendar.cropName,
          scientificName: calendar.scientificName,
          duration: calendar.duration,
          stages: calendar.stages.map(stage => ({
            week: stage.week,
            task: stage.task,
            icon: stage.icon
          }))
        }
      });
    } catch (error) {
      logger.error('[CropCalendar] Error fetching calendar:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch crop calendar',
        error: error.message
      });
    }
  }

  /**
   * Get all available crops
   * GET /api/crop-calendar/list
   */
  async getAllCrops(req, res) {
    try {
      logger.info('[CropCalendar] Fetching all crops list');

      const crops = cropCalendarService.getAllCrops();

      res.json({
        success: true,
        message: 'Crops list retrieved successfully',
        data: crops
      });
    } catch (error) {
      logger.error('[CropCalendar] Error fetching crops list:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch crops list',
        error: error.message
      });
    }
  }

  /**
   * Get current stage for a crop
   * GET /api/crop-calendar/current-stage?crop=rice&plantingDate=2024-01-15
   */
  async getCurrentStage(req, res) {
    try {
      const { crop, plantingDate } = req.query;

      if (!crop || !plantingDate) {
        return res.status(400).json({
          success: false,
          message: 'Crop name and planting date are required'
        });
      }

      logger.info(`[CropCalendar] Fetching current stage for ${crop} planted on ${plantingDate}`);

      const calendar = cropCalendarService.getCropCalendar(crop);
      
      if (!calendar) {
        return res.status(404).json({
          success: false,
          message: `Crop calendar not found for: ${crop}`
        });
      }

      const stageInfo = cropCalendarService.getCurrentStage(
        calendar, 
        new Date(plantingDate)
      );

      if (!stageInfo) {
        return res.status(400).json({
          success: false,
          message: 'Invalid planting date'
        });
      }

      const tip = stageInfo.currentStage 
        ? cropCalendarService.getFarmingTip(crop, stageInfo.currentStage.week)
        : '';

      res.json({
        success: true,
        message: 'Current stage retrieved successfully',
        data: {
          crop: calendar.cropName,
          plantingDate,
          daysSincePlanting: stageInfo.daysSincePlanting,
          currentWeek: stageInfo.currentWeek,
          currentStage: stageInfo.currentStage,
          nextStage: stageInfo.nextStage,
          farmingTip: tip
        }
      });
    } catch (error) {
      logger.error('[CropCalendar] Error fetching current stage:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current stage',
        error: error.message
      });
    }
  }

  /**
   * Get farming tip for a specific stage
   * GET /api/crop-calendar/tip?crop=rice&week=4
   */
  async getFarmingTip(req, res) {
    try {
      const { crop, week } = req.query;

      if (!crop || !week) {
        return res.status(400).json({
          success: false,
          message: 'Crop name and week number are required'
        });
      }

      const tip = cropCalendarService.getFarmingTip(crop, parseInt(week));

      res.json({
        success: true,
        message: 'Farming tip retrieved successfully',
        data: {
          crop,
          week: parseInt(week),
          tip
        }
      });
    } catch (error) {
      logger.error('[CropCalendar] Error fetching farming tip:', error.message);
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farming tip',
        error: error.message
      });
    }
  }
}

module.exports = new CropCalendarController();
