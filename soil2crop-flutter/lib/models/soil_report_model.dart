class SoilReportModel {
  final String reportId;
  final String userId;
  final double nitrogen;
  final double phosphorus;
  final double potassium;
  final double ph;
  final DateTime reportDate;
  final double confidenceScore;
  final DateTime createdAt;

  SoilReportModel({
    required this.reportId,
    required this.userId,
    required this.nitrogen,
    required this.phosphorus,
    required this.potassium,
    required this.ph,
    required this.reportDate,
    required this.confidenceScore,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'reportId': reportId,
      'userId': userId,
      'nitrogen': nitrogen,
      'phosphorus': phosphorus,
      'potassium': potassium,
      'ph': ph,
      'reportDate': reportDate.toIso8601String(),
      'confidenceScore': confidenceScore,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory SoilReportModel.fromMap(Map<String, dynamic> map) {
    return SoilReportModel(
      reportId: map['reportId'] ?? '',
      userId: map['userId'] ?? '',
      nitrogen: (map['nitrogen'] ?? 0).toDouble(),
      phosphorus: (map['phosphorus'] ?? 0).toDouble(),
      potassium: (map['potassium'] ?? 0).toDouble(),
      ph: (map['ph'] ?? 7.0).toDouble(),
      reportDate: DateTime.parse(map['reportDate'] ?? DateTime.now().toIso8601String()),
      confidenceScore: (map['confidenceScore'] ?? 100).toDouble(),
      createdAt: DateTime.parse(map['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  // Calculate confidence score based on data quality
  static double calculateConfidenceScore({
    required DateTime reportDate,
    required double nitrogen,
    required double phosphorus,
    required double potassium,
    required double ph,
  }) {
    double score = 100.0;

    // Check report age (-30% if older than 2 years)
    final ageInDays = DateTime.now().difference(reportDate).inDays;
    if (ageInDays > 730) {
      score -= 30;
    }

    // Check for missing/zero values (-10% each)
    if (nitrogen <= 0) score -= 10;
    if (phosphorus <= 0) score -= 10;
    if (potassium <= 0) score -= 10;
    if (ph <= 0) score -= 10;

    // Check for extreme values (-10% if any extreme)
    if (nitrogen > 500 || nitrogen < 0) score -= 10;
    if (phosphorus > 100 || phosphorus < 0) score -= 10;
    if (potassium > 500 || potassium < 0) score -= 10;
    if (ph > 14 || ph < 0) score -= 10;

    return score.clamp(0, 100);
  }

  static String getConfidenceLabel(double score) {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  }

  static String getConfidenceMessage(double score) {
    if (score < 50) {
      return 'Old or incomplete soil data may reduce recommendation accuracy.';
    }
    return '';
  }
}
