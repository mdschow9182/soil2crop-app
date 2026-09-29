// Crop Calendar Routes
// Provides crop calendar data for different crops and states

const express = require('express');
const router = express.Router();

// Sample crop calendar database
const cropCalendarDB = {
  'Rice': {
    'Andhra Pradesh': {
      success: true,
      data: {
        crop: 'Rice',
        state: 'Andhra Pradesh',
        sowing_time: { display_text: 'June - July' },
        harvesting_time: { display_text: 'October - November' },
        duration_days: 120,
        fertilizer_schedule: [
          {
            stage: 'Basal Dose',
            timing: 'At transplanting',
            fertilizer_type: 'NPK (80:40:40)',
            amount_per_hectare: '80 kg N + 40 kg P + 40 kg K'
          },
          {
            stage: 'Tillering Stage',
            timing: '30 days after transplanting',
            fertilizer_type: 'Urea',
            amount_per_hectare: '40 kg N'
          }
        ],
        irrigation_schedule: [
          {
            stage: 'Land Preparation',
            days_after_sowing: '0',
            water_requirement_mm: '50 mm'
          },
          {
            stage: 'Transplanting',
            days_after_sowing: '7',
            water_requirement_mm: '50 mm'
          },
          {
            stage: 'Tillering',
            days_after_sowing: '30',
            frequency: 'Every 5-7 days'
          }
        ],
        best_practices: [
          {
            title: 'Line Transplanting',
            description: 'Maintain row-to-row spacing of 20 cm and plant-to-plant spacing of 15 cm',
            timing: 'During transplanting'
          },
          {
            title: 'Weed Management',
            description: 'Use cono weeder at 15-20 days interval',
            timing: '15-20 days after transplanting'
          }
        ],
        expected_yield_kg_per_hectare: { min: 4000, max: 6000 },
        expected_profit_inr_per_hectare: { min: 40000, max: 60000 }
      }
    }
  },
  'Millets': {
    'Andhra Pradesh': {
      success: true,
      data: {
        crop: 'Millets',
        state: 'Andhra Pradesh',
        sowing_time: { display_text: 'June - August' },
        harvesting_time: { display_text: 'September - November' },
        duration_days: 90,
        fertilizer_schedule: [
          {
            stage: 'Basal Dose',
            timing: 'At sowing',
            fertilizer_type: 'NPK (60:40:40)',
            amount_per_hectare: '60 kg N + 40 kg P + 40 kg K'
          }
        ],
        irrigation_schedule: [
          {
            stage: 'Sowing',
            days_after_sowing: '0',
            water_requirement_mm: '30 mm'
          },
          {
            stage: 'Flowering',
            days_after_sowing: '45',
            water_requirement_mm: '40 mm'
          }
        ],
        best_practices: [
          {
            title: 'Dry Land Farming',
            description: 'Millets are drought-resistant and suitable for rainfed areas',
            timing: 'Throughout season'
          },
          {
            title: 'Intercropping',
            description: 'Can be intercropped with pulses like red gram',
            timing: 'At sowing'
          }
        ],
        expected_yield_kg_per_hectare: { min: 1500, max: 2500 },
        expected_profit_inr_per_hectare: { min: 30000, max: 50000 }
      }
    }
  },
  'Groundnut': {
    'Andhra Pradesh': {
      success: true,
      data: {
        crop: 'Groundnut',
        state: 'Andhra Pradesh',
        sowing_time: { display_text: 'May - June' },
        harvesting_time: { display_text: 'September - October' },
        duration_days: 110,
        fertilizer_schedule: [
          {
            stage: 'Basal Dose',
            timing: 'At sowing',
            fertilizer_type: 'NPK (40:80:80)',
            amount_per_hectare: '40 kg N + 80 kg P + 80 kg K'
          },
          {
            stage: 'Pegging Stage',
            timing: '30-35 days after sowing',
            fertilizer_type: 'Gypsum',
            amount_per_hectare: '200 kg/ha'
          }
        ],
        irrigation_schedule: [
          {
            stage: 'Sowing',
            days_after_sowing: '0',
            water_requirement_mm: '40 mm'
          },
          {
            stage: 'Pegging',
            days_after_sowing: '35',
            water_requirement_mm: '50 mm'
          }
        ],
        best_practices: [
          {
            title: 'Seed Treatment',
            description: 'Treat seeds with Rhizobium and PSB cultures',
            timing: 'Before sowing'
          },
          {
            title: 'Earthing Up',
            description: 'Facilitates easy entry of pegs into soil',
            timing: '30-35 days after sowing'
          }
        ],
        expected_yield_kg_per_hectare: { min: 2500, max: 3500 },
        expected_profit_inr_per_hectare: { min: 80000, max: 120000 }
      }
    }
  },
  'Pulses': {
    'Andhra Pradesh': {
      success: true,
      data: {
        crop: 'Pulses',
        state: 'Andhra Pradesh',
        sowing_time: { display_text: 'June - July' },
        harvesting_time: { display_text: 'October - November' },
        duration_days: 100,
        fertilizer_schedule: [
          {
            stage: 'Basal Dose',
            timing: 'At sowing',
            fertilizer_type: 'NPK (20:40:40)',
            amount_per_hectare: '20 kg N + 40 kg P + 40 kg K'
          }
        ],
        irrigation_schedule: [
          {
            stage: 'Sowing',
            days_after_sowing: '0',
            water_requirement_mm: '30 mm'
          },
          {
            stage: 'Flowering',
            days_after_sowing: '40',
            water_requirement_mm: '40 mm'
          }
        ],
        best_practices: [
          {
            title: 'Seed Inoculation',
            description: 'Inoculate seeds with Rhizobium culture for nitrogen fixation',
            timing: 'Before sowing'
          },
          {
            title: 'Foliar Spray',
            description: 'Spray 2% DAP solution at flowering stage',
            timing: 'At flowering'
          }
        ],
        expected_yield_kg_per_hectare: { min: 1200, max: 1800 },
        expected_profit_inr_per_hectare: { min: 35000, max: 55000 }
      }
    }
  },
  'Maize': {
    'Andhra Pradesh': {
      success: true,
      data: {
        crop: 'Maize',
        state: 'Andhra Pradesh',
        sowing_time: { display_text: 'June - August' },
        harvesting_time: { display_text: 'October - December' },
        duration_days: 100,
        fertilizer_schedule: [
          {
            stage: 'Basal Dose',
            timing: 'At sowing',
            fertilizer_type: 'NPK (120:60:40)',
            amount_per_hectare: '120 kg N + 60 kg P + 40 kg K'
          },
          {
            stage: 'Knee High Stage',
            timing: '40 days after sowing',
            fertilizer_type: 'Urea',
            amount_per_hectare: '40 kg N'
          }
        ],
        irrigation_schedule: [
          {
            stage: 'Sowing',
            days_after_sowing: '0',
            water_requirement_mm: '40 mm'
          },
          {
            stage: 'Tasseling',
            days_after_sowing: '50',
            water_requirement_mm: '60 mm'
          }
        ],
        best_practices: [
          {
            title: 'Detasseling',
            description: 'Remove tassel to prevent self-pollination in hybrid maize',
            timing: 'Just before pollen shedding'
          },
          {
            title: 'Propping',
            description: 'Stalk propping to prevent lodging',
            timing: '60 days after sowing'
          }
        ],
        expected_yield_kg_per_hectare: { min: 5000, max: 8000 },
        expected_profit_inr_per_hectare: { min: 50000, max: 80000 }
      }
    }
  }
};

// GET /api/crop-calendar
router.get('/', (req, res) => {
  try {
    const { crop, state } = req.query;
    
    if (!crop || !state) {
      return res.status(400).json({
        success: false,
        message: 'Crop and state parameters are required'
      });
    }
    
    // Normalize input
    const normalizedCrop = Object.keys(cropCalendarDB).find(
      key => key.toLowerCase() === crop.toLowerCase()
    );
    
    const normalizedState = Object.keys(cropCalendarDB[normalizedCrop] || {}).find(
      key => key.toLowerCase() === state.toLowerCase()
    );
    
    if (!normalizedCrop || !normalizedState) {
      return res.status(404).json({
        success: false,
        message: 'No calendar data found for this crop and state combination'
      });
    }
    
    const calendarData = cropCalendarDB[normalizedCrop][normalizedState];
    
    res.json(calendarData);
  } catch (error) {
    console.error('Error fetching crop calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crop calendar data',
      error: error.message
    });
  }
});

module.exports = router;
