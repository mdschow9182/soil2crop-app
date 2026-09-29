/**
 * Soil-Based Crop Recommendation Service
 * Rule-based crop recommendation using soil parameters (pH, N, P, K)
 */

/**
 * Crop suitability levels
 */
const SuitabilityLevel = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

/**
 * Get crops suitable for specific pH level
 */
const getCropsByPH = (ph) => {
  if (ph < 6) {
    // Acidic soil
    return [
      { crop: 'Groundnut', suitability: SuitabilityLevel.HIGH, reason: 'Thrives in acidic soil conditions' },
      { crop: 'Potato', suitability: SuitabilityLevel.HIGH, reason: 'Prefers acidic soil with pH 5.0-6.0' },
      { crop: 'Millets', suitability: SuitabilityLevel.MEDIUM, reason: 'Tolerates acidic conditions well' }
    ];
  } else if (ph >= 6 && ph <= 7.5) {
    // Neutral to slightly alkaline
    return [
      { crop: 'Rice', suitability: SuitabilityLevel.HIGH, reason: 'Optimal growth in neutral to slightly acidic soil' },
      { crop: 'Wheat', suitability: SuitabilityLevel.HIGH, reason: 'Prefers neutral pH range 6.0-7.5' },
      { crop: 'Maize', suitability: SuitabilityLevel.MEDIUM, reason: 'Grows well in neutral soil conditions' }
    ];
  } else {
    // Alkaline soil
    return [
      { crop: 'Cotton', suitability: SuitabilityLevel.HIGH, reason: 'Tolerates alkaline soil conditions' },
      { crop: 'Barley', suitability: SuitabilityLevel.HIGH, reason: 'Well-suited for alkaline soils' },
      { crop: 'Sorghum', suitability: SuitabilityLevel.MEDIUM, reason: 'Adaptable to alkaline conditions' }
    ];
  }
};

/**
 * Get crops based on Nitrogen level
 */
const getCropsByNitrogen = (nitrogenLevel) => {
  const level = nitrogenLevel.toLowerCase();
  
  if (level === 'low') {
    return [
      { crop: 'Pulses', suitability: SuitabilityLevel.HIGH, reason: 'Nitrogen-fixing crops improve soil fertility' },
      { crop: 'Gram', suitability: SuitabilityLevel.HIGH, reason: 'Leguminous crop that adds nitrogen to soil' }
    ];
  } else if (level === 'medium') {
    return [
      { crop: 'Rice', suitability: SuitabilityLevel.HIGH, reason: 'Moderate nitrogen requirement met' },
      { crop: 'Maize', suitability: SuitabilityLevel.MEDIUM, reason: 'Benefits from medium nitrogen levels' }
    ];
  } else if (level === 'high') {
    return [
      { crop: 'Leafy Vegetables', suitability: SuitabilityLevel.HIGH, reason: 'High nitrogen promotes leaf growth' },
      { crop: 'Spinach', suitability: SuitabilityLevel.HIGH, reason: 'Thrives in nitrogen-rich soil' }
    ];
  }
  
  return [];
};

/**
 * Get crops based on Phosphorus level
 */
const getCropsByPhosphorus = (phosphorusLevel) => {
  const level = phosphorusLevel.toLowerCase();
  
  if (level === 'low') {
    return [
      { crop: 'Root Crops', suitability: SuitabilityLevel.MEDIUM, reason: 'Root crops can extract phosphorus efficiently' },
      { crop: 'Sweet Potato', suitability: SuitabilityLevel.MEDIUM, reason: 'Adaptable to low phosphorus conditions' }
    ];
  } else if (level === 'medium') {
    return [
      { crop: 'Cereals', suitability: SuitabilityLevel.HIGH, reason: 'Cereal crops thrive with moderate phosphorus' },
      { crop: 'Wheat', suitability: SuitabilityLevel.HIGH, reason: 'Good phosphorus availability for grain development' }
    ];
  } else if (level === 'high') {
    return [
      { crop: 'Vegetables', suitability: SuitabilityLevel.HIGH, reason: 'High phosphorus supports vegetable growth' },
      { crop: 'Tomato', suitability: SuitabilityLevel.HIGH, reason: 'Benefits from abundant phosphorus' }
    ];
  }
  
  return [];
};

/**
 * Get crops based on Potassium level
 */
const getCropsByPotassium = (potassiumLevel) => {
  const level = potassiumLevel.toLowerCase();
  
  if (level === 'low') {
    return [
      { crop: 'Millets', suitability: SuitabilityLevel.MEDIUM, reason: 'Low potassium requirement' },
      { crop: 'Sorghum', suitability: SuitabilityLevel.MEDIUM, reason: 'Can tolerate low potassium levels' }
    ];
  } else if (level === 'medium') {
    return [
      { crop: 'Wheat', suitability: SuitabilityLevel.HIGH, reason: 'Optimal potassium for grain development' },
      { crop: 'Rice', suitability: SuitabilityLevel.HIGH, reason: 'Medium potassium supports healthy growth' }
    ];
  } else if (level === 'high') {
    return [
      { crop: 'Banana', suitability: SuitabilityLevel.HIGH, reason: 'Heavy potassium feeder - thrives in high K soil' },
      { crop: 'Cotton', suitability: SuitabilityLevel.HIGH, reason: 'High potassium improves fiber quality' },
      { crop: 'Sugarcane', suitability: SuitabilityLevel.HIGH, reason: 'Requires abundant potassium for sugar production' }
    ];
  }
  
  return [];
};

