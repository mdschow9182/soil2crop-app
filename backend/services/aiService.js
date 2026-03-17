/**
 * AI Service – Knowledge-Based Crop Advisory System
 *
 * ⚠️ This is NOT a trained ML model.
 * It uses rule-based + probabilistic reasoning.
 * Designed for explainability, research logging, and stability.
 */

const fs = require("fs");
const path = require("path");
const soilHealthCalculator = require("../utils/soilHealthCalculator");

class AIService {
  /* ======================================================
     MAIN AI ENGINE
  ====================================================== */

  /**
   * Generate crop suitability comparison (NOT a recommendation/decision)
   * Returns comparison data with risks, confidence, and explanations
   */
  generateRecommendation(soilData) {
    const startTime = Date.now();
    const { soil_type, ph, nitrogen, phosphorus, potassium, natural_farming = false } = soilData;

    /* ---------- Build Crop Comparison ---------- */
    const cropComparisons = this.buildCropComparisons(soil_type, ph, { nitrogen, phosphorus, potassium }, natural_farming);
    
    /* ---------- Soil Summary ---------- */
    const soilSummary = this.generateSoilSummary(soil_type, ph, { nitrogen, phosphorus, potassium });
    
    /* ---------- Fertilizer Advice ---------- */
    const fertilizerAdvice = this.generateFertilizerAdvice({ nitrogen, phosphorus, potassium }, natural_farming);

    // Calculate soil health score
    const healthScore = soilHealthCalculator.calculateHealthScore(
      ph, 
      nitrogen, 
      phosphorus, 
      potassium, 
      soil_type
    );
    const healthStatus = soilHealthCalculator.getHealthStatus(healthScore);
    const recommendations = soilHealthCalculator.getRecommendations(ph, nitrogen, phosphorus, potassium);

    const result = {
      // NEW: Comparison-based structure (not recommendation)
      soil_summary: soilSummary,
      crop_comparison: cropComparisons.slice(0, 3), // Max 3 crops
      fertilizer_advice: fertilizerAdvice,
      
      // LEGACY: Keep for backward compatibility
      recommended_crops: cropComparisons.slice(0, 3).map(c => c.crop),
      confidence: Math.max(0.4, Math.min(cropComparisons[0]?.confidence || 0.7, 0.95)),
      reasoning: cropComparisons[0]?.reasoning || "Analysis based on soil data.",
      ai_method: natural_farming ? "natural-farming-optimized" : "knowledge-based-comparison",
      
      // SAFETY: Required disclaimer
      disclaimer: "This is an advisory comparison only. Final crop decision remains with the farmer.",
      
      // NEW: Natural farming mode indicator
      natural_farming_mode: natural_farming,
      
      // NEW: Soil Health Score
      soil_health: {
        score: healthScore,
        status: healthStatus.status,
        color: healthStatus.color,
        description: healthStatus.description,
        recommendations: recommendations
      }
    };

    this.logAIDecision(soilData, result, Date.now() - startTime);
    return result;
  }

