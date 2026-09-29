jest.mock('../models/User', () => ({ findOne: jest.fn() }));
jest.mock('../models/SoilReport', () => ({ findOne: jest.fn() }));
jest.mock('../services/recommendationService', () => ({ generateRecommendations: jest.fn() }));

process.env.JWT_SECRET = 'crop-suggestion-tests-secret-with-more-than-32-characters';
const jwt = require('jsonwebtoken');

const express = require('express');
const request = require('supertest');
const User = require('../models/User');
const SoilReport = require('../models/SoilReport');
const recommendationService = require('../services/recommendationService');
const cropSuggestionRouter = require('../routes/cropSuggestion');

const app = express();
app.use(express.json());
app.use('/api/crop-suggestion', cropSuggestionRouter);
const authHeader = () => `Bearer ${jwt.sign({ userId: '507f1f77bcf86cd799439011', farmerId: 'FARMER-1' }, process.env.JWT_SECRET, { algorithm: 'HS256' })}`;

describe('verified crop advice route contract', () => {
  beforeEach(() => jest.clearAllMocks());

  test('loads owned saved soil report and delegates to shared advice engine', async () => {
    User.findOne.mockResolvedValue({ userId: 'FARMER-1', district: 'Guntur' });
    SoilReport.findOne.mockResolvedValue({ reportId: 'SR-1' });
    recommendationService.generateRecommendations.mockResolvedValue({ success: true, data: { recommendations: [] } });
    const response = await request(app).post('/api/crop-suggestion').set('Authorization', authHeader()).send({
      farmer_id: '507f1f77bcf86cd799439011', reportId: 'SR-1', pH: 8.2, nitrogen: 0
    });
    expect(response.status).toBe(200);
    expect(SoilReport.findOne).toHaveBeenCalledWith({ reportId: 'SR-1', userId: 'FARMER-1' });
    expect(recommendationService.generateRecommendations).toHaveBeenCalledWith('FARMER-1', 'SR-1', null);
  });

  test('rejects raw soil values without a saved report ID', async () => {
    const response = await request(app).post('/api/crop-suggestion').set('Authorization', authHeader()).send({ farmer_id: '507f1f77bcf86cd799439011', pH: 7 });
    expect(response.status).toBe(400);
    expect(SoilReport.findOne).not.toHaveBeenCalled();
  });

  test('the existing soil-based alias delegates to the same advice service', async () => {
    User.findOne.mockResolvedValue({ userId: 'FARMER-1' });
    SoilReport.findOne.mockResolvedValue({ reportId: 'SR-2' });
    recommendationService.generateRecommendations.mockResolvedValue({ success: true, data: { recommendations: [] } });
    const response = await request(app).post('/api/crop-suggestion/soil-based').set('Authorization', authHeader()).send({ farmer_id: '507f1f77bcf86cd799439011', reportId: 'SR-2' });
    expect(response.status).toBe(200);
    expect(recommendationService.generateRecommendations).toHaveBeenCalledTimes(1);
  });
});
