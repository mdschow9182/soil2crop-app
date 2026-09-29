class CropModel {
  final String cropId;
  final String cropName;
  final double minN;
  final double maxN;
  final double minP;
  final double maxP;
  final double minK;
  final double maxK;
  final double minPH;
  final double maxPH;
  final String waterRequirement; // Low, Medium, High
  final bool rainDependency;
  final String marketVolatility; // Low, Medium, High
  final double averageYield;

  CropModel({
    required this.cropId,
    required this.cropName,
    required this.minN,
    required this.maxN,
    required this.minP,
    required this.maxP,
    required this.minK,
    required this.maxK,
    required this.minPH,
    required this.maxPH,
    required this.waterRequirement,
    required this.rainDependency,
    required this.marketVolatility,
    required this.averageYield,
  });

  Map<String, dynamic> toMap() {
    return {
      'cropId': cropId,
      'cropName': cropName,
      'minN': minN,
      'maxN': maxN,
      'minP': minP,
      'maxP': maxP,
      'minK': minK,
      'maxK': maxK,
      'minPH': minPH,
      'maxPH': maxPH,
      'waterRequirement': waterRequirement,
      'rainDependency': rainDependency,
      'marketVolatility': marketVolatility,
      'averageYield': averageYield,
    };
  }

  factory CropModel.fromMap(Map<String, dynamic> map) {
    return CropModel(
      cropId: map['cropId'] ?? '',
      cropName: map['cropName'] ?? '',
      minN: (map['minN'] ?? 0).toDouble(),
      maxN: (map['maxN'] ?? 0).toDouble(),
      minP: (map['minP'] ?? 0).toDouble(),
      maxP: (map['maxP'] ?? 0).toDouble(),
      minK: (map['minK'] ?? 0).toDouble(),
      maxK: (map['maxK'] ?? 0).toDouble(),
      minPH: (map['minPH'] ?? 0).toDouble(),
      maxPH: (map['maxPH'] ?? 14).toDouble(),
      waterRequirement: map['waterRequirement'] ?? 'Medium',
      rainDependency: map['rainDependency'] ?? false,
      marketVolatility: map['marketVolatility'] ?? 'Medium',
      averageYield: (map['averageYield'] ?? 0).toDouble(),
    );
  }
}

// Sample crop database - to be seeded in Firestore
class CropDatabase {
  static List<CropModel> getDefaultCrops() {
    return [
      CropModel(
        cropId: 'rice',
        cropName: 'Rice',
        minN: 100, maxN: 200,
        minP: 15, maxP: 40,
        minK: 100, maxK: 200,
        minPH: 5.5, maxPH: 7.5,
        waterRequirement: 'High',
        rainDependency: true,
        marketVolatility: 'Low',
        averageYield: 25.0,
      ),
      CropModel(
        cropId: 'wheat',
        cropName: 'Wheat',
        minN: 80, maxN: 150,
        minP: 20, maxP: 40,
        minK: 80, maxK: 150,
        minPH: 6.0, maxPH: 7.5,
        waterRequirement: 'Medium',
        rainDependency: false,
        marketVolatility: 'Medium',
        averageYield: 30.0,
      ),
      CropModel(
        cropId: 'maize',
        cropName: 'Maize',
        minN: 100, maxN: 180,
        minP: 15, maxP: 35,
        minK: 100, maxK: 180,
        minPH: 5.8, maxPH: 7.0,
        waterRequirement: 'Medium',
        rainDependency: true,
        marketVolatility: 'Medium',
        averageYield: 35.0,
      ),
      CropModel(
        cropId: 'cotton',
        cropName: 'Cotton',
        minN: 80, maxN: 150,
        minP: 20, maxP: 40,
        minK: 80, maxK: 150,
        minPH: 6.0, maxPH: 8.0,
        waterRequirement: 'High',
        rainDependency: false,
        marketVolatility: 'High',
        averageYield: 15.0,
      ),
      CropModel(
        cropId: 'sugarcane',
        cropName: 'Sugarcane',
        minN: 120, maxN: 250,
        minP: 25, maxP: 50,
        minK: 120, maxK: 250,
        minPH: 6.0, maxPH: 8.0,
        waterRequirement: 'High',
        rainDependency: true,
        marketVolatility: 'Medium',
        averageYield: 400.0,
      ),
      CropModel(
        cropId: 'groundnut',
        cropName: 'Groundnut',
        minN: 20, maxN: 60,
        minP: 15, maxP: 30,
        minK: 40, maxK: 80,
        minPH: 6.0, maxPH: 7.5,
        waterRequirement: 'Low',
        rainDependency: true,
        marketVolatility: 'High',
        averageYield: 12.0,
      ),
      CropModel(
        cropId: 'pulses',
        cropName: 'Pulses',
        minN: 20, maxN: 60,
        minP: 15, maxP: 30,
        minK: 40, maxK: 80,
        minPH: 6.0, maxPH: 8.0,
        waterRequirement: 'Low',
        rainDependency: true,
        marketVolatility: 'Medium',
        averageYield: 10.0,
      ),
      CropModel(
        cropId: 'millets',
        cropName: 'Millets',
        minN: 30, maxN: 70,
        minP: 10, maxP: 25,
        minK: 30, maxK: 70,
        minPH: 5.5, maxPH: 7.5,
        waterRequirement: 'Low',
        rainDependency: true,
        marketVolatility: 'Low',
        averageYield: 15.0,
      ),
    ];
  }
}
