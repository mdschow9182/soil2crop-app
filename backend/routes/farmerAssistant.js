/**
 * AI Farmer Assistant Routes
 */

const express = require('express');
const router = express.Router();
const aiFarmerAssistantController = require('../controllers/aiFarmerAssistantController');

/**
 * @route   POST /api/farmer-assistant
 * @desc    Get AI response to farmer's question
 */
router.post('/', async (req, res) => {
  await aiFarmerAssistantController.getAssistantResponse(req, res);
});

/**
 * @route   GET /api/farmer-assistant/suggestions
 * @desc    Get suggested questions
 */
router.get('/suggestions', async (req, res) => {
  await aiFarmerAssistantController.getSuggestedQuestions(req, res);
});

module.exports = router;
