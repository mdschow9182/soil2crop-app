/**
 * Farmer Support Routes
 * All farmer support and assistance endpoints
 */

const express = require('express');
const router = express.Router();
const farmerSupportController = require('../controllers/farmerSupportController');
const { validateId } = require('../middleware/validation');

/**
 * @route   POST /api/farmer-support
 * @desc    Submit new support request (question/problem)
 * @access  Public (requires farmer ID)
 */
router.post('/', async (req, res) => {
  await farmerSupportController.submitSupportRequest(req, res);
});

/**
 * @route   GET /api/farmer-support/my-requests
 * @desc    Get farmer's own support requests
 * @access  Private (requires farmer ID)
 */
router.get('/my-requests', async (req, res) => {
  await farmerSupportController.getMySupportRequests(req, res);
});

/**
 * @route   GET /api/farmer-support/stats
 * @desc    Get support request statistics
 * @access  Private (requires farmer ID)
 */
router.get('/stats', async (req, res) => {
  await farmerSupportController.getSupportStats(req, res);
});

/**
 * @route   GET /api/farmer-support/all
 * @desc    Get all support requests (Admin view)
 * @access  Admin
 */
router.get('/all', async (req, res) => {
  await farmerSupportController.getAllSupportRequests(req, res);
});

/**
 * @route   GET /api/farmer-support/:id
 * @desc    Get specific support request
 * @access  Private
 */
router.get('/:id', validateId('id'), async (req, res) => {
  await farmerSupportController.getSupportRequest(req, res);
});

/**
 * @route   PUT /api/farmer-support/:id/feedback
 * @desc    Add feedback to resolved support request
 * @access  Private
 */
router.put('/:id/feedback', validateId('id'), async (req, res) => {
  await farmerSupportController.addFeedback(req, res);
});

module.exports = router;
