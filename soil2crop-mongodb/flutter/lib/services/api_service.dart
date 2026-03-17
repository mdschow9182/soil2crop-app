import 'dart:convert';
import 'package:http/http.dart' as http;

/// API Service for Soil2Crop Backend
/// Handles all HTTP requests to Node.js + MongoDB backend
class ApiService {
  // Base URL - change this to your deployed backend URL
  static const String baseUrl = 'http://localhost:5000/api';
  
  // For production, use:
  // static const String baseUrl = 'https://your-api-domain.com/api';

  static final Map<String, String> headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // ==================== USER APIs ====================

  /// Register new user
  static Future<Map<String, dynamic>> registerUser({
    required String mobile,
    required String district,
    required String language,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/register'),
        headers: headers,
        body: jsonEncode({
          'mobile': mobile,
          'district': district,
          'language': language,
          'password': password,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  /// Login user
  static Future<Map<String, dynamic>> loginUser({
    required String mobile,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/login'),
        headers: headers,
        body: jsonEncode({
          'mobile': mobile,
          'password': password,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ==================== SOIL REPORT APIs ====================

  /// Submit soil report
  static Future<Map<String, dynamic>> submitSoilReport({
    required String userId,
    required double nitrogen,
    required double phosphorus,
    required double potassium,
    required double ph,
    DateTime? reportDate,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/soilreport'),
        headers: headers,
        body: jsonEncode({
          'userId': userId,
          'nitrogen': nitrogen,
          'phosphorus': phosphorus,
          'potassium': potassium,
          'ph': ph,
          'reportDate': reportDate?.toIso8601String(),
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  /// Get user's soil reports
  static Future<Map<String, dynamic>> getSoilReports(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/soilreport/$userId'),
        headers: headers,
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ==================== RECOMMENDATION APIs ====================

  /// Get crop recommendations
  static Future<Map<String, dynamic>> getRecommendations({
    required String userId,
    required String reportId,
    required String district,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/recommendations/$userId?reportId=$reportId&district=$district'),
        headers: headers,
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ==================== FEEDBACK APIs ====================

  /// Submit feedback
  static Future<Map<String, dynamic>> submitFeedback({
    required String userId,
    required String soilReportId,
    required String cropChosen,
    required double approximateYield,
    required int satisfactionLevel,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/feedback'),
        headers: headers,
        body: jsonEncode({
          'userId': userId,
          'soilReportId': soilReportId,
          'cropChosen': cropChosen,
          'approximateYield': approximateYield,
          'satisfactionLevel': satisfactionLevel,
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  /// Get feedback stats for district
  static Future<Map<String, dynamic>> getFeedbackStats(String district) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/feedback/stats/$district'),
        headers: headers,
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ==================== CROP APIs ====================

  /// Get all crops
  static Future<Map<String, dynamic>> getCrops() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/crops'),
        headers: headers,
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {
        'success': false,
        'message': 'Network error: $e',
      };
    }
  }

  // ==================== HEALTH CHECK ====================

  /// Check API health
  static Future<bool> checkHealth() async {
    try {
      final response = await http.get(
        Uri.parse(baseUrl.replaceAll('/api', '/health')),
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
