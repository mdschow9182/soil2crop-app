const { generateCropAdvice } = require('../services/cropAdviceEngine');
const Crop = require('../models/Crop');

test('Crop schema allows genuinely unavailable agronomic fields to remain null', () => {
  const newCrop = new Crop({ cropId: 'needs-config', cropName: 'Needs configuration' });
  expect(newCrop.validateSync()).toBeUndefined();
  expect(newCrop.ecRange).toBeNull();
  expect(newCrop.organicCarbonRange).toBeNull();
  expect(newCrop.rainfallRequirement).toBeNull();
  expect(newCrop.season).toEqual([]);
  expect(newCrop.cropStages).toEqual([]);
});

const crop = {
  cropId: 'sample', cropName: 'Sample crop', phRange: { min: 5.5, max: 7.5 },
  nitrogenRange: { min: 100, max: 200 }, phosphorusRange: { min: 20, max: 40 }, potassiumRange: { min: 80, max: 160 },
  suitableSoilTypes: ['Loamy'], waterRequirement: 'Medium', growingPeriod: 100,
  ruleMetadata: {}
};
const confirmed = (value, unit = null, status = 'verified') => ({ value, unit, status, source: status === 'verified' ? 'ocr' : 'manual' });
const makeReport = (overrides = {}) => ({
  soilType: 'Loamy',
  soilParameters: {
    ph: confirmed(6.5), nitrogen: confirmed(150, 'kg/ha'), phosphorus: confirmed(30, 'kg/ha'),
    potassium: confirmed(120, 'kg/ha'), electricalConductivity: confirmed(0.5, 'dS/m'),
    organicCarbon: confirmed(0.7, '%')
  },
  ...overrides
});

