/**
 * Market Trends Service
 * 
 * Provides market price trends and analysis for crops
 * Features: Price trends, trend analysis, recommendations
 */

const marketPriceService = require('./marketPriceService');

class MarketTrendsService {
  /**
   * Get market trends for a crop
   * @param {string} crop - Crop name
   * @param {string} location - Location name (optional)
   * @returns {Object} Trend data with historical prices
   */
  getMarketTrends(crop, location = 'default') {
    try {
      // Get current price
      const currentPrice = marketPriceService.getMarketPrice(crop, location);
      
      // Get historical data (last 30 days)
      const history = marketPriceService.getPriceHistory(crop, location, 30);
      
      // Format data for frontend chart
      const priceData = history.map(day => ({
        day: `Day ${30 - history.indexOf(day)}`,
        date: day.date,
        price: day.avg_price,
        minPrice: day.min_price,
        maxPrice: day.max_price,
        volume: day.volume
      }));
      
      // Analyze trend
      const trendAnalysis = this.#analyzeTrend(priceData);
      
      return {
        success: true,
        data: {
          crop: currentPrice.crop,
          location: currentPrice.location,
          currentPrice: currentPrice.avg_price,
          currency: currentPrice.currency,
          unit: currentPrice.unit,
          trend: trendAnalysis.trend,
          trendPercent: trendAnalysis.percent,
          recommendation: trendAnalysis.recommendation,
          prices: priceData,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get market trends: ${error.message}`);
    }
  }

  /**
   * Get trends for multiple crops
   * @param {Array} crops - Array of crop names
   * @param {string} location - Location name
   * @returns {Array} Array of trend data
   */
  getMultipleCropTrends(crops, location = 'default') {
    try {
      const trends = [];
      
      crops.forEach(crop => {
        const trendData = this.getMarketTrends(crop, location);
        trends.push(trendData.data);
      });
      
      return {
        success: true,
        count: trends.length,
        data: trends
      };
    } catch (error) {
      throw new Error(`Failed to get multiple crop trends: ${error.message}`);
    }
  }

  /**
   * Analyze price trend from historical data
   * @private
   */
  #analyzeTrend(priceData) {
    if (!priceData || priceData.length < 2) {
      return {
        trend: 'stable',
        percent: 0,
        recommendation: 'Insufficient data for trend analysis'
      };
    }

    // Get first and last 7 days average
    const recentPrices = priceData.slice(-7);
    const olderPrices = priceData.slice(0, 7);
    
    const recentAvg = recentPrices.reduce((sum, d) => sum + d.price, 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((sum, d) => sum + d.price, 0) / olderPrices.length;
    
    // Calculate percentage change
    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    // Determine trend direction
    let trend = 'stable';
    let recommendation = '';
    
    if (percentChange > 5) {
      trend = 'increasing';
      recommendation = 'Market prices are increasing significantly. Consider waiting for better rates if you can store the produce.';
    } else if (percentChange > 2) {
      trend = 'increasing';
      recommendation = 'Market prices are gradually increasing. Good time to sell if you need immediate cash.';
    } else if (percentChange < -5) {
      trend = 'decreasing';
      recommendation = 'Market prices are decreasing rapidly. Consider selling soon to avoid further losses.';
    } else if (percentChange < -2) {
      trend = 'decreasing';
      recommendation = 'Market prices are slightly decreasing. Monitor the trend before making a decision.';
    } else {
      trend = 'stable';
      recommendation = 'Market prices are stable. Sell based on your immediate needs and storage capacity.';
    }
    
    return {
      trend,
      percent: percentChange.toFixed(2),
      recommendation
    };
  }

  /**
   * Get weekly trend summary
   * @param {string} crop - Crop name
   * @param {string} location - Location name
   * @returns {Object} Weekly trend summary
   */
  getWeeklyTrendSummary(crop, location = 'default') {
    try {
      const history = marketPriceService.getPriceHistory(crop, location, 7);
      
      const weeklyData = {
        crop,
        location,
        weekStart: history[0].date,
        weekEnd: history[history.length - 1].date,
        openingPrice: history[0].avg_price,
        closingPrice: history[history.length - 1].avg_price,
        highestPrice: Math.max(...history.map(d => d.avg_price)),
        lowestPrice: Math.min(...history.map(d => d.avg_price)),
        averagePrice: Math.round(history.reduce((sum, d) => sum + d.avg_price, 0) / history.length),
        weeklyChange: history[history.length - 1].avg_price - history[0].avg_price,
        weeklyChangePercent: (((history[history.length - 1].avg_price - history[0].avg_price) / history[0].avg_price) * 100).toFixed(2)
      };
      
      return {
        success: true,
        data: weeklyData
      };
    } catch (error) {
      throw new Error(`Failed to get weekly trend: ${error.message}`);
    }
  }
}

module.exports = new MarketTrendsService();
