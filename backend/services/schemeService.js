/**
 * Government Scheme Service
 * 
 * Provides recommendations for government agriculture schemes based on farmer inputs
 */

class SchemeService {
  /**
   * Get scheme recommendations based on farmer profile
   * @param {Object} criteria - { soil_type, crop_selected, field_size, farmer_location }
   * @returns {Array} Array of recommended schemes
   */
  getRecommendations(criteria) {
    const { soil_type, crop_selected, field_size, farmer_location } = criteria;
    const recommendations = [];

    // PM Kisan - For small and marginal farmers (< 2 hectares)
    if (field_size && field_size < 2) {
      recommendations.push({
        name: "PM Kisan",
        benefit: "Income support of ₹6,000 per year in 3 installments",
        eligibility: "Small and marginal farmers (landholding < 2 hectares)",
        link: "https://pmkisan.gov.in",
        category: "Income Support"
      });
    }

    // PM Fasal Bima Yojana - For high-risk crops or all farmers
    if (this.isHighRiskCrop(crop_selected)) {
      recommendations.push({
        name: "PM Fasal Bima Yojana (PMFBY)",
        benefit: "Comprehensive insurance coverage against crop failure",
        eligibility: "All farmers growing notified crops",
        link: "https://pmfby.gov.in",
        category: "Insurance"
      });
    }

    // PM Krishi Sinchayee Yojana - For irrigation needs
    if (this.needsIrrigation(soil_type, crop_selected)) {
      recommendations.push({
        name: "PM Krishi Sinchayee Yojana (PMKSY)",
        benefit: "Micro-irrigation subsidies and water conservation support",
        eligibility: "All farmers, priority to water-scarce areas",
        link: "https://pmksy.gov.in",
        category: "Irrigation"
      });
    }

    // Paramparagat Krishi Vikas Yojana - For organic farming
    if (this.isOrganicCrop(crop_selected) || soil_type === 'Loamy') {
      recommendations.push({
        name: "Paramparagat Krishi Vikas Yojana (PKVY)",
        benefit: "Support for organic farming practices and certification",
        eligibility: "Farmers interested in organic cultivation",
        link: "https://pgsindia-ncof.gov.in",
        category: "Organic Farming"
      });
    }

    // Rashtriya Krishi Vikas Yojana - General development
    if (farmer_location) {
      recommendations.push({
        name: "Rashtriya Krishi Vikas Yojana (RKVY)",
        benefit: "Holistic agricultural development support",
        eligibility: "All farmers based on state-specific criteria",
        link: "https://rkvymidh.gov.in",
        category: "General Development"
      });
    }

    // Soil Health Card - Based on soil type
    if (soil_type) {
      recommendations.push({
        name: "Soil Health Card Scheme",
        benefit: "Free soil testing and nutrient management advice",
        eligibility: "All farmers",
        link: "https://soilhealth.dac.gov.in",
        category: "Soil Management"
      });
    }

    return recommendations;
  }

  /**
   * Check if crop is high-risk (requires insurance)
   */
  isHighRiskCrop(crop) {
    if (!crop) return false;
    const highRiskCrops = ['Sugarcane', 'Cotton', 'Groundnut', 'Maize', 'Paddy'];
    return highRiskCrops.some(riskCrop => 
      crop.toLowerCase().includes(riskCrop.toLowerCase())
    );
  }

  /**
   * Check if crop/soil combination needs irrigation support
   */
  needsIrrigation(soilType, crop) {
    if (!soilType && !crop) return false;
    
    const irrigatedSoils = ['Sandy', 'Red'];
    const waterIntensiveCrops = ['Paddy', 'Sugarcane', 'Banana'];
    
    return irrigatedSoils.includes(soilType) || 
           (crop && waterIntensiveCrops.some(wc => 
             crop.toLowerCase().includes(wc.toLowerCase())));
  }

  /**
   * Check if crop is suitable for organic farming
   */
  isOrganicCrop(crop) {
    if (!crop) return false;
    const organicCrops = ['Pulses', 'Millets', 'Oilseeds', 'Vegetables', 'Fruits'];
    return organicCrops.some(orgCrop => 
      crop.toLowerCase().includes(orgCrop.toLowerCase())
    );
  }
}

module.exports = new SchemeService();
