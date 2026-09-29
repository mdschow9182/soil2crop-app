const axios = require('axios');
const Crop = require('../models/Crop');
const SoilReport = require('../models/SoilReport');
const Feedback = require('../models/Feedback');
const { generateCropAdvice } = require('./cropAdviceEngine');

/**
 * Recommendation Service
 * Rule-based recommendations using saved farmer-confirmed soil data.
 */
class RecommendationService {
  
  /**
   * Generate crop recommendations for a user
   */
  async generateRecommendations(userId, soilReportId, district) {
    try {
      const soilReport = await SoilReport.findOne({ reportId: soilReportId, userId });
      if (!soilReport) {
        throw new Error(`Soil report not found: ${soilReportId} for user: ${userId}`);
      }
      const crops = await Crop.find({}).lean();
      const report = soilReport.toObject ? soilReport.toObject() : soilReport;
      const engineInput = {
        reportId: soilReportId,
        soilType: report.soilType,
        soilParameters: report.soilParameters
      };
      console.log('[CropAdvice] database crop count:', crops.length);
      console.log('[CropAdvice] engine input:', JSON.stringify(engineInput));
      const advice = generateCropAdvice({ report, crops });
      console.log('[CropAdvice] engine output:', JSON.stringify({
        catalogAvailability: advice.catalogAvailability,
        evaluatedFactors: advice.evaluatedFactors,
        recommendations: advice.recommendations?.map(({ cropId, cropName, score, coverage }) => ({ cropId, cropName, score, coverage }))
      }));
      if (crops.length === 0) {
        const message = 'No crop records are available in the current database.';
        console.error(`[CropAdvice] ${message}`);
        return { success: false, message, data: advice };
      }
      return {
        success: true,
        data: { ...advice, location: district || null, weatherAvailability: 'unavailable' }
      };
      
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      throw error;
    }
  }
  
  /**
   * Fetch weather data from OpenWeather API
   */
  async fetchWeatherData(district) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      
      if (!apiKey) {
        return { status: 'unavailable', district: district || null };
      }
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${apiKey}&units=metric`
      );
      
      const data = response.data;
      const temp = data.main.temp;
      // Check if rain data exists
      const rainProb = data.rain ? 80 : (data.clouds?.all || 0);
      
      return {
        status: 'available',
        temperature: temp,
        rainProbability: rainProb,
        droughtRisk: temp > 35 && rainProb < 20,
        excessRainRisk: rainProb > 70
      };
      
    } catch (error) {
      console.error('Weather fetch failed:', error.message);
      return { status: 'unavailable', district: district || null };
    }
  }
  
  /**
   * Calculate weather compatibility score
   */
  calculateWeatherCompatibility(crop, weather) {
    if (!weather || weather.status === 'unavailable') return null;
    let score = 100;
    
    // Drought risk affects high water requirement crops
    if (weather.droughtRisk && crop.waterRequirement === 'High') {
      score -= 40;
    }
    
    // Excess rain affects rain-dependent crops
    if (weather.excessRainRisk && crop.rainDependency) {
      score -= 30;
    }
    
    // Temperature extremes
    if (weather.temperature > 40) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Get market stability score
   */
  getMarketStabilityScore(volatility) {
    const scores = { Low: 90, Medium: 70, High: 50 };
    return scores[volatility] || 70;
  }
  
  /**
   * Get risk level from score
   */
  getRiskLevel(score) {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  }
  
  /**
   * Calculate overall risk
   */
  calculateOverallRisk(soil, weather, market) {
    const risks = [soil, weather, market];
    if (risks.includes('High')) return 'High';
    if (risks.includes('Medium')) return 'Medium';
    return 'Low';
  }
  
  /**
   * Generate reasoning text
   */
  generateReasoning(crop, soilMatch, weatherCompat) {
    const reasons = [];
    
    if (soilMatch.score >= 80) {
      reasons.push(`Your soil is well-suited for ${crop.cropName}`);
    } else if (soilMatch.score >= 60) {
      reasons.push(`Your soil is moderately suitable for ${crop.cropName}`);
    }
    
    if (weatherCompat >= 80) {
      reasons.push('Current weather conditions are favorable');
    }
    
    if (crop.waterRequirement === 'Low') {
      reasons.push('Requires less water - good for water-scarce regions');
    }
    
    return reasons.join('. ') || `Moderate suitability for ${crop.cropName}`;
  }
  
  /**
   * Get community insight based on feedback
   */
  async getCommunityInsight(district, n, p, k) {
    try {
      // Find similar soil conditions (within +/- 20% range)
      const nMin = n * 0.8, nMax = n * 1.2;
      const pMin = p * 0.8, pMax = p * 1.2;
      const kMin = k * 0.8, kMax = k * 1.2;
      
      const similarFeedback = await Feedback.find({
        district,
        nitrogen: { $gte: nMin, $lte: nMax },
        phosphorus: { $gte: pMin, $lte: pMax },
        potassium: { $gte: kMin, $lte: kMax },
        satisfactionLevel: { $gte: 3 } // Only satisfied farmers
      });
      
      if (similarFeedback.length < 5) {
        return null; // Not enough data
      }
      
      // Count crop choices
      const cropCounts = {};
      similarFeedback.forEach(f => {
        cropCounts[f.cropChosen] = (cropCounts[f.cropChosen] || 0) + 1;
      });
      
      // Find most common
      const mostCommon = Object.entries(cropCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      const percentage = Math.round((mostCommon[1] / similarFeedback.length) * 100);
      
      if (percentage >= 30) {
        return `In your district, ${percentage}% of farmers with similar soil chose ${mostCommon[0]}`;
      }
      
      return null;
      
    } catch (error) {
      console.error('Community insight error:', error);
      return null;
    }
  }
}

module.exports = new RecommendationService();