  /**
   * Build crop comparison list with risks and confidence
   */
  buildCropComparisons(soilType, ph, nutrients, naturalFarming = false) {
    // Natural farming crops optimized for AP's 2030 goal
    const naturalFarmingCrops = [
      { name: "Millets", priority: true, benefits: "Traditional crop, minimal water, no chemicals" },
      { name: "Pulses", priority: true, benefits: "Nitrogen-fixing, improves soil health" },
      { name: "Groundnut", priority: true, benefits: "Legume, drought-resistant" },
      { name: "Maize", priority: false, benefits: "Moderate input requirement" },
      { name: "Rice", priority: false, benefits: "High water requirement" }
    ];

    const allCrops = naturalFarming 
      ? naturalFarmingCrops.map(c => ({
          name: c.name,
          soilMatch: this.getCropSoilMatch(c.name),
          phRange: this.getCropPHRange(c.name),
          waterNeed: this.getCropWaterNeed(c.name),
          inputCost: naturalFarming && c.priority ? "Low" : this.getCropInputCost(c.name),
          marketRisk: this.getCropMarketRisk(c.name),
          naturalFarmingPriority: c.priority,
          naturalFarmingBenefits: c.benefits
        }))
      : [
          { name: "Rice", soilMatch: ["Loamy", "Clay"], phRange: [5.5, 7.5], waterNeed: "High", inputCost: "Medium", marketRisk: "Low" },
          { name: "Wheat", soilMatch: ["Loamy"], phRange: [6.0, 7.5], waterNeed: "Medium", inputCost: "Medium", marketRisk: "Medium" },
          { name: "Maize", soilMatch: ["Loamy", "Sandy"], phRange: [5.8, 7.0], waterNeed: "Medium", inputCost: "Medium", marketRisk: "Medium" },
          { name: "Groundnut", soilMatch: ["Sandy", "Loamy"], phRange: [6.0, 7.5], waterNeed: "Low", inputCost: "Low", marketRisk: "High" },
          { name: "Cotton", soilMatch: ["Loamy", "Clay"], phRange: [6.0, 8.0], waterNeed: "High", inputCost: "High", marketRisk: "High" },
          { name: "Sugarcane", soilMatch: ["Loamy", "Clay"], phRange: [6.0, 8.0], waterNeed: "High", inputCost: "High", marketRisk: "Medium" },
          { name: "Millets", soilMatch: ["Sandy", "Loamy"], phRange: [5.5, 7.5], waterNeed: "Low", inputCost: "Low", marketRisk: "Low" },
          { name: "Pulses", soilMatch: ["Loamy", "Clay"], phRange: [6.0, 8.0], waterNeed: "Low", inputCost: "Low", marketRisk: "Medium" }
        ];

    const comparisons = allCrops.map(crop => {
      let confidence = 0.5;
      const reasons = [];
      const risks = [];

      // Natural farming bonus
      if (naturalFarming && crop.naturalFarmingPriority) {
        confidence += 0.2;
        reasons.push(`Ideal for natural farming - ${crop.naturalFarmingBenefits}`);
      }

      // Soil type match
      if (crop.soilMatch.includes(soilType)) {
        confidence += 0.25;
        reasons.push(`Suitable for ${soilType} soil`);
      } else {
        confidence -= 0.15;
        risks.push(`Soil type mismatch - may need amendments`);
      }

      // pH match
      if (ph != null) {
        if (ph >= crop.phRange[0] && ph <= crop.phRange[1]) {
          confidence += 0.15;
          reasons.push(`pH ${ph} is optimal`);
        } else {
          confidence -= 0.1;
          risks.push(`pH adjustment may be needed`);
        }
      }

      // Nutrient considerations
      if (nutrients.nitrogen != null && nutrients.nitrogen < 100) {
        if (["Groundnut", "Pulses"].includes(crop.name)) {
          confidence += 0.1;
          reasons.push("Nitrogen-fixing crop suitable for low N soil");
        } else {
          risks.push("May need nitrogen fertilizer");
        }
      }

      // Water risk
      if (crop.waterNeed === "High") {
        risks.push("High water dependency - consider irrigation availability");
      }

      // Market risk
      if (crop.marketRisk === "High") {
        risks.push("Market price volatility");
      }

      // Natural farming-specific advice
      if (naturalFarming) {
        if (crop.inputCost === "Low") {
          reasons.push("Minimal external inputs required");
        }
        if (crop.waterNeed === "Low") {
          reasons.push("Drought-resistant variety");
        }
      }

      confidence = Math.max(0.3, Math.min(confidence, 0.95));

      return {
        crop: crop.name,
        soil_match: this.getMatchLevel(confidence),
        rain_dependency: crop.waterNeed,
        input_cost: crop.inputCost,
        market_risk: crop.marketRisk,
        confidence: Number(confidence.toFixed(2)),
        reasoning: reasons.join(". ") || "Moderate suitability based on soil data.",
        risks: risks.length > 0 ? risks : ["Standard cultivation risks apply"],
        natural_farming_suitable: naturalFarming && crop.naturalFarmingPriority === true
      };
    });

    // Sort by confidence descending, with natural farming priority boost
    if (naturalFarming) {
      comparisons.sort((a, b) => {
        if (a.natural_farming_suitable && !b.natural_farming_suitable) return -0.1;
        if (!a.natural_farming_suitable && b.natural_farming_suitable) return 0.1;
        return b.confidence - a.confidence;
      });
    } else {
      comparisons.sort((a, b) => b.confidence - a.confidence);
    }

    return comparisons;
  }

  // Helper methods for natural farming mode
  getCropSoilMatch(cropName) {
    const matches = {
      "Rice": ["Loamy", "Clay"],
      "Wheat": ["Loamy"],
      "Maize": ["Loamy", "Sandy"],
      "Groundnut": ["Sandy", "Loamy"],
      "Cotton": ["Loamy", "Clay"],
      "Sugarcane": ["Loamy", "Clay"],
      "Millets": ["Sandy", "Loamy"],
      "Pulses": ["Loamy", "Clay"]
    };
    return matches[cropName] || ["Loamy"];
  }

  getCropPHRange(cropName) {
    const ranges = {
      "Rice": [5.5, 7.5],
      "Wheat": [6.0, 7.5],
      "Maize": [5.8, 7.0],
      "Groundnut": [6.0, 7.5],
      "Cotton": [6.0, 8.0],
      "Sugarcane": [6.0, 8.0],
      "Millets": [5.5, 7.5],
      "Pulses": [6.0, 8.0]
    };
    return ranges[cropName] || [6.0, 7.5];
  }

