jest.mock('../models/Crop', () => ({ find: jest.fn() }));

const Crop = require('../models/Crop');
const { answerQuestion, detectIntent } = require('../services/farmerAssistantService');

const rice = {
  cropId: 'rice',
  cropName: 'Rice',
  phRange: { min: 5.5, max: 7.5 },
  suitableSoilTypes: ['Loamy', 'Clay'],
  waterRequirement: 'High',
};

const confirmed = (value, unit = '') => ({ value, unit, status: 'verified' });

describe('farmer assistant named-crop suitability responses', () => {
  beforeEach(() => {
    Crop.find.mockReturnValue({ lean: () => Promise.resolve([rice]) });
  });

  test('recognizes an English named-crop suitability question', () => {
    expect(detectIntent('Is rice suitable for my soil?')).toBe('crop');
  });

  test('recognizes a Telugu named-crop suitability question', () => {
    expect(detectIntent('వరి నా మట్టికి అనుకూలమా?')).toBe('crop');
  });

  test('reports a configured soil conflict as unsuitable and shows missing context', async () => {
    const report = { soilType: 'Clay', soilParameters: { ph: confirmed(8.2) } };
    const answer = await answerQuestion({ query: 'Is rice suitable for my soil?', language: 'en', report });

    expect(answer.response).toContain('Suitability: Unsuitable under configured soil comparisons');
    expect(answer.response).toContain('pH: 8.2');
    expect(answer.response).toContain('water availability and location');
    expect(answer.response).toContain('cannot establish suitability');
    expect(answer.confidence).toBeGreaterThan(0);
  });

  test('does not call soil matches alone suitable and responds in Telugu', async () => {
    const report = { soilType: 'Clay', soilParameters: { ph: confirmed(6.5) } };
    const answer = await answerQuestion({ query: 'వరి నా మట్టికి అనుకూలమా?', language: 'te', report });

    expect(answer.response).toContain('తగిన సమాచారం లేదు');
    expect(answer.response).toContain('pH: 6.5');
    expect(answer.response).toContain('నీటి లభ్యత');
    expect(answer.response).toContain('ప్రాంతం');
  });
});
