const axios = require('axios');
const Crop = require('../models/Crop');
const SoilReport = require('../models/SoilReport');
const Feedback = require('../models/Feedback');

/**
 * Recommendation Service
 * Rule-based crop recommendation with weather integration
 */
class RecommendationService {
  
  /**
   * Generate crop recommendations for a user
   */
  async generateRecommendations(userId, soilReportId, district) {
    try {
      // 1. Fetch soil report
      const soilReport = await SoilReport.findOne({ reportId: soilReportId, userId });
      if (!soilReport) {
        throw new Error(`Soil report not found: ${soilReportId} for user: ${userId}`);
      }

      // 2. Fetch all crops
      const crops = await Crop.find({});
      
      if (crops.length === 0) {
        console.warn('No crops found in database. Please run: node scripts/seedCrops.js');
        throw new Error('No crops available in database');
      }
      
      console.log(`Generating recommendations for ${crops.length} crops`);
      
      // 3. Fetch weather data
      const weather = await this.fetchWeatherData(district);
      
      // 4. Calculate recommendations
      const recommendations = [];
      
      for (const crop of crops) {
        const soilMatch = crop.matchesSoil(
          soilReport.nitrogen,
          soilReport.phosphorus,
          soilReport.potassium,
          soilReport.ph
        );
        
        // Skip crops with very low soil match
        if (soilMatch.score < 30) continue;
        
        // Calculate weather compatibility
        const weatherCompat = this.calculateWeatherCompatibility(crop, weather);
        
        // Calculate market stability
        const marketStability = this.getMarketStabilityScore(crop.marketVolatility);
        
        // Final score: Soil 50%, Weather 30%, Market 20%
        const finalScore = (soilMatch.score * 0.5) + (weatherCompat * 0.3) + (marketStability * 0.2);
        
        // Determine risks
        const soilRisk = this.getRiskLevel(soilMatch.score);
        const weatherRisk = this.getRiskLevel(weatherCompat);
        const marketRisk = crop.marketVolatility;
        const overallRisk = this.calculateOverallRisk(soilRisk, weatherRisk, marketRisk);
        
        recommendations.push({
          crop: crop.cropName,
          cropId: crop.cropId,
          soilMatchScore: soilMatch.score,
          weatherCompatibility: Math.round(weatherCompat),
          marketStability,
          finalScore: Math.round(finalScore),
          soilRisk,
          weatherRisk,
          marketRisk,
          overallRisk,
          reasoning: this.generateReasoning(crop, soilMatch, weatherCompat),
          waterRequirement: crop.waterRequirement,
          rainDependency: crop.rainDependency,
          averageYield: crop.averageYield
        });
      }
      
      // Sort by final score and take top 3
      recommendations.sort((a, b) => b.finalScore - a.finalScore);
      const top3 = recommendations.slice(0, 3);
      
      if (top3.length === 0) {
        console.warn(`No crops matched soil conditions: N=${soilReport.nitrogen}, P=${soilReport.phosphorus}, K=${soilReport.potassium}, pH=${soilReport.ph}`);
      }
      
      // Get community insight
      const insight = await this.getCommunityInsight(
        district,
        soilReport.nitrogen,
        soilReport.phosphorus,
        soilReport.potassium
      );
      
      return {
        success: true,
        data: {
          soilSummary: {
            nitrogen: soilReport.nitrogen,
            phosphorus: soilReport.phosphorus,
            potassium: soilReport.potassium,
            ph: soilReport.ph,
            confidenceScore: soilReport.confidenceScore,
            confidenceLabel: SoilReport.getConfidenceLabel(soilReport.confidenceScore)
          },
          weather: {
            temperature: weather.temperature,
            rainProbability: weather.rainProbability,
            droughtRisk: weather.droughtRisk,
            excessRainRisk: weather.excessRainRisk
          },
          recommendations: top3,
          communityInsight: insight,
          disclaimer: 'This is an advisory recommendation only. Final crop decision should consider local expert advice.'
        }
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
      
      // For demo, return mock data if no API key
      if (!apiKey) {
        return {
          temperature: 28,
          rainProbability: 40,
          droughtRisk: false,
          excessRainRisk: false
        };
      }
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${apiKey}&units=metric`
      );
      
      const data = response.data;
      const temp = data.main.temp;
      // Check if rain data exists
      const rainProb = data.rain ? 80 : (data.clouds?.all || 0);
      
      return {
        temperature: temp,
        rainProbability: rainProb,
        droughtRisk: temp > 35 && rainProb < 20,
        excessRainRisk: rainProb > 70
      };
      
    } catch (error) {
      console.error('Weather fetch failed:', error.message);
      // Return safe defaults
      return {
        temperature: 28,
        rainProbability: 40,
        droughtRisk: false,
        excessRainRisk: false
      };
    }
  }
  
  /**
   * Calculate weather compatibility score
   */
  calculateWeatherCompatibility(crop, weather) {
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