  getCropWaterNeed(cropName) {
    const needs = {
      "Rice": "High",
      "Wheat": "Medium",
      "Maize": "Medium",
      "Groundnut": "Low",
      "Cotton": "High",
      "Sugarcane": "High",
      "Millets": "Low",
      "Pulses": "Low"
    };
    return needs[cropName] || "Medium";
  }

  getCropInputCost(cropName) {
    const costs = {
      "Rice": "Medium",
      "Wheat": "Medium",
      "Maize": "Medium",
      "Groundnut": "Low",
      "Cotton": "High",
      "Sugarcane": "High",
      "Millets": "Low",
      "Pulses": "Low"
    };
    return costs[cropName] || "Medium";
  }

  getCropMarketRisk(cropName) {
    const risks = {
      "Rice": "Low",
      "Wheat": "Medium",
      "Maize": "Medium",
      "Groundnut": "High",
      "Cotton": "High",
      "Sugarcane": "Medium",
      "Millets": "Low",
      "Pulses": "Medium"
    };
    return risks[cropName] || "Medium";
  }

  getMatchLevel(confidence) {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  }

  generateSoilSummary(soilType, ph, nutrients) {
    const parts = [];
    parts.push(`Soil type: ${soilType || "Unknown"}`);
    if (ph != null) parts.push(`pH: ${ph}`);
    if (nutrients.nitrogen != null) parts.push(`Nitrogen: ${nutrients.nitrogen} kg/ha`);
    return parts.join(" | ");
  }

  generateFertilizerAdvice(nutrients, naturalFarming = false) {
    if (naturalFarming) {
      // Natural farming recommendations
      return [
        "Use Jeevamrutham for microbial enrichment",
        "Apply Bijamrita for seed treatment",
        "Use Achhadana (mulching) to retain moisture",
        "Practice crop rotation with legumes",
        "Avoid chemical fertilizers completely"
      ];
    }
    
    const advice = [];
    if (nutrients.nitrogen != null && nutrients.nitrogen < 100) {
      advice.push("Nitrogen is low. Consider urea or organic manure.");
    }
    if (nutrients.phosphorus != null && nutrients.phosphorus < 10) {
      advice.push("Phosphorus is low. Consider SSP application.");
    }
    if (nutrients.potassium != null && nutrients.potassium < 150) {
      advice.push("Potassium is low. Consider MOP application.");
    }
    return advice.length > 0 ? advice : ["Soil nutrients appear adequate."];
  }

  /* ======================================================
     ANALYSIS HELPERS
  ====================================================== */

  analyzeSoilType(type) {
    switch (type) {
      case "Sandy":
        return {
          crops: ["Groundnut", "Millets", "Carrot"],
          fertilizerLevel: "High",
          confidence: 0.85,
          reasoning: "Sandy soil drains quickly; drought-resistant crops advised."
        };
      case "Loamy":
        return {
          crops: ["Rice", "Wheat", "Maize"],
          fertilizerLevel: "Medium",
          confidence: 0.9,
          reasoning: "Loamy soil is ideal for most crops."
        };
      case "Clay":
        return {
          crops: ["Paddy", "Sugarcane"],
          fertilizerLevel: "Low",
          confidence: 0.88,
          reasoning: "Clay soil retains water; water-loving crops recommended."
        };
      default:
        return {
          crops: ["Paddy", "Cotton"],
          fertilizerLevel: "Medium",
          confidence: 0.6,
          reasoning: "Unknown soil type; using general recommendations."
        };
    }
  }

  analyzePH(ph, crops) {
    let adjusted = [...crops];
    let confidenceAdjustment = 0;
    let reasoning = "";

    if (ph < 5.5) {
      adjusted = adjusted.filter(c => c !== "Wheat");
      confidenceAdjustment -= 0.05;
      reasoning = "Soil is acidic; lime recommended.";
    } else if (ph > 8.0) {
      adjusted = adjusted.filter(c => c !== "Rice");
      confidenceAdjustment -= 0.05;
      reasoning = "Soil is alkaline; gypsum recommended.";
    } else {
      confidenceAdjustment += 0.05;
      reasoning = "Soil pH is optimal.";
    }

    return { crops: adjusted, confidenceAdjustment, reasoning };
  }

  generateReasoning(factors, crops, soilType, ph) {
    return `Based on ${soilType} soil ${
      ph ? "with pH " + ph : ""
    }, recommended crops are ${crops.join(
      ", "
    )}. ${factors.join(" ")}`;
  }

  logAIDecision(input, output, timeMs) {
    const logPath = path.join(__dirname, "..", "logs", "ai-decisions.log");
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(
      logPath,
      JSON.stringify({
        time: new Date().toISOString(),
        input,
        output: {
          crops: output.recommended_crops,
          confidence: output.confidence
        },
        timeMs
      }) + "\n"
    );
  }
}

module.exports = new AIService();
