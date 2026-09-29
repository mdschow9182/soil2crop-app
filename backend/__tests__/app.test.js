const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'soil2crop-test-secret-with-at-least-32-characters';
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
  if (mongoServer) await mongoServer.stop();
});

describe('Soil2Crop API Tests', () => {
  
  // Test data
  const testUser = {
    name: 'Test Farmer',
    mobile: '9876543210',
    district: 'Hyderabad',
    language: 'te',
    password: 'test12345'
  };
  
  let userId;
  let mongoUserId;
  let reportId;
  let token;
  
  // ==========================================
  // HEALTH CHECK
  // ==========================================
  describe('Health Check', () => {
    test('GET /health - should return ok', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Soil2Crop API Running');
    });
  });
  
  // ==========================================
  // USER APIs
  // ==========================================
  describe('User APIs', () => {
    test('POST /api/users/register - should register new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data.mobile).toBe(testUser.mobile);
      
      userId = res.body.data.userId;
    });
    
    test('POST /api/users/register - should reject duplicate mobile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
    
    test('POST /api/auth/login - should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ mobile: testUser.mobile, password: testUser.password, language: testUser.language });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.farmer.farmer_id).toBe(userId);
      expect(res.body.token).toBeTruthy();
      token = res.body.token;
      mongoUserId = res.body.farmer._id;
    });
    
    test('POST /api/auth/login - should login existing user by mobile', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ mobile: testUser.mobile, password: testUser.password, language: testUser.language });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.farmer.farmer_id).toBe(userId);
    });

    test('rejects passwordless login and unauthenticated report access', async () => {
      const login = await request(app).post('/api/auth/login').send({ mobile: testUser.mobile, language: testUser.language });
      const reports = await request(app).get(`/api/reports/${userId}`);
      expect(login.status).toBe(400);
      expect(reports.status).toBe(401);
    });

    test('authenticated farmer cannot read another farmer’s reports', async () => {
      const response = await request(app)
        .get('/api/reports/USR-ANOTHER-FARMER')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(403);
    });
  });
  
  // ==========================================
  // SOIL REPORT APIs
  // ==========================================
  describe('Soil Report APIs', () => {
    test('POST /api/soilreport - should submit soil report', async () => {
      const res = await request(app)
        .post('/api/soilreport')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId,
          nitrogen: 120,
          phosphorus: 25,
          potassium: 180,
          ph: 6.5
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.report).toHaveProperty('reportId');
      expect(res.body.report.confidenceScore).toBeDefined();
      expect(res.body.report.confidenceLabel).toMatch(/High|Medium|Low/);
      
      reportId = res.body.report.reportId;
    });
    
    test('POST /api/soilreport - should reject invalid values', async () => {
      const res = await request(app)
        .post('/api/soilreport')
        .set('Authorization', `Bearer ${token}`)
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
    
    test('GET /api/reports/:userId - should get user reports', async () => {
      const res = await request(app)
        .get(`/api/reports/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const byMongoId = await request(app)
        .get(`/api/reports/${mongoUserId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(byMongoId.status).toBe(200);
      expect(byMongoId.body.data.length).toBeGreaterThan(0);
    });
  });
  
  // ==========================================
  // CROP APIs
  // ==========================================
  describe('Crop APIs', () => {
    test('seeds an empty connected crop collection once and avoids duplicate records', async () => {
      const Crop = require('../models/Crop');
      const { cropsData, ensureCropCatalog } = require('../scripts/seedCrops');
      await Crop.deleteMany({});

      const firstSeed = await ensureCropCatalog();
      expect(firstSeed).toEqual({ seeded: true, count: cropsData.length });

      const secondSeed = await ensureCropCatalog();
      expect(secondSeed).toEqual({ seeded: false, count: cropsData.length });
      expect(await Crop.countDocuments()).toBe(cropsData.length);
      expect(await Crop.distinct('cropId')).toHaveLength(cropsData.length);
    });

    test('GET /api/crops - returns the existing crop catalogue contract', async () => {
      const res = await request(app)
        .get('/api/crops');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(8);
      expect(res.body.data.map(({ cropId }) => cropId).sort()).toEqual([
        'chickpea', 'cotton', 'groundnut', 'maize', 'rice', 'soybean', 'sugarcane', 'wheat'
      ]);
    });
  });
  
  // ==========================================
  // RECOMMENDATION APIs
  // ==========================================
  describe('Recommendation APIs', () => {
    test('GET /api/recommendations/:userId - should return recommendations', async () => {
      // First seed crops
      const Crop = require('../models/Crop');
      const SoilReport = require('../models/SoilReport');
      
      expect(await Crop.exists({ cropId: 'rice' })).toBeTruthy();

      // Create a soil report for this test
      const soilReport = await SoilReport.create({
        userId: userId,
        nitrogen: 120,
        phosphorus: 25,
        potassium: 180,
        ph: 6.5
      });
      
      const res = await request(app)
        .get(`/api/recommendations/${userId}?reportId=${soilReport.reportId}&district=Hyderabad`)
        .set('Authorization', `Bearer ${token}`);
      
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
    
    test('GET /api/recommendations/:userId - should require reportId', async () => {
      const res = await request(app)
        .get(`/api/recommendations/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      
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
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId,
          soilReportId: reportId,
          nitrogen: 120,
          phosphorus: 25,
          potassium: 180,
          ph: 6.5,
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
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId,
          soilReportId: reportId,
          nitrogen: 120,
          phosphorus: 25,
          potassium: 180,
          ph: 6.5,
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
        .post('/api/auth/register')
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
  const SoilReport = require('../models/SoilReport');
  
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
  const recommendationService = require('../services/recommendationService');
  
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
