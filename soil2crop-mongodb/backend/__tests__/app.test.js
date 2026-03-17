const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.OPENWEATHER_API_KEY = '';

let app;
let mongoServer;

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set MongoDB URI
  process.env.MONGODB_URI = mongoUri;
  
  // Import app after setting env
  app = require('../server');
  
  // Wait for connection
  await new Promise(resolve => setTimeout(resolve, 1000));
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Soil2Crop API Tests', () => {
  
  // Test data
  const testUser = {
    mobile: '9876543210',
    district: 'Hyderabad',
    language: 'te',
    password: 'test123'
  };
  
  let userId;
  let reportId;
  
  // ==========================================
  // HEALTH CHECK
  // ==========================================
  describe('Health Check', () => {
    test('GET /health - should return ok', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('Soil2Crop API');
    });
  });
  
  // ==========================================
  // USER APIs
  // ==========================================
  describe('User APIs', () => {
    test('POST /api/users/register - should register new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data.mobile).toBe(testUser.mobile);
      
      userId = res.body.data.userId;
    });
    
    test('POST /api/users/register - should reject duplicate mobile', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send(testUser);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    test('POST /api/users/login - should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          mobile: testUser.mobile,
          password: testUser.password
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(userId);
    });
    
    test('POST /api/users/login - should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          mobile: testUser.mobile,
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
  
  // ==========================================
  // SOIL REPORT APIs
  // ==========================================
  describe('Soil Report APIs', () => {
    test('POST /api/soilreport - should submit soil report', async () => {
      const res = await request(app)
        .post('/api/soilreport')
        .send({
          userId: userId,
          nitrogen: 120,
          phosphorus: 25,
          potassium: 180,
          ph: 6.5
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reportId');
      expect(res.body.data.confidenceScore).toBeDefined();
      expect(res.body.data.confidenceLabel).toMatch(/High|Medium|Low/);
      
      reportId = res.body.data.reportId;
    });
    
    test('POST /api/soilreport - should reject invalid values', async () => {
      const res = await request(app)
        .post('/api/soilreport')
        .send({
          userId: userId,
          nitrogen: -10, // Invalid
          phosphorus: 25,
          potassium: 180,
          ph: 6.5
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    test('GET /api/soilreport/:userId - should get user reports', async () => {
      const res = await request(app)
        .get(`/api/soilreport/${userId}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
  
  // ==========================================
  // CROP APIs
  // ==========================================
  describe('Crop APIs', () => {
    test('GET /api/crops - should return crops list', async () => {
      const res = await request(app)
        .get('/api/crops');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
  
  // ==========================================
  // RECOMMENDATION APIs
  // ==========================================
  describe('Recommendation APIs', () => {
    test('GET /api/recommendations/:userId - should return recommendations', async () => {
      // First seed crops
      const Crop = require('../src/models/Crop');
      const SoilReport = require('../src/models/SoilReport');
      
      await Crop.create({
        cropId: 'rice',
        cropName: 'Rice',
        nitrogenRange: { min: 100, max: 200 },
        phosphorusRange: { min: 15, max: 40 },
        potassiumRange: { min: 100, max: 200 },
        phRange: { min: 5.5, max: 7.5 },
        waterRequirement: 'High',
        rainDependency: true,
        marketVolatility: 'Low',
        averageYield: 25,
        suitableSoilTypes: ['Loamy', 'Clay']
      });
      
      // Create a soil report for this test
      const soilReport = await SoilReport.create({
        userId: userId,
        nitrogen: 120,
        phosphorus: 25,
        potassium: 180,
        ph: 6.5
      });
      
      const res = await request(app)
        .get(`/api/recommendations/${userId}?reportId=${soilReport.reportId}&district=Hyderabad`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('soilSummary');
      expect(res.body.data).toHaveProperty('recommendations');
      expect(res.body.data).toHaveProperty('disclaimer');
      expect(Array.isArray(res.body.data.recommendations)).toBe(true);
      expect(res.body.data.recommendations.length).toBeLessThanOrEqual(3);
      
      // Check recommendation structure
      if (res.body.data.recommendations.length > 0) {
        const rec = res.body.data.recommendations[0];
        expect(rec).toHaveProperty('crop');
        expect(rec).toHaveProperty('finalScore');
        expect(rec).toHaveProperty('soilRisk');
        expect(rec).toHaveProperty('weatherRisk');
        expect(rec).toHaveProperty('marketRisk');
        expect(rec).toHaveProperty('overallRisk');
        expect(rec).toHaveProperty('reasoning');
      }
    });
    
    test('GET /api/recommendations/:userId - should require reportId and district', async () => {
      const res = await request(app)
        .get(`/api/recommendations/${userId}`);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
  
  // ==========================================
  // FEEDBACK APIs
  // ==========================================
  describe('Feedback APIs', () => {
    test('POST /api/feedback - should submit feedback', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          userId: userId,
          soilReportId: reportId,
          cropChosen: 'Rice',
          approximateYield: 20,
          satisfactionLevel: 4,
          district: 'Hyderabad'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('feedbackId');
    });
    
    test('POST /api/feedback - should reject invalid satisfaction level', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .send({
          userId: userId,
          soilReportId: reportId,
          cropChosen: 'Rice',
          approximateYield: 20,
          satisfactionLevel: 6, // Invalid: max is 5
          district: 'Hyderabad'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
  
  // ==========================================
  // ERROR HANDLING
  // ==========================================
  describe('Error Handling', () => {
    test('should return 404 for unknown endpoint', async () => {
      const res = await request(app)
        .get('/api/unknown-endpoint');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
    
    test('should handle validation errors', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          mobile: 'invalid', // Should be 10 digits
          district: '',
          language: 'invalid',
          password: '123'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
    });
  });
});

// ==========================================
// CONFIDENCE SCORE TESTS
// ==========================================
describe('Confidence Score Calculation', () => {
  const SoilReport = require('../src/models/SoilReport');
  
  test('should calculate high confidence for fresh data', () => {
    const score = SoilReport.calculateConfidenceScore({
      reportDate: new Date(),
      nitrogen: 120,
      phosphorus: 25,
      potassium: 180,
      ph: 6.5
    });
    
    expect(score).toBe(100);
  });
  
  test('should reduce score for old data', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 800); // > 2 years
    
    const score = SoilReport.calculateConfidenceScore({
      reportDate: oldDate,
      nitrogen: 120,
      phosphorus: 25,
      potassium: 180,
      ph: 6.5
    });
    
    expect(score).toBe(70); // 100 - 30 for age
  });
  
  test('should return correct labels', () => {
    expect(SoilReport.getConfidenceLabel(85)).toBe('High');
    expect(SoilReport.getConfidenceLabel(65)).toBe('Medium');
    expect(SoilReport.getConfidenceLabel(40)).toBe('Low');
  });
});

// ==========================================
// RECOMMENDATION ENGINE TESTS
// ==========================================
describe('Recommendation Engine', () => {
  const recommendationService = require('../src/services/recommendationService');
  
  test('should calculate weather compatibility', () => {
    const crop = {
      waterRequirement: 'High',
      rainDependency: true
    };
    
    const weather1 = { droughtRisk: true, excessRainRisk: false, temperature: 30 };
    const compat1 = recommendationService.calculateWeatherCompatibility(crop, weather1);
    expect(compat1).toBe(60); // 100 - 40 for drought
    
    const weather2 = { droughtRisk: false, excessRainRisk: true, temperature: 30 };
    const compat2 = recommendationService.calculateWeatherCompatibility(crop, weather2);
    expect(compat2).toBe(70); // 100 - 30 for excess rain
  });
  
  test('should determine risk levels', () => {
    expect(recommendationService.getRiskLevel(85)).toBe('Low');
    expect(recommendationService.getRiskLevel(70)).toBe('Medium');
    expect(recommendationService.getRiskLevel(50)).toBe('High');
  });
  
  test('should calculate overall risk', () => {
    expect(recommendationService.calculateOverallRisk('Low', 'Low', 'Low')).toBe('Low');
    expect(recommendationService.calculateOverallRisk('Low', 'Medium', 'Low')).toBe('Medium');
    expect(recommendationService.calculateOverallRisk('High', 'Low', 'Low')).toBe('High');
  });
});
