class UserModel {
  final String userId;
  final String mobile;
  final String district;
  final String language;
  final DateTime createdAt;

  UserModel({
    required this.userId,
    required this.mobile,
    required this.district,
    required this.language,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'mobile': mobile,
      'district': district,
      'language': language,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      userId: map['userId'] ?? '',
      mobile: map['mobile'] ?? '',
      district: map['district'] ?? '',
      language: map['language'] ?? 'en',
      createdAt: DateTime.parse(map['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }
}

// Supported languages
class AppLanguages {
  static const Map<String, String> languages = {
    'en': 'English',
    'hi': 'हिंदी (Hindi)',
    'te': 'తెలుగు (Telugu)',
    'ta': 'தமிழ் (Tamil)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
  };
}
