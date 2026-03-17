/**
 * Market Trends Routes
 */

const express = require('express');
const router = express.Router();
const marketTrendsController = require('../controllers/marketTrendsController');

/**
 * @route   GET /api/market-trends?crop={name}&location={location}
 * @desc    Get market trends for a specific crop
 */
router.get('/', async (req, res) => {
  await marketTrendsController.getMarketTrends(req, res);
});

/**
 * @route   GET /api/market-trends/list?crops=crop1,crop2&location={location}
 * @desc    Get market trends for multiple crops
 */
router.get('/list', async (req, res) => {
  await marketTrendsController.getMultipleCropTrends(req, res);
});

/**
 * @route   GET /api/market-trends/weekly?crop={name}&location={location}
 * @desc    Get weekly trend summary
 */
router.get('/weekly', async (req, res) => {
  await marketTrendsController.getWeeklyTrendSummary(req, res);
});

/**
 * @route   GET /api/market-trends/comparison?crops=crop1,crop2&location={location}
 * @desc    Compare trends across multiple crops
 */
router.get('/comparison', async (req, res) => {
  await marketTrendsController.compareCropTrends(req, res);
});

module.exports = router;
