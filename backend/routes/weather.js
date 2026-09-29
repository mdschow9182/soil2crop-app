const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const User = require('../models/User');

/**
 * GET /api/weather?location=
 * Returns mock weather data for demo purposes
 */
router.get('/', async (req, res) => {
  try {
    const { location } = req.query;
    
    console.log('🌤️ Weather request for location:', location);
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location query parameter is required'
      });
    }
    
    // Mock weather data (in production, integrate with OpenWeatherMap API)
    const mockWeatherData = {
      location: location,
      temperature: Math.floor(Math.random() * (35 - 25) + 25), // 25-35°C
      humidity: Math.floor(Math.random() * (80 - 50) + 50), // 50-80%
      rainfall: Math.floor(Math.random() * 10), // 0-10mm
      condition: 'Partly Cloudy',
      forecast: 'Normal conditions expected'
    };
    
    console.log('✅ Weather data generated:', mockWeatherData);
    
    res.json({
      success: true,
      weather: mockWeatherData,
      message: 'Weather data retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ Weather fetch error:', error.message);
    
    // Return fallback weather data
    res.json({
      success: true,
      weather: {
        location: req.query.location || 'Unknown',
        temperature: 30,
        humidity: 60,
        rainfall: 2,
        condition: 'Unknown',
        forecast: 'Data unavailable - using fallback values'
      },
      message: 'Using fallback weather data'
    });
  }
});

module.exports = router;
