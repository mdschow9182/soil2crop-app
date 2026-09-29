const { extractSoilParameters } = require('../services/soilParameterExtractor');
const { validateParameter } = require('../services/soilDataValidator');

describe('soil report parameter extraction', () => {
  test('extracts common aliases, decimal values and units', () => {
    const result = extractSoilParameters([
      'Soil pH: 6.5', 'E.C.: 0.8 dS/m', 'O.C.: 0.54 %',
      'Available N: 280 kg/ha', 'P2O5: 18 kg/ha', 'K2O: 150 kg/ha',
      'Zn: 0.6 mg/kg', 'Fe: 4.2 mg/kg', 'Mn: 3.1 mg/kg', 'Cu: 0.4 mg/kg', 'Boron: 0.3 ppm'
    ].join('\n'));
    expect(result.parameters.ph.value).toBe(6.5);
    expect(result.parameters.electricalConductivity.value).toBe(0.8);
    expect(result.parameters.nitrogen.unit).toBe('kg/ha');
    expect(result.parameters.phosphorus.value).toBe(18);
    expect(result.parameters.potassium.value).toBe(150);
    expect(result.parameters.zinc.value).toBe(0.6);
    expect(result.parameters.sulphur.status).toBe('missing');
  });

  test('leaves missing values null and preserves a suspicious OCR number for review', () => {
    const result = extractSoilParameters('pH: 6.5\nN: 90000 kg/ha', { extractionMethod: 'ocr', ocrConfidence: 38 });
    expect(result.parameters.phosphorus.value).toBeNull();
    expect(result.parameters.nitrogen.value).toBe(90000);
    expect(result.parameters.nitrogen.status).toBe('needs_review');
  });

  test('flags invalid units and numeric ranges without inventing replacements', () => {
    const result = validateParameter('nitrogen', { value: 25, unit: 'percent', confidence: 0.98 });
    expect(result.value).toBe(25);
    expect(result.status).toBe('needs_review');
    expect(result.notes.join(' ')).toMatch(/not recognized/);
  });
});