describe('verified-data crop advice engine', () => {
  test('complete report yields an explainable relative match and refuses unsupported NPK comparisons', () => {
    const result = generateCropAdvice({ report: makeReport(), crops: [crop] });
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].matchedFactorKeys).toEqual(expect.arrayContaining(['ph_match', 'soilType_match']));
    expect(result.recommendations[0].limitingFactorKeys).toContain('nitrogen_range_basis_unavailable');
    expect(result.recommendations[0].coveragePercent).toBe(55);
    expect(result.fertilizerAdvisory.every((item) => item.status === 'unavailable')).toBe(true);
    const fertilizer = result.recommendations[0].fertilizerAdvisory;
    expect(fertilizer).toMatchObject({ status: 'unavailable', calculationPerformed: false, availableNutrients: ['nitrogen', 'phosphorus', 'potassium'] });
    expect(fertilizer.nutrients[0]).toMatchObject({
      soilStatus: 'available', soilValue: 150, soilUnit: 'kg/ha',
      cropRequirementStatus: 'unavailable', calculationStatus: 'unavailable', calculationPerformed: false,
    });
    expect(fertilizer.nutrients[0].reasonCodes).toEqual(expect.arrayContaining(['crop_requirement_unavailable', 'units_or_measurement_basis_incompatible']));
    expect(fertilizer.nutrients[0]).not.toHaveProperty('nutrientGap');
  });

  test('missing phosphorus remains null and is disclosed', () => {
    const report = makeReport();
    report.soilParameters.phosphorus = { value: null, status: 'missing' };
    const result = generateCropAdvice({ report, crops: [crop] });
    expect(result.soilSummary.phosphorus.value).toBeNull();
    expect(result.recommendations[0].missingInputs).toContain('phosphorus');
    expect(result.fertilizerAdvisory.find((item) => item.nutrient === 'phosphorus').reason).toBe('soil_value_unavailable');
    expect(result.recommendations[0].fertilizerAdvisory.missingNutrients).toContain('phosphorus');
  });

  test.each(['nitrogen', 'phosphorus', 'potassium'])('reports missing %s without substituting zero', (nutrient) => {
    const report = makeReport();
    report.soilParameters[nutrient] = { value: null, unit: null, status: 'missing' };
    const result = generateCropAdvice({ report, crops: [crop] });
    const advisory = result.recommendations[0].fertilizerAdvisory;
    const entry = advisory.nutrients.find((item) => item.nutrient === nutrient);
    expect(entry).toMatchObject({ soilStatus: 'missing', soilValue: null, calculationStatus: 'unavailable', calculationPerformed: false });
    expect(entry.reasonCodes).toContain('soil_value_unavailable');
    expect(advisory.missingNutrients).toContain(nutrient);
  });

  test('does not use unverified N/P/K values in fertilizer advisory', () => {
    const report = makeReport();
    for (const nutrient of ['nitrogen', 'phosphorus', 'potassium']) report.soilParameters[nutrient].status = 'extracted';
    const result = generateCropAdvice({ report, crops: [crop] });
    const advisory = result.recommendations[0].fertilizerAdvisory;
    expect(advisory.needsReviewNutrients).toEqual(['nitrogen', 'phosphorus', 'potassium']);
    for (const nutrient of advisory.nutrients) {
      expect(nutrient).toMatchObject({ soilStatus: 'needs_review', soilValue: null, calculationPerformed: false });
      expect(nutrient.reasonCodes).toContain('soil_value_needs_review');
    }
  });

  test('reports explicit unit mismatch even when a documented target exists', () => {
    const report = makeReport();
    report.soilParameters.nitrogen.unit = 'mg/kg';
    const cropWithDocumentedTarget = {
      ...crop,
      ruleMetadata: {
        nitrogenRange: { status: 'source_supported', sourceReference: 'test reference', unit: 'kg/ha', comparisonBasis: 'soil_test_level' }
      }
    };
    const result = generateCropAdvice({ report, crops: [cropWithDocumentedTarget] });
    const nitrogen = result.recommendations[0].fertilizerAdvisory.nutrients.find((item) => item.nutrient === 'nitrogen');
    expect(nitrogen.cropRequirementStatus).toBe('available');
    expect(nitrogen.reasonCodes).toContain('units_or_measurement_basis_incompatible');
    expect(nitrogen.calculationPerformed).toBe(false);
  });

  test('missing potassium is not coerced to zero', () => {
    const report = makeReport();
    report.soilParameters.potassium = { value: null, status: 'missing' };
    const result = generateCropAdvice({ report, crops: [crop] });
    expect(result.soilSummary.potassium.value).toBeNull();
    expect(result.recommendations[0].missingInputs).toContain('potassium');
  });

  test('pH outside the configured range becomes a limitation, not a match', () => {
    const report = makeReport();
    report.soilParameters.ph.value = 8.2;
    const result = generateCropAdvice({ report, crops: [crop] });
    expect(result.recommendations[0].matchedFactorKeys).not.toContain('ph_match');
    expect(result.recommendations[0].limitingFactorKeys).toContain('ph_outside_range');
  });

  test('soil type mismatch is reported transparently', () => {
    const result = generateCropAdvice({ report: makeReport({ soilType: 'Clay' }), crops: [crop] });
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].limitingFactorKeys).toContain('soilType_mismatch');
  });

  test('high EC is available but not scored without an EC rule', () => {
    const normal = generateCropAdvice({ report: makeReport(), crops: [crop] });
    const report = makeReport();
    report.soilParameters.electricalConductivity.value = 25;
    const high = generateCropAdvice({ report, crops: [crop] });
    expect(high.soilSummary.electricalConductivity).toMatchObject({ value: 25, status: 'available' });
    expect(high.recommendations[0].score).toBe(normal.recommendations[0].score);
    expect(high.recommendations[0].limitingFactorKeys).toContain('electricalConductivity_rule_unavailable');
  });

  test('manual entries are confirmed inputs', () => {
    const report = makeReport();
    report.soilParameters.ph = confirmed(6.5, null, 'manually_entered');
    expect(generateCropAdvice({ report, crops: [crop] }).soilSummary.ph.status).toBe('available');
  });

  test('farmer-verified OCR is accepted, while unverified extracted OCR is excluded', () => {
    const report = makeReport();
    report.soilParameters.ph = { ...confirmed(6.5), source: 'ocr', status: 'verified' };
    expect(generateCropAdvice({ report, crops: [crop] }).soilSummary.ph.status).toBe('available');
    report.soilParameters.ph.status = 'extracted';
    expect(generateCropAdvice({ report, crops: [crop] }).soilSummary.ph).toMatchObject({ value: null, status: 'needs_review' });
  });

  test('does not return recommendations when no confirmed values can be evaluated', () => {
    const report = makeReport({ soilType: 'Unknown', soilParameters: {} });
    const result = generateCropAdvice({ report, crops: [crop] });
    expect(result.sufficientData).toBe(false);
    expect(result.catalogAvailability).toBe('available');
    expect(result.recommendations).toEqual([]);
  });

  test('reports an empty crop catalog instead of fabricating recommendations', () => {
    const result = generateCropAdvice({ report: makeReport(), crops: [] });
    expect(result.catalogAvailability).toBe('empty');
    expect(result.recommendations).toEqual([]);
  });

  test('high relative score is impossible when all configured factors mismatch', () => {
    const report = makeReport({ soilType: 'Clay' });
    report.soilParameters.ph.value = 8.2;
    const result = generateCropAdvice({ report, crops: [crop] });
    expect(result.recommendations).toEqual([]);
  });

  describe('irrigation advisory availability', () => {
    test('exposes a configured water category and confirmed soil type as context', () => {
      const advice = generateCropAdvice({ report: makeReport(), crops: [crop] });
      expect(advice.recommendations[0].irrigationAdvisory).toMatchObject({
        status: 'unavailable', waterRequirement: 'Medium', soilType: 'Loamy',
        waterRequirementProvenance: { status: 'project_configured' }, scheduleCalculated: false
      });
    });

    test('reports missing rainfall and weather without weather-based guidance', () => {
      const irrigation = generateCropAdvice({ report: makeReport(), crops: [crop] }).recommendations[0].irrigationAdvisory;
      expect(irrigation).toMatchObject({ rainfallAvailability: 'unavailable', weatherAvailability: 'unavailable' });
      expect(irrigation.reasonCodes).toEqual(expect.arrayContaining(['rainfall_requirement_unavailable', 'weather_data_unavailable']));
    });

    test('reports missing soil water-holding information as unavailable', () => {
      const irrigation = generateCropAdvice({ report: makeReport(), crops: [crop] }).recommendations[0].irrigationAdvisory;
      expect(irrigation.soilWaterCapacityAvailability).toBe('unavailable');
      expect(irrigation.reasonCodes).toContain('soil_water_capacity_unavailable');
    });

    test('does not calculate an amount or schedule without numeric crop water rates', () => {
      const irrigation = generateCropAdvice({ report: makeReport(), crops: [crop] }).recommendations[0].irrigationAdvisory;
      expect(irrigation).toMatchObject({
        status: 'unavailable', waterRateAvailability: 'unavailable',
        calculationPerformed: false, scheduleCalculated: false
      });
      expect(irrigation).not.toHaveProperty('amount');
      expect(irrigation).not.toHaveProperty('schedule');
    });

    test('does not use unverified soil measurements as confirmed inputs', () => {
      const report = makeReport({
        soilType: 'Unknown',
        soilParameters: {
          ph: confirmed(6.5, null, 'extracted'), nitrogen: confirmed(150, 'kg/ha', 'extracted'),
          phosphorus: confirmed(30, 'kg/ha', 'extracted'), potassium: confirmed(120, 'kg/ha', 'extracted'),
          electricalConductivity: confirmed(0.5, 'dS/m', 'extracted'), organicCarbon: confirmed(0.7, '%', 'extracted')
        }
      });
      const advice = generateCropAdvice({ report, crops: [crop] });
      expect(advice.soilSummary.ph).toMatchObject({ status: 'needs_review', value: null });
      expect(advice.recommendations).toHaveLength(0);
    });

    test('with other configured context still provides no unsupported prescription', () => {
      const cropWithContext = {
        ...crop, rainfallRequirement: { min: 500, max: 1000 }, season: ['Kharif'], cropStages: ['Sowing', 'Harvest']
      };
      const irrigation = generateCropAdvice({ report: makeReport(), crops: [cropWithContext] }).recommendations[0].irrigationAdvisory;
      expect(irrigation).toMatchObject({
        status: 'unavailable', rainfallAvailability: 'project_configured',
        waterRateAvailability: 'unavailable', scheduleCalculated: false, calculationPerformed: false
      });
      expect(irrigation).toHaveProperty('explanation');
      expect(irrigation).not.toHaveProperty('amount');
      expect(irrigation).not.toHaveProperty('schedule');
    });
  });
});
