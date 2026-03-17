/**
 * Crop Calendar Routes
 * All crop lifecycle timeline endpoints
 */

const express = require('express');
const router = express.Router();
const cropCalendarController = require('../controllers/cropCalendarController');

/**
 * @route   GET /api/crop-calendar?crop={name}
 * @desc    Get crop calendar for specific crop
 * @access  Public
 */
router.get('/', async (req, res) => {
  await cropCalendarController.getCropCalendar(req, res);
});

/**
 * @route   GET /api/crop-calendar/list
 * @desc    Get list of all available crops
 * @access  Public
 */
router.get('/list', async (req, res) => {
  await cropCalendarController.getAllCrops(req, res);
});

/**
 * @route   GET /api/crop-calendar/current-stage?crop={name}&plantingDate={date}
 * @desc    Get current growth stage based on planting date
 * @access  Public
 */
router.get('/current-stage', async (req, res) => {
  await cropCalendarController.getCurrentStage(req, res);
});

/**
 * @route   GET /api/crop-calendar/tip?crop={name}&week={number}
 * @desc    Get farming tip for specific week
 * @access  Public
 */
router.get('/tip', async (req, res) => {
  await cropCalendarController.getFarmingTip(req, res);
});

module.exports = router;
