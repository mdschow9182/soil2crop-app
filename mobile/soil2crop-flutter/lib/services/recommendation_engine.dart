import '../models/crop_model.dart';
import '../models/soil_report_model.dart';
import '../models/recommendation_model.dart';

/// Rule-based recommendation engine
/// NO machine learning - transparent, explainable logic only
class RecommendationEngine {
  
  /// Generate crop recommendations based on soil and weather data
  static List<CropRecommendation> generateRecommendations({
    required SoilReportModel soilReport,
    required WeatherData weather,
    required List<CropModel> availableCrops,
  }) {
    final recommendations = <CropRecommendation>[];

    for (final crop in availableCrops) {
      // Step 1: Check soil compatibility
      final soilMatch = _calculateSoilMatch(crop, soilReport);
      if (soilMatch <= 0) continue; // Skip incompatible crops

      // Step 2: Check weather compatibility
      final weatherCompat = _calculateWeatherCompatibility(crop, weather);
      
      // Step 3: Calculate market stability
      final marketStability = _calculateMarketStability(crop);

      // Step 4: Calculate final score
      // Formula: (Soil Match * 0.5) + (Weather * 0.3) + (Market * 0.2)
      final finalScore = (soilMatch * 0.5) + (weatherCompat * 0.3) + (marketStability * 0.2);

      // Step 5: Determine risks
      final soilRisk = _getSoilRisk(soilMatch);
      final weatherRisk = _getWeatherRisk(weatherCompat, crop);
      final marketRisk = crop.marketVolatility;
      final overallRisk = _calculateOverallRisk(soilRisk, weatherRisk, marketRisk);

      // Step 6: Generate reasoning
      final reasoning = _generateReasoning(crop, soilMatch, weatherCompat, soilReport);

      recommendations.add(CropRecommendation(
        crop: crop.cropName,
        soilMatchPercentage: soilMatch,
        weatherCompatibility: weatherCompat,
        marketStability: marketStability,
        finalScore: finalScore,
        soilRisk: soilRisk,
        weatherRisk: weatherRisk,
        marketRisk: marketRisk,
        overallRisk: overallRisk,
        reasoning: reasoning,
        whyNotOthers: [], // Will be populated after sorting
      ));
    }

    // Sort by final score (descending)
    recommendations.sort((a, b) => b.finalScore.compareTo(a.finalScore));

    // Take top 3 only
    final top3 = recommendations.take(3).toList();

    // Generate "why not others" for each
    for (int i = 0; i < top3.length; i++) {
      final whyNotOthers = _generateWhyNotOthers(top3[i], recommendations.skip(3).toList());
      top3[i] = CropRecommendation(
        crop: top3[i].crop,
        soilMatchPercentage: top3[i].soilMatchPercentage,
        weatherCompatibility: top3[i].weatherCompatibility,
        marketStability: top3[i].marketStability,
        finalScore: top3[i].finalScore,
        soilRisk: top3[i].soilRisk,
        weatherRisk: top3[i].weatherRisk,
        marketRisk: top3[i].marketRisk,
        overallRisk: top3[i].overallRisk,
        reasoning: top3[i].reasoning,
        whyNotOthers: whyNotOthers,
      );
    }

    return top3;
  }

  /// Calculate how well crop matches soil conditions (0-100)
  static double _calculateSoilMatch(CropModel crop, SoilReportModel soil) {
    double match = 100;
    final issues = <String>[];

    // Check NPK ranges
    if (soil.nitrogen < crop.minN || soil.nitrogen > crop.maxN) {
      match -= 20;
      issues.add('Nitrogen level not optimal');
    }
    if (soil.phosphorus < crop.minP || soil.phosphorus > crop.maxP) {
      match -= 20;
      issues.add('Phosphorus level not optimal');
    }
    if (soil.potassium < crop.minK || soil.potassium > crop.maxK) {
      match -= 20;
      issues.add('Potassium level not optimal');
    }
    if (soil.ph < crop.minPH || soil.ph > crop.maxPH) {
      match -= 25;
      issues.add('pH level not suitable');
    }

    // If multiple critical issues, crop is incompatible
    if (issues.length >= 3) return 0;

    return match.clamp(0, 100);
  }