/**
 * Calculate overall suitability score for a crop
 */
const calculateSuitabilityScore = (cropRecommendations) => {
  const scoreMap = {
    [SuitabilityLevel.HIGH]: 3,
    [SuitabilityLevel.MEDIUM]: 2,
    [SuitabilityLevel.LOW]: 1
  };
  
  let totalScore = 0;
  let count = 0;
  
  cropRecommendations.forEach(rec => {
    totalScore += scoreMap[rec.suitability] || 0;
    count++;
  });
  
  return count > 0 ? totalScore / count : 0;
};

/**
 * Get suitability level from score
 */
const getSuitabilityFromScore = (score) => {
  if (score >= 2.5) return SuitabilityLevel.HIGH;
  if (score >= 1.5) return SuitabilityLevel.MEDIUM;
  return SuitabilityLevel.LOW;
};

/**
 * Main function: Generate crop recommendations based on soil parameters
 * @param {Object} soilData - Soil test results
 * @param {number} soilData.pH - Soil pH value (0-14)
 * @param {string} soilData.nitrogen - Nitrogen level (Low/Medium/High)
 * @param {string} soilData.phosphorus - Phosphorus level (Low/Medium/High)
 * @param {string} soilData.potassium - Potassium level (Low/Medium/High)
 * @returns {Object} Crop recommendations with top 3 suitable crops
 */
const generateCropRecommendations = (soilData) => {
  const { pH, nitrogen, phosphorus, potassium } = soilData;
  
  console.log('🌱 Generating crop recommendations based on soil parameters:');
  console.log(`   pH: ${pH}`);
  console.log(`   Nitrogen: ${nitrogen}`);
  console.log(`   Phosphorus: ${phosphorus}`);
  console.log(`   Potassium: ${potassium}`);
  
  // Get recommendations from each parameter
  const phCrops = getCropsByPH(pH);
  const nitrogenCrops = getCropsByNitrogen(nitrogen);
  const phosphorusCrops = getCropsByPhosphorus(phosphorus);
  const potassiumCrops = getCropsByPotassium(potassium);
  
  console.log('\n📊 Parameter-based recommendations:');
  console.log(`   pH crops: ${phCrops.length}`);
  console.log(`   Nitrogen crops: ${nitrogenCrops.length}`);
  console.log(`   Phosphorus crops: ${phosphorusCrops.length}`);
  console.log(`   Potassium crops: ${potassiumCrops.length}`);
  
  // Combine all recommendations
  const cropMap = new Map();
  
  // Helper to add crops to map
  const addCropToMap = (crops, parameter) => {
    crops.forEach(({ crop, suitability, reason }) => {
      if (!cropMap.has(crop)) {
        cropMap.set(crop, {
          cropName: crop,
          suitabilityScores: [],
          reasons: [],
          parameters: new Set()
        });
      }
      
      const cropData = cropMap.get(crop);
      cropData.suitabilityScores.push(suitability);
      cropData.reasons.push(reason);
      cropData.parameters.add(parameter);
    });
  };
  
  // Add all crops
  addCropToMap(phCrops, 'pH');
  addCropToMap(nitrogenCrops, 'Nitrogen');
  addCropToMap(phosphorusCrops, 'Phosphorus');
  addCropToMap(potassiumCrops, 'Potassium');
  
  // Calculate overall suitability for each crop
  const allRecommendations = Array.from(cropMap.values()).map(cropData => {
    const avgScore = calculateSuitabilityScore(
      cropData.suitabilityScores.map(s => ({ suitability: s }))
    );
    
    return {
      cropName: cropData.cropName,
      suitability: getSuitabilityFromScore(avgScore),
      suitabilityScore: avgScore,
      reasons: cropData.reasons,
      matchedParameters: Array.from(cropData.parameters),
      parameterCount: cropData.parameters.size,
      reasoning: cropData.reasons.join('. ') + '.'
    };
  });
  
  // Sort by parameter count (more matches = better) and then by suitability score
  allRecommendations.sort((a, b) => {
    if (b.parameterCount !== a.parameterCount) {
      return b.parameterCount - a.parameterCount;
    }
    return b.suitabilityScore - a.suitabilityScore;
  });
  
  // Get top 3 recommendations
  const top3 = allRecommendations.slice(0, 3);
  
  console.log('\n✅ Top 3 Recommendations:');
  top3.forEach((rec, idx) => {
    console.log(`   ${idx + 1}. ${rec.cropName} (Suitability: ${rec.suitability}, Score: ${rec.suitabilityScore.toFixed(2)})`);
  });
  
  return {
    success: true,
    data: {
      soilParameters: {
        pH,
        nitrogen,
        phosphorus,
        potassium
      },
      allRecommendations,
      top3,
      summary: `Based on your soil analysis (pH: ${pH}, N: ${nitrogen}, P: ${phosphorus}, K: ${potassium}), we recommend ${top3.map(c => c.cropName).join(', ')} as the most suitable crops.`,
      disclaimer: 'These recommendations are based on soil parameters only. Consider weather, market conditions, and local expertise before final decision.'
    }
  };
};

module.exports = {
  generateCropRecommendations,
  getCropsByPH,
  getCropsByNitrogen,
  getCropsByPhosphorus,
  getCropsByPotassium,
  SuitabilityLevel
};
