/**
 * Soil Health Calculator
 * Calculates soil health score based on pH, NPK levels, and balance
 */

class SoilHealthCalculator {
  /**
   * Calculate overall soil health score (0-100)
   */
  calculateHealthScore(ph, nitrogen, phosphorus, potassium, soilType) {
    const phScore = this.calculatePHScore(ph);
    const nScore = this.calculateNitrogenScore(nitrogen);
    const pScore = this.calculatePhosphorusScore(phosphorus);
    const kScore = this.calculatePotassiumScore(potassium);
    const balanceScore = this.calculateBalanceScore({ nitrogen, phosphorus, potassium });
    
    // Weighted average
    const totalScore = (phScore * 0.25) + (nScore * 0.25) + (pScore * 0.20) + (kScore * 0.15) + (balanceScore * 0.15);
    
    return Math.round(totalScore);
  }

  /**
   * pH scoring (optimal range: 6.0-7.5 for most crops)
   */
  calculatePHScore(ph) {
    if (!ph) return 50; // Default if unknown
    
    if (ph >= 6.0 && ph <= 7.5) return 100; // Optimal
    if (ph >= 5.5 && ph < 6.0) return 80;   // Slightly acidic
    if (ph > 7.5 && ph <= 8.0) return 75;   // Slightly alkaline
    if (ph >= 5.0 && ph < 5.5) return 60;   // Acidic
    if (ph > 8.0 && ph <= 8.5) return 55;   // Alkaline
    if (ph < 5.0 || ph > 8.5) return 40;    // Extreme
    
    return 50;
  }

  /**
   * Nitrogen scoring (optimal: 200-350 kg/ha)
   */
  calculateNitrogenScore(nitrogen) {
    if (!nitrogen) return 50;
    
    if (nitrogen >= 200 && nitrogen <= 350) return 100; // Optimal
    if (nitrogen >= 150 && nitrogen < 200) return 80;   // Medium
    if (nitrogen > 350 && nitrogen <= 400) return 75;   // High
    if (nitrogen >= 100 && nitrogen < 150) return 65;   // Low-medium
    if (nitrogen > 400 && nitrogen <= 500) return 60;   // Very high
    if (nitrogen < 100) return 50;                       // Deficient
    if (nitrogen > 500) return 45;                       // Excessive
    
    return 50;
  }

  /**
   * Phosphorus scoring (optimal: 15-30 kg/ha)
   */
  calculatePhosphorusScore(phosphorus) {
    if (!phosphorus) return 50;
    
    if (phosphorus >= 15 && phosphorus <= 30) return 100; // Optimal
    if (phosphorus >= 10 && phosphorus < 15) return 80;   // Medium
    if (phosphorus > 30 && phosphorus <= 40) return 75;   // High
    if (phosphorus >= 5 && phosphorus < 10) return 65;    // Low
    if (phosphorus > 40 && phosphorus <= 50) return 60;   // Very high
    if (phosphorus < 5) return 50;                         // Deficient
    if (phosphorus > 50) return 45;                        // Excessive
    
    return 50;
  }

  /**
   * Potassium scoring (optimal: 150-300 kg/ha)
   */
  calculatePotassiumScore(potassium) {
    if (!potassium) return 50;
    
    if (potassium >= 150 && potassium <= 300) return 100; // Optimal
    if (potassium >= 100 && potassium < 150) return 80;   // Medium
    if (potassium > 300 && potassium <= 400) return 75;   // High
    if (potassium >= 50 && potassium < 100) return 65;    // Low
    if (potassium > 400 && potassium <= 500) return 60;   // Very high
    if (potassium < 50) return 50;                         // Deficient
    if (potassium > 500) return 45;                        // Excessive
    
    return 50;
  }

  /**
   * NPK Balance scoring
   */
  calculateBalanceScore({ nitrogen, phosphorus, potassium }) {
    if (!nitrogen || !phosphorus || !potassium) return 50;
    
    // Calculate ratios (ideal N:P:K ratio is approximately 4:1:4)
    const npkRatio = nitrogen / (phosphorus + 0.1); // Add small value to avoid division by zero
    const idealRatio = 4.0;
    const ratioDiff = Math.abs(npkRatio - idealRatio);
    
    if (ratioDiff <= 1.0) return 100;      // Well balanced
    if (ratioDiff <= 2.0) return 80;       // Moderately balanced
    if (ratioDiff <= 3.0) return 60;       // Somewhat imbalanced
    return 40;                              // Poorly balanced
  }

  /**
   * Get health status and color
   */
  getHealthStatus(score) {
    if (score >= 80) {
      return {
        status: 'Excellent',
        color: 'green',
        bgColor: 'bg-green-500',
        textColor: 'text-green-700',
        bgClass: 'bg-green-50 border-green-200',
        description: 'Your soil is in excellent condition for farming!'
      };
    } else if (score >= 65) {
      return {
        status: 'Good',
        color: 'lime',
        bgColor: 'bg-lime-500',
        textColor: 'text-lime-700',
        bgClass: 'bg-lime-50 border-lime-200',
        description: 'Your soil is good but could be improved slightly.'
      };
    } else if (score >= 50) {
      return {
        status: 'Moderate',
        color: 'yellow',
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgClass: 'bg-yellow-50 border-yellow-200',
        description: 'Your soil needs some improvements for optimal farming.'
      };
    } else if (score >= 35) {
      return {
        status: 'Poor',
        color: 'orange',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgClass: 'bg-orange-50 border-orange-200',
        description: 'Your soil requires significant attention and treatment.'
      };
    } else {
      return {
        status: 'Critical',
        color: 'red',
        bgColor: 'bg-red-500',
        textColor: 'text-red-700',
        bgClass: 'bg-red-50 border-red-200',
        description: 'Your soil needs immediate intervention and rehabilitation.'
      };
    }
  }

  /**
   * Get recommendations based on deficiencies
   */
  getRecommendations(ph, nitrogen, phosphorus, potassium) {
    const recommendations = [];

    // pH recommendations
    if (ph && ph < 6.0) {
      recommendations.push({
        issue: 'Low pH (Acidic)',
        action: 'Apply lime or wood ash to raise pH',
        priority: 'high'
      });
    } else if (ph && ph > 7.5) {
      recommendations.push({
        issue: 'High pH (Alkaline)',
        action: 'Add organic matter or sulfur to lower pH',
        priority: 'high'
      });
    }

    // Nitrogen recommendations
    if (nitrogen && nitrogen < 150) {
      recommendations.push({
        issue: 'Low Nitrogen',
        action: 'Apply urea or organic compost',
        priority: 'medium'
      });
    } else if (nitrogen && nitrogen > 400) {
      recommendations.push({
        issue: 'Excess Nitrogen',
        action: 'Reduce nitrogen fertilizer application',
        priority: 'low'
      });
    }

    // Phosphorus recommendations
    if (phosphorus && phosphorus < 10) {
      recommendations.push({
        issue: 'Low Phosphorus',
        action: 'Apply DAP or bone meal',
        priority: 'medium'
      });
    }

    // Potassium recommendations
    if (potassium && potassium < 100) {
      recommendations.push({
        issue: 'Low Potassium',
        action: 'Apply MOP or wood ash',
        priority: 'medium'
      });
    }

    return recommendations;
  }
}

module.exports = new SoilHealthCalculator();