  /// Calculate weather compatibility (0-100)
  static double _calculateWeatherCompatibility(CropModel crop, WeatherData weather) {
    double compat = 100;

    // Drought risk affects high water requirement crops
    if (weather.droughtRisk && crop.waterRequirement == 'High') {
      compat -= 40;
    }

    // Excess rain affects rain-dependent crops
    if (weather.excessRainRisk && crop.rainDependency) {
      compat -= 30;
    }

    // Temperature extremes
    if (weather.temperature > 40) {
      compat -= 20;
    }

    return compat.clamp(0, 100);
  }

  /// Calculate market stability score (0-100)
  static double _calculateMarketStability(CropModel crop) {
    switch (crop.marketVolatility) {
      case 'Low':
        return 90;
      case 'Medium':
        return 70;
      case 'High':
        return 50;
      default:
        return 70;
    }
  }

  static String _getSoilRisk(double match) {
    if (match >= 80) return 'Low';
    if (match >= 60) return 'Medium';
    return 'High';
  }

  static String _getWeatherRisk(double compat, CropModel crop) {
    if (compat >= 80) return 'Low';
    if (compat >= 60) return 'Medium';
    return 'High';
  }

  static String _calculateOverallRisk(String soil, String weather, String market) {
    final risks = [soil, weather, market];
    if (risks.any((r) => r == 'High')) return 'High';
    if (risks.any((r) => r == 'Medium')) return 'Medium';
    return 'Low';
  }

  static String _generateReasoning(CropModel crop, double soilMatch, double weatherCompat, SoilReportModel soil) {
    final reasons = <String>[];

    if (soilMatch >= 80) {
      reasons.add('Your soil conditions are well-suited for ${crop.cropName}');
    } else if (soilMatch >= 60) {
      reasons.add('Your soil is moderately suitable for ${crop.cropName} with some amendments');
    }

    if (weatherCompat >= 80) {
      reasons.add('Current weather conditions favor this crop');
    }

    if (crop.waterRequirement == 'Low') {
      reasons.add('Requires less water - good for water-scarce regions');
    }

    return reasons.join('. ');
  }

  static List<String> _generateWhyNotOthers(CropRecommendation selected, List<CropRecommendation> others) {
    return others.take(2).map((other) {
      if (other.soilMatchPercentage < 50) {
        return '${other.crop}: Soil conditions not suitable';
      } else if (other.weatherCompatibility < 50) {
        return '${other.crop}: Current weather unfavorable';
      } else {
        return '${other.crop}: Lower overall match score';
      }
    }).toList();
  }

  /// Simple pattern-based learning from feedback
  /// Returns frequency-based insight for similar soil conditions
  static String? generateCommunityInsight({
    required String district,
    required String soilType,
    required List<FeedbackModel> feedbacks,
  }) {
    // Filter feedbacks from same district with similar soil
    final relevant = feedbacks.where((f) => 
      f.soilType == soilType
    ).toList();

    if (relevant.length < 5) return null; // Not enough data

    // Count crop choices
    final cropCounts = <String, int>{};
    for (final f in relevant) {
      cropCounts[f.cropChosen] = (cropCounts[f.cropChosen] ?? 0) + 1;
    }

    // Find most common
    final mostCommon = cropCounts.entries.reduce((a, b) => a.value > b.value ? a : b);
    final percentage = ((mostCommon.value / relevant.length) * 100).round();

    if (percentage >= 40) {
      return 'In your district, $percentage% of farmers with similar soil chose ${mostCommon.key}';
    }

    return null;
  }
}
