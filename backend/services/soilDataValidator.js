const { PARAMETERS, CONFIDENCE_THRESHOLDS } = require('./soilParameterConfig');

const normalizeUnit = (unit) => String(unit || '')
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/μ/g, 'u')
  .replace(/µ/g, 'u');

const validateParameter = (key, parameter) => {
  const config = PARAMETERS[key];
  if (!config) throw new Error(`Unknown soil parameter: ${key}`);

  const value = parameter?.value;
  const confidence = Number.isFinite(parameter?.confidence) ? parameter.confidence : 0;
  const unit = parameter?.unit || null;
  const notes = [];

  if (value === null || value === undefined || value === '') {
    return { ...parameter, value: null, unit, status: 'missing', confidence: 0, notes };
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return { ...parameter, value: null, unit, status: 'needs_review', confidence, notes: ['Value is not a valid number'] };
  }

  let status = confidence < CONFIDENCE_THRESHOLDS.moderate ? 'needs_review' : 'extracted';
  const [minimum, maximum] = config.range;
  const [typicalMinimum, typicalMaximum] = config.typicalRange;

  if (numericValue < minimum || numericValue > maximum) {
    status = 'needs_review';
    notes.push(`Value is outside the accepted range (${minimum}–${maximum})`);
  } else if (numericValue < typicalMinimum || numericValue > typicalMaximum) {
    status = 'needs_review';
    notes.push('Value is unusual and should be checked against the report');
  }

  if (config.unitRequired) {
    if (!unit) {
      status = 'needs_review';
      notes.push('Unit was not found; please verify it');
    } else if (!config.units.map(normalizeUnit).includes(normalizeUnit(unit))) {
      status = 'needs_review';
      notes.push(`Unit "${unit}" is not recognized for ${config.label}`);
    }
  }

  if (confidence < CONFIDENCE_THRESHOLDS.moderate && !notes.length) {
    notes.push('Extraction confidence is low; please verify this value');
  }

  return { ...parameter, value: numericValue, unit, status, confidence, notes };
};

const validateParameters = (parameters) => Object.fromEntries(
  Object.keys(PARAMETERS).map((key) => [
    key,
    validateParameter(key, parameters?.[key] || { value: null })
  ])
);

module.exports = { normalizeUnit, validateParameter, validateParameters };
