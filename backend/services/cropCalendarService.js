/**
 * Crop Calendar Service
 * Provides crop lifecycle timeline and farming activities schedule
 */

class CropCalendarService {
  /**
   * Crop calendar data for major crops
   * Weeks are counted from sowing/planting date
   */
  constructor() {
    this.cropCalendars = {
      // Rice/Paddy
      rice: {
        cropName: 'Rice',
        scientificName: 'Oryza sativa',
        duration: 120, // days
        stages: [
          { week: 0, task: 'Seed selection and treatment', icon: '🌱' },
          { week: 1, task: 'Land preparation and puddling', icon: '🚜' },
          { week: 2, task: 'Sowing/Transplanting', icon: '🌾' },
          { week: 3, task: 'Gap filling and manuring', icon: '💊' },
          { week: 4, task: 'First fertilizer application', icon: '💰' },
          { week: 5, task: 'Weed management', icon: '🌿' },
          { week: 6, task: 'Pest monitoring and management', icon: '🐛' },
          { week: 8, task: 'Second fertilizer application', icon: '💰' },
          { week: 9, task: 'Irrigation management', icon: '💧' },
          { week: 10, task: 'Disease monitoring', icon: '⚠️' },
          { week: 12, task: 'Drainage before harvest', icon: '💦' },
          { week: 14, task: 'Harvesting', icon: '✂️' },
          { week: 15, task: 'Threshing and drying', icon: '☀️' },
          { week: 16, task: 'Storage and marketing', icon: '📦' }
        ]
      },

      // Wheat
      wheat: {
        cropName: 'Wheat',
        scientificName: 'Triticum aestivum',
        duration: 110,
        stages: [
          { week: 0, task: 'Seed selection and treatment', icon: '🌱' },
          { week: 1, task: 'Land preparation', icon: '🚜' },
          { week: 2, task: 'Sowing', icon: '🌾' },
          { week: 3, task: 'Pre-emergence herbicide', icon: '🧪' },
          { week: 4, task: 'First irrigation', icon: '💧' },
          { week: 5, task: 'First fertilizer application', icon: '💰' },
          { week: 7, task: 'Second irrigation', icon: '💧' },
          { week: 8, task: 'Second fertilizer application', icon: '💰' },
          { week: 10, task: 'Pest monitoring', icon: '🐛' },
          { week: 12, task: 'Third irrigation', icon: '💧' },
          { week: 14, task: 'Grain filling stage', icon: '🌾' },
          { week: 15, task: 'Harvesting', icon: '✂️' },
          { week: 16, task: 'Threshing and storage', icon: '📦' }
        ]
      },

      // Maize/Corn
      maize: {
        cropName: 'Maize',
        scientificName: 'Zea mays',
        duration: 90,
        stages: [
          { week: 0, task: 'Seed selection', icon: '🌱' },
          { week: 1, task: 'Land preparation', icon: '🚜' },
          { week: 2, task: 'Sowing', icon: '🌾' },
          { week: 3, task: 'Gap filling', icon: '🔧' },
          { week: 4, task: 'First weeding and earthing up', icon: '🌿' },
          { week: 5, task: 'First fertilizer application', icon: '💰' },
          { week: 6, task: 'Pest monitoring', icon: '🐛' },
          { week: 8, task: 'Second fertilizer application', icon: '💰' },
          { week: 9, task: 'De-tasseling', icon: '✋' },
          { week: 10, task: 'Irrigation management', icon: '💧' },
          { week: 12, task: 'Harvesting', icon: '✂️' },
          { week: 13, task: 'Drying and storage', icon: '☀️' }
        ]
      },

      // Cotton
      cotton: {
        cropName: 'Cotton',
        scientificName: 'Gossypium hirsutum',
        duration: 150,
        stages: [
          { week: 0, task: 'Seed selection and treatment', icon: '🌱' },
          { week: 1, task: 'Land preparation', icon: '🚜' },
          { week: 2, task: 'Sowing', icon: '🌾' },
          { week: 4, task: 'Thinning and gap filling', icon: '✂️' },
          { week: 5, task: 'First weeding', icon: '🌿' },
          { week: 6, task: 'First fertilizer application', icon: '💰' },
          { week: 8, task: 'Pest monitoring (bollworm)', icon: '🐛' },
          { week: 10, task: 'Second fertilizer application', icon: '💰' },
          { week: 12, task: 'Flowering stage begins', icon: '🌸' },
          { week: 14, task: 'Irrigation management', icon: '💧' },
          { week: 16, task: 'Boll formation', icon: '🎯' },
          { week: 18, task: 'Continue pest monitoring', icon: '🐛' },
          { week: 20, task: 'First picking', icon: '✋' },
          { week: 22, task: 'Second picking', icon: '✋' }
        ]
      },

      // Groundnut/Peanut
      groundnut: {
        cropName: 'Groundnut',
        scientificName: 'Arachis hypogaea',
        duration: 100,
        stages: [
          { week: 0, task: 'Seed selection', icon: '🌱' },
          { week: 1, task: 'Land preparation', icon: '🚜' },
          { week: 2, task: 'Sowing', icon: '🌾' },
          { week: 3, task: 'Gap filling', icon: '🔧' },
          { week: 4, task: 'First weeding', icon: '🌿' },
          { week: 5, task: 'First fertilizer application', icon: '💰' },
          { week: 6, task: 'Peg formation stage', icon: '📍' },
          { week: 8, task: 'Second weeding and earthing up', icon: '🌿' },
          { week: 10, task: 'Pod development', icon: '🥜' },
          { week: 12, task: 'Irrigation withdrawal', icon: '🚫' },
          { week: 14, task: 'Harvesting', icon: '✂️' },
          { week: 15, task: 'Drying and storage', icon: '☀️' }
        ]
      },

      // Soybean
      soybean: {
        cropName: 'Soybean',
        scientificName: 'Glycine max',
        duration: 90,
        stages: [
          { week: 0, task: 'Seed selection and treatment', icon: '🌱' },
          { week: 1, task: 'Land preparation', icon: '🚜' },
          { week: 2, task: 'Sowing', icon: '🌾' },
          { week: 3, task: 'Gap filling', icon: '🔧' },
          { week: 4, task: 'First weeding', icon: '🌿' },
          { week: 5, task: 'First fertilizer application', icon: '💰' },
          { week: 6, task: 'Flowering stage', icon: '🌸' },
          { week: 8, task: 'Pod formation', icon: '🫘' },
          { week: 9, task: 'Second weeding', icon: '🌿' },
          { week: 10, task: 'Seed development', icon: '🌱' },
          { week: 12, task: 'Harvesting', icon: '✂️' },
          { week: 13, task: 'Drying and storage', icon: '☀️' }
        ]
      },

      // Sugarcane
      sugarcane: {
        cropName: 'Sugarcane',
        scientificName: 'Saccharum officinarum',
        duration: 365,
        stages: [
          { week: 0, task: 'Sett selection and treatment', icon: '🌱' },
          { week: 1, task: 'Land preparation and planting', icon: '🚜' },
          { week: 3, task: 'Gap filling', icon: '🔧' },
          { week: 4, task: 'First weeding', icon: '🌿' },
          { week: 6, task: 'First fertilizer application', icon: '💰' },
          { week: 8, task: 'Earthing up', icon: '⛰️' },
          { week: 10, task: 'Second fertilizer application', icon: '💰' },
          { week: 12, task: 'Pest monitoring', icon: '🐛' },
          { week: 16, task: 'Third fertilizer application', icon: '💰' },
          { week: 20, task: 'Irrigation management', icon: '💧' },
          { week: 24, task: 'Continue pest monitoring', icon: '🐛' },
          { week: 32, task: 'Maturity stage', icon: '✅' },
          { week: 40, task: 'Harvesting', icon: '✂️' },
          { week: 48, task: 'Marketing', icon: '💰' }
        ]
      },

      // Tomato
      tomato: {
        cropName: 'Tomato',
        scientificName: 'Solanum lycopersicum',
        duration: 90,
        stages: [
          { week: 0, task: 'Nursery sowing', icon: '🌱' },
          { week: 3, task: 'Main field preparation', icon: '🚜' },
          { week: 4, task: 'Transplanting', icon: '🌿' },
          { week: 5, task: 'Gap filling', icon: '🔧' },
          { week: 6, task: 'First fertilizer application', icon: '💰' },
          { week: 7, task: 'Staking', icon: '🎋' },
          { week: 8, task: 'First weeding', icon: '🌿' },
          { week: 9, task: 'Flowering begins', icon: '🌸' },
          { week: 10, task: 'Fruit setting', icon: '🍅' },
          { week: 11, task: 'Second fertilizer application', icon: '💰' },
          { week: 12, task: 'First picking', icon: '✋' },
          { week: 13, task: 'Continue harvesting', icon: '✋' }
        ]
      }
    };
  }

