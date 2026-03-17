/**
 * Farmer Routes
 * All farmer-related API endpoints
 */

const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { validateId } = require('../middleware/validation');

/**
 * @route   GET /api/farmers
 * @desc    Get all farmers (for admin)
 * @access  Public
 */
router.get('/', async (req, res) => {
  await farmerController.getAllFarmers(req, res);
});

/**
 * @route   GET /api/farmers/stats
 * @desc    Get farmer statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  await farmerController.getFarmerStats(req, res);
});

/**
 * @route   GET /api/farmers/:id
 * @desc    Get farmer by ID
 * @access  Public
 */
router.get('/:id', validateId('id'), async (req, res) => {
  await farmerController.getFarmer(req, res);
});

/**
 * @route   POST /api/farmers/login
 * @desc    Login or register a farmer
 * @access  Public
 */
router.post('/login', async (req, res) => {
  await farmerController.loginOrRegister(req, res);
});

/**
 * @route   PUT /api/farmers/:id/language
 * @desc    Update farmer's language preference
 * @access  Public
 */
router.put('/:id/language', validateId('id'), async (req, res) => {
  await farmerController.updateLanguage(req, res);
});

module.exports = router;
