class CropRecommendation {
  final String crop;
  final double soilMatchPercentage;
  final double weatherCompatibility;
  final double marketStability;
  final double finalScore;
  final String soilRisk;
  final String weatherRisk;
  final String marketRisk;
  final String overallRisk;
  final String reasoning;
  final List<String> whyNotOthers;

  CropRecommendation({
    required this.crop,
    required this.soilMatchPercentage,
    required this.weatherCompatibility,
    required this.marketStability,
    required this.finalScore,
    required this.soilRisk,
    required this.weatherRisk,
    required this.marketRisk,
    required this.overallRisk,
    required this.reasoning,
    required this.whyNotOthers,
  });

  Map<String, dynamic> toMap() {
    return {
      'crop': crop,
      'soilMatchPercentage': soilMatchPercentage,
      'weatherCompatibility': weatherCompatibility,
      'marketStability': marketStability,
      'finalScore': finalScore,
      'soilRisk': soilRisk,
      'weatherRisk': weatherRisk,
      'marketRisk': marketRisk,
      'overallRisk': overallRisk,
      'reasoning': reasoning,
      'whyNotOthers': whyNotOthers,
    };
  }
}

class WeatherData {
  final double rainProbability;
  final double temperature;
  final bool droughtRisk;
  final bool excessRainRisk;

  WeatherData({
    required this.rainProbability,
    required this.temperature,
    required this.droughtRisk,
    required this.excessRainRisk,
  });

  factory WeatherData.fromOpenWeather(Map<String, dynamic> data) {
    final rainProb = (data['pop'] ?? 0.0) * 100; // Probability of precipitation
    final temp = (data['main']['temp'] ?? 25.0).toDouble();
    
    return WeatherData(
      rainProbability: rainProb,
      temperature: temp,
      droughtRisk: rainProb < 20 && temp > 35,
      excessRainRisk: rainProb > 70,
    );
  }
}

class FeedbackModel {
  final String feedbackId;
  final String userId;
  final String soilType;
  final String cropChosen;
  final double approximateYield;
  final int satisfactionLevel; // 1-5
  final DateTime createdAt;

  FeedbackModel({
    required this.feedbackId,
    required this.userId,
    required this.soilType,
    required this.cropChosen,
    required this.approximateYield,
    required this.satisfactionLevel,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'feedbackId': feedbackId,
      'userId': userId,
      'soilType': soilType,
      'cropChosen': cropChosen,
      'approximateYield': approximateYield,
      'satisfactionLevel': satisfactionLevel,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory FeedbackModel.fromMap(Map<String, dynamic> map) {
    return FeedbackModel(
      feedbackId: map['feedbackId'] ?? '',
      userId: map['userId'] ?? '',
      soilType: map['soilType'] ?? '',
      cropChosen: map['cropChosen'] ?? '',
      approximateYield: (map['approximateYield'] ?? 0).toDouble(),
      satisfactionLevel: map['satisfactionLevel'] ?? 3,
      createdAt: DateTime.parse(map['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

class TutorialVideo {
  final String videoId;
  final String title;
  final String language;
  final String youtubeUrl;
  final int order;

  TutorialVideo({
    required this.videoId,
    required this.title,
    required this.language,
    required this.youtubeUrl,
    required this.order,
  });

  Map<String, dynamic> toMap() {
    return {
      'videoId': videoId,
      'title': title,
      'language': language,
      'youtubeUrl': youtubeUrl,
      'order': order,
    };
  }

  factory TutorialVideo.fromMap(Map<String, dynamic> map) {
    return TutorialVideo(
      videoId: map['videoId'] ?? '',
      title: map['title'] ?? '',
      language: map['language'] ?? 'en',
      youtubeUrl: map['youtubeUrl'] ?? '',
      order: map['order'] ?? 0,
    );
  }

  // Extract YouTube video ID from URL
  String get youtubeVideoId {
    final uri = Uri.parse(youtubeUrl);
    if (uri.host.contains('youtube.com')) {
      return uri.queryParameters['v'] ?? '';
    } else if (uri.host.contains('youtu.be')) {
      return uri.pathSegments.first;
    }
    return '';
  }
}
