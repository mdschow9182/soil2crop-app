/**
 * Help/Feedback Routes
 * All farmer support and feedback endpoints
 */

const express = require('express');
const router = express.Router();
const helpController = require('../controllers/helpController');
const { validateId } = require('../middleware/validation');

/**
 * @route   POST /api/help
 * @desc    Submit new help request/feedback
 * @access  Public (requires farmer ID)
 */
router.post('/', async (req, res) => {
  await helpController.submitHelpRequest(req, res);
});

/**
 * @route   GET /api/help/my-requests
 * @desc    Get farmer's own help requests
 * @access  Private (requires farmer ID)
 */
router.get('/my-requests', async (req, res) => {
  await helpController.getMyHelpRequests(req, res);
});

/**
 * @route   GET /api/help/stats
 * @desc    Get help request statistics
 * @access  Private (requires farmer ID)
 */
router.get('/stats', async (req, res) => {
  await helpController.getHelpStats(req, res);
});

/**
 * @route   GET /api/help/all
 * @desc    Get all help requests (Admin view)
 * @access  Admin
 */
router.get('/all', async (req, res) => {
  await helpController.getAllHelpRequests(req, res);
});

/**
 * @route   GET /api/help/:id
 * @desc    Get specific help request
 * @access  Private
 */
router.get('/:id', validateId('id'), async (req, res) => {
  await helpController.getHelpRequest(req, res);
});

/**
 * @route   PUT /api/help/:id/rate
 * @desc    Rate a resolved help request
 * @access  Private
 */
router.put('/:id/rate', validateId('id'), async (req, res) => {
  await helpController.rateHelpRequest(req, res);
});

module.exports = router;