  /**
   * Get crop calendar for a specific crop
   * @param {string} cropName - Name of the crop (rice, wheat, maize, etc.)
   * @returns {Object|null} Crop calendar data or null if not found
   */
  getCropCalendar(cropName) {
    const normalizedCrop = cropName.toLowerCase().trim();
    
    // Try exact match first
    if (this.cropCalendars[normalizedCrop]) {
      return this.cropCalendars[normalizedCrop];
    }

    // Try to find partial match
    const found = Object.entries(this.cropCalendars).find(([key, data]) => 
      data.cropName.toLowerCase().includes(normalizedCrop) ||
      key.includes(normalizedCrop)
    );

    return found ? found[1] : null;
  }

  /**
   * Get all available crop calendars
   * @returns {Array} List of available crops
   */
  getAllCrops() {
    return Object.keys(this.cropCalendars).map(key => ({
      id: key,
      name: this.cropCalendars[key].cropName,
      scientificName: this.cropCalendars[key].scientificName,
      duration: this.cropCalendars[key].duration
    }));
  }

  /**
   * Get current stage based on planting date
   * @param {Object} calendar - Crop calendar object
   * @param {Date} plantingDate - Date when crop was planted
   * @returns {Object} Current stage information
   */
  getCurrentStage(calendar, plantingDate) {
    if (!calendar || !plantingDate) {
      return null;
    }

    const today = new Date();
    const daysSincePlanting = Math.floor((today - plantingDate) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(daysSincePlanting / 7);

    // Find the most recent stage
    const stages = calendar.stages.filter(s => s.week <= currentWeek);
    
    if (stages.length === 0) {
      return {
        currentStage: null,
        nextStage: calendar.stages[0],
        daysSincePlanting,
        currentWeek
      };
    }

    const currentStage = stages[stages.length - 1];
    const nextStage = calendar.stages.find(s => s.week > currentWeek) || null;

    return {
      currentStage,
      nextStage,
      daysSincePlanting,
      currentWeek
    };
  }

  /**
   * Get farming tips for a specific stage
   * @param {string} cropName - Crop name
   * @param {number} week - Week number
   * @returns {string} Farming tip
   */
  getFarmingTip(cropName, week) {
    const calendar = this.getCropCalendar(cropName);
    if (!calendar) return '';

    const stage = calendar.stages.find(s => s.week === week);
    if (!stage) return '';

    const tips = {
      'Land preparation': 'Ensure proper tillage and remove weeds. Add organic manure for better soil health.',
      'Sowing': 'Use certified seeds. Maintain proper spacing for optimal growth.',
      'Fertilizer application': 'Apply fertilizers as per soil test recommendations. Split application gives better results.',
      'Pest monitoring': 'Scout fields regularly. Use integrated pest management practices.',
      'Irrigation management': 'Monitor soil moisture. Avoid waterlogging and drought stress.',
      'Harvesting': 'Harvest at physiological maturity. Use proper tools to minimize losses.'
    };

    // Find matching tip
    for (const [keyword, tip] of Object.entries(tips)) {
      if (stage.task.toLowerCase().includes(keyword.toLowerCase())) {
        return tip;
      }
    }

    return 'Follow best agricultural practices for this stage.';
  }
}

module.exports = new CropCalendarService();
