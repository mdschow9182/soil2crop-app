/**
 * Market Price Service - Enhanced with Market Intelligence
 * 
 * Provides market price information for crops based on location
 * Features: Price trends, profit estimation, best time to sell recommendations
 * Uses mock data for prototype (can be replaced with real API later)
 */

class MarketPriceService {
  /**
   * Mock market price database with historical data
   * In production, this would connect to AGMARKNET or other real APIs
   */
  #mockPrices = {
    'maize': {
      'guntur': { min_price: 1800, max_price: 2200, avg_price: 2000 },
      'mumbai': { min_price: 1900, max_price: 2300, avg_price: 2100 },
      'delhi': { min_price: 1750, max_price: 2150, avg_price: 1950 },
      'chennai': { min_price: 1850, max_price: 2250, avg_price: 2050 },
      'default': { min_price: 1800, max_price: 2200, avg_price: 2000 }
    },
    'paddy': {
      'guntur': { min_price: 2000, max_price: 2400, avg_price: 2200 },
      'mumbai': { min_price: 2100, max_price: 2500, avg_price: 2300 },
      'delhi': { min_price: 1950, max_price: 2350, avg_price: 2150 },
      'chennai': { min_price: 2050, max_price: 2450, avg_price: 2250 },
      'default': { min_price: 2000, max_price: 2400, avg_price: 2200 }
    },
    'wheat': {
      'guntur': { min_price: 2100, max_price: 2500, avg_price: 2300 },
      'mumbai': { min_price: 2200, max_price: 2600, avg_price: 2400 },
      'delhi': { min_price: 2050, max_price: 2450, avg_price: 2250 },
      'chennai': { min_price: 2150, max_price: 2550, avg_price: 2350 },
      'default': { min_price: 2100, max_price: 2500, avg_price: 2300 }
    },
    'cotton': {
      'guntur': { min_price: 5500, max_price: 6500, avg_price: 6000 },
      'mumbai': { min_price: 5600, max_price: 6600, avg_price: 6100 },
      'delhi': { min_price: 5400, max_price: 6400, avg_price: 5900 },
      'chennai': { min_price: 5550, max_price: 6550, avg_price: 6050 },
      'default': { min_price: 5500, max_price: 6500, avg_price: 6000 }
    },
    'groundnut': {
      'guntur': { min_price: 4800, max_price: 5800, avg_price: 5300 },
      'mumbai': { min_price: 4900, max_price: 5900, avg_price: 5400 },
      'delhi': { min_price: 4700, max_price: 5700, avg_price: 5200 },
      'chennai': { min_price: 4850, max_price: 5850, avg_price: 5350 },
      'default': { min_price: 4800, max_price: 5800, avg_price: 5300 }
    },
    'sugarcane': {
      'guntur': { min_price: 280, max_price: 320, avg_price: 300 },
      'mumbai': { min_price: 290, max_price: 330, avg_price: 310 },
      'delhi': { min_price: 270, max_price: 310, avg_price: 290 },
      'chennai': { min_price: 285, max_price: 325, avg_price: 305 },
      'default': { min_price: 280, max_price: 320, avg_price: 300 }
    },
    'soybean': {
      'guntur': { min_price: 3800, max_price: 4800, avg_price: 4300 },
      'mumbai': { min_price: 3900, max_price: 4900, avg_price: 4400 },
      'delhi': { min_price: 3700, max_price: 4700, avg_price: 4200 },
      'chennai': { min_price: 3850, max_price: 4850, avg_price: 4350 },
      'default': { min_price: 3800, max_price: 4800, avg_price: 4300 }
    },
    'mustard': {
      'guntur': { min_price: 4500, max_price: 5500, avg_price: 5000 },
      'mumbai': { min_price: 4600, max_price: 5600, avg_price: 5100 },
      'delhi': { min_price: 4400, max_price: 5400, avg_price: 4900 },
      'chennai': { min_price: 4550, max_price: 5550, avg_price: 5050 },
      'default': { min_price: 4500, max_price: 5500, avg_price: 5000 }
    }
  };

  /**
   * Get market prices for a crop in a specific location
   * @param {string} crop - Crop name
   * @param {string} location - Location/city name
   * @returns {Object} Price information
   */
  getMarketPrice(crop, location) {
    const normalizedCrop = crop.toLowerCase().trim();
    const normalizedLocation = location ? location.toLowerCase().trim() : 'default';

    // Check if we have data for this crop
    if (!this.#mockPrices[normalizedCrop]) {
      return this.#getGenericPrice(normalizedCrop);
    }

    // Get location-specific price or default
    const locationData = this.#mockPrices[normalizedCrop][normalizedLocation] || 
                         this.#mockPrices[normalizedCrop]['default'];

    return {
      crop: this.#formatCropName(normalizedCrop),
      location: this.#formatLocationName(normalizedLocation),
      ...locationData,
      currency: 'INR',
      unit: 'per quintal',
      last_updated: new Date().toISOString(),
      market_trend: this.#calculateTrend(locationData)
    };
  }

  /**
   * Get prices for all crops in a location
   * @param {string} location - Location name
   * @returns {Array} Array of all crop prices
   */
  getAllPrices(location) {
    const normalizedLocation = location ? location.toLowerCase().trim() : 'default';
    const results = [];

    Object.keys(this.#mockPrices).forEach(crop => {
      const priceData = this.getMarketPrice(crop, location);
      results.push(priceData);
    });

    return results;
  }

  /**
   * Get generic price for unknown crops
   */
  #getGenericPrice(crop) {
    return {
      crop: this.#formatCropName(crop),
      location: 'All India',
      min_price: 1500,
      max_price: 2500,
      avg_price: 2000,
      currency: 'INR',
      unit: 'per quintal',
      last_updated: new Date().toISOString(),
      market_trend: 'stable'
    };
  }

  /**
   * Format crop name for display
   */
  #formatCropName(crop) {
    return crop.charAt(0).toUpperCase() + crop.slice(1);
  }

  /**
   * Format location name for display
   */
  #formatLocationName(location) {
    if (location === 'default') return 'All India';
    return location.charAt(0).toUpperCase() + location.slice(1);
  }

  /**
   * Calculate market trend based on price range
   */
  #calculateTrend(priceData) {
    const { min_price, max_price, avg_price } = priceData;
    const midpoint = (min_price + max_price) / 2;

    if (avg_price > midpoint * 1.05) return 'rising';
    if (avg_price < midpoint * 0.95) return 'falling';
    return 'stable';
  }

  /**
   * Generate historical price data (last 30 days)
   * @param {string} crop - Crop name
   * @param {string} location - Location name
   * @returns {Array} Array of historical prices
   */
  getPriceHistory(crop, location, days = 30) {
    const currentPrice = this.getMarketPrice(crop, location);
    const history = [];
    const basePrice = currentPrice.avg_price;
    const volatility = 0.05; // 5% daily variation

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate price fluctuation with upward/downward trend
      const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
      const trendFactor = 1 + ((days - i) / days) * 0.03; // Slight upward trend
      
      const simulatedPrice = Math.round(basePrice * randomFactor * trendFactor);
      
      history.push({
        date: date.toISOString().split('T')[0],
        avg_price: simulatedPrice,
        min_price: Math.round(simulatedPrice * 0.9),
        max_price: Math.round(simulatedPrice * 1.1),
        volume: Math.floor(Math.random() * 1000) + 500 // Estimated volume in quintals
      });
    }

    return history;
  }

  /**
   * Predict best time to sell based on trends
   * @param {string} crop - Crop name
   * @param {string} location - Location name
   * @returns {Object} Selling recommendation
   */
  getBestTimeToSell(crop, location) {
    const currentPrice = this.getMarketPrice(crop, location);
    const history = this.getPriceHistory(crop, location, 30);
    
    // Analyze trend
    const recentAvg = history.slice(-7).reduce((sum, d) => sum + d.avg_price, 0) / 7;
    const olderAvg = history.slice(0, 7).reduce((sum, d) => sum + d.avg_price, 0) / 7;
    const trendPercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let recommendation = '';
    let urgency = 'hold'; // hold, sell_soon, sell_now
    
    if (trendPercent < -3) {
      recommendation = 'Prices are declining. Consider selling soon to avoid further losses.';
      urgency = 'sell_soon';
    } else if (trendPercent > 5) {
      recommendation = 'Prices are rising strongly. Consider waiting for better rates.';
      urgency = 'hold';
    } else if (trendPercent > 2) {
      recommendation = 'Prices are stable with slight upward trend. Good time to sell.';
      urgency = 'sell_now';
    } else {
      recommendation = 'Prices are stable. Sell based on your immediate cash flow needs.';
      urgency = 'hold';
    }
    
    // Seasonal factor
    const currentMonth = new Date().getMonth() + 1;
    const harvestMonths = [3, 4, 10, 11]; // Typical harvest months
    const isHarvestSeason = harvestMonths.includes(currentMonth);
    
    if (isHarvestSeason && urgency === 'hold') {
      recommendation += ' However, harvest season may bring price pressure.';
      urgency = 'sell_now';
    }
    
    return {
      current_price: currentPrice.avg_price,
      price_trend_7d: trendPercent.toFixed(2),
      recommendation,
      urgency,
      predicted_price_7d: Math.round(currentPrice.avg_price * (1 + trendPercent / 100)),
      confidence: Math.abs(trendPercent) > 3 ? 'high' : 'medium'
    };
  }

  /**
   * Estimate profit based on yield and current prices
   * @param {string} crop - Crop name
   * @param {number} yieldPerAcre - Expected yield in quintals per acre
   * @param {number} totalAcres - Total land area in acres
   * @param {string} location - Location name
   * @returns {Object} Profit estimation
   */
  estimateProfit(crop, yieldPerAcre, totalAcres, location) {
    const priceData = this.getMarketPrice(crop, location);
    const totalYield = yieldPerAcre * totalAcres;
    const grossRevenue = totalYield * priceData.avg_price;
    
    // Estimated cost of cultivation (varies by crop)
    const costPerAcre = this.#getCultivationCost(crop);
    const totalCost = costPerAcre * totalAcres;
    
    const netProfit = grossRevenue - totalCost;
    const profitMargin = ((netProfit / grossRevenue) * 100);
    
    return {
      crop: priceData.crop,
      total_yield_quintals: totalYield,
      expected_price_per_quintal: priceData.avg_price,
      gross_revenue: Math.round(grossRevenue),
      cultivation_cost: Math.round(totalCost),
      net_profit: Math.round(netProfit),
      profit_margin_percent: profitMargin.toFixed(2),
      roi_percent: ((netProfit / totalCost) * 100).toFixed(2),
      location: priceData.location
    };
  }

  /**
   * Get estimated cultivation cost per acre
   * @private
   */
  #getCultivationCost(crop) {
    const costs = {
      'maize': 25000,
      'paddy': 30000,
      'wheat': 28000,
      'cotton': 35000,
      'groundnut': 32000,
      'sugarcane': 40000,
      'soybean': 22000,
      'mustard': 20000
    };
    
    return costs[crop.toLowerCase()] || 25000;
  }

  /**
   * Get market intelligence summary
   * @param {string} crop - Crop name
   * @param {string} location - Location name
   * @returns {Object} Complete market intelligence
   */
  getMarketIntelligence(crop, location) {
    const currentPrice = this.getMarketPrice(crop, location);
    const history = this.getPriceHistory(crop, location);
    const bestTimeToSell = this.getBestTimeToSell(crop, location);
    
    return {
      current_pricing: currentPrice,
      historical_data: history,
      selling_recommendation: bestTimeToSell,
      market_analysis: {
        price_volatility: 'moderate',
        demand_outlook: 'stable',
        supply_conditions: 'adequate',
        seasonal_factor: new Date().getMonth() + 1
      }
    };
  }
}

module.exports = new MarketPriceService();
