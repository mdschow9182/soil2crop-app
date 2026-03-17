/**
 * Weather Service - OpenWeatherMap Integration
 * Provides real-time weather data for agricultural decision making
 */

const axios = require('axios');
const logger = require('../utils/logger');

// Cache for weather data (30 minutes TTL)
const weatherCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

class WeatherService {
 constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    if (!this.apiKey) {
      logger.warn('[WeatherService] OPENWEATHER_API_KEY not configured, using mock data');
    }
  }

  /**
   * Get weather data for coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherData(lat, lon) {
   const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    
    // Check cache first
   const cached = this.getCachedWeather(cacheKey);
    if (cached) {
      logger.info(`[WeatherService] Returning cached data for ${cacheKey}`);
     return cached;
    }

   try {
      // If API key not available, return mock data
      if (!this.apiKey) {
       const mockData = this.generateMockWeatherData(lat, lon);
        this.cacheWeather(cacheKey, mockData);
       return mockData;
      }

     const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric' // Celsius
        }
      });

     const weatherData = this.parseWeatherResponse(response.data);
      this.cacheWeather(cacheKey, weatherData);
      
      logger.info(`[WeatherService] Fetched weather for ${cacheKey}`, { 
        temperature: weatherData.temperature
      });
      
     return weatherData;
    } catch (error) {
      logger.error('[WeatherService] Error fetching weather data:', error.message);
      
      // Fallback to mock data on error
     const mockData = this.generateMockWeatherData(lat, lon);
      this.cacheWeather(cacheKey, mockData);
     return mockData;
    }
  }

  /**
   * Get forecast data (5-day forecast)
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Array>} Forecast data
   */
  async getForecast(lat, lon) {
   const cacheKey = `forecast_${lat.toFixed(4)},${lon.toFixed(4)}`;
    
    // Check cache
   const cached = this.getCachedWeather(cacheKey);
    if (cached) {
     return cached;
    }

   try {
      if (!this.apiKey) {
       const mockForecast = this.generateMockForecast();
        this.cacheWeather(cacheKey, mockForecast, 60 * 60 * 1000); // 1 hour cache
       return mockForecast;
      }

     const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

     const forecast = this.parseForecastResponse(response.data);
      this.cacheWeather(cacheKey, forecast, 60 * 60 * 1000);
      
     return forecast;
    } catch (error) {
      logger.error('[WeatherService] Error fetching forecast:', error.message);
     const mockForecast = this.generateMockForecast();
      this.cacheWeather(cacheKey, mockForecast, 60 * 60 * 1000);
     return mockForecast;
    }
  }

  /**
   * Parse OpenWeatherMap response
   * @private
   */
  parseWeatherResponse(data) {
   return {
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      rainfall_probability: data.clouds ? data.clouds.all / 100 : 0,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
     country: data.sys.country,
     sunrise: data.sys.sunrise,
     sunset: data.sys.sunset,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Parse forecast response
   * @private
   */
  parseForecastResponse(data) {
   return data.list.map(item => ({
      timestamp: item.dt_txt,
      temperature: Math.round(item.main.temp),
      feels_like: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      rainfall_probability: item.pop || 0,
      description: item.weather[0].description,
      icon: item.weather[0].icon
    }));
  }

  /**
   * Generate mock weather data for development
   * @private
   */
  generateMockWeatherData(lat, lon) {
   const baseTemp = 25 + Math.random() * 10;
   const humidity = 50 + Math.random() * 30;
   const rainfallProb = Math.random() * 0.6;
    
   return {
      temperature: Math.round(baseTemp),
      feels_like: Math.round(baseTemp + 2),
      humidity: Math.round(humidity),
      pressure: 1013,
      wind_speed: Math.round(5 + Math.random() * 10),
      wind_direction: Math.round(Math.random() * 360),
      rainfall_probability: rainfallProb,
      description: rainfallProb > 0.4 ? 'Light rain' : 'Clear sky',
      icon: rainfallProb > 0.4 ? '10d' : '01d',
      city: 'Guntur',
     country: 'IN',
      irrigation_suggestion: this.getIrrigationSuggestion(humidity, rainfallProb),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate mock forecast data
   * @private
   */
  generateMockForecast() {
   const forecast = [];
   const now = new Date();
    
    for (let i = 0; i < 8; i++) { // 5-day forecast, 3-hour intervals
     const time = new Date(now.getTime() + (i * 3 * 60 * 60 * 1000));
      forecast.push({
        timestamp: time.toISOString(),
        temperature: Math.round(25 + Math.random() * 8),
        feels_like: Math.round(27 + Math.random() * 8),
        humidity: Math.round(50 + Math.random() * 30),
        rainfall_probability: Math.random() * 0.6,
        description: Math.random() > 0.5 ? 'Clear sky' : 'Scattered clouds',
        icon: '01d'
      });
    }
    
   return forecast;
  }

  /**
   * Get irrigation suggestion based on weather
   * @private
   */
  getIrrigationSuggestion(humidity, rainfallProb) {
    if (rainfallProb > 0.6) {
     return "Rain expected. Delay irrigation.";
    } else if (humidity > 70) {
     return "High humidity. Reduce irrigation frequency.";
    } else if (humidity < 40) {
     return "Low humidity. Increase irrigation frequency.";
    } else {
     return "Normal irrigation schedule recommended.";
    }
  }

  /**
   * Cache management
   * @private
   */
  cacheWeather(key, data, ttl = CACHE_TTL) {
    weatherCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCachedWeather(key) {
   const cached = weatherCache.get(key);
    if (!cached) return null;

   const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      weatherCache.delete(key);
     return null;
    }

   return cached.data;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
   const now = Date.now();
    for (const [key, value] of weatherCache.entries()) {
      if (now - value.timestamp > value.ttl) {
        weatherCache.delete(key);
      }
    }
  }
}

// Singleton instance
const weatherService = new WeatherService();

// Clear cache every 10 minutes
setInterval(() => {
  weatherService.clearExpiredCache();
}, 10 * 60 * 1000);

module.exports = weatherService;
