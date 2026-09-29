const { PARAMETERS, CONFIDENCE_THRESHOLDS } = require('./soilParameterConfig');
const { validateParameters } = require('./soilDataValidator');

const normalizeText = (text) => String(text || '')
  .replace(/\r/g, '\n')
  .replace(/[\t ]+/g, ' ')
  .replace(/(\d)\s+\.\s+(\d)/g, '$1.$2')
  .replace(/\s*\/\s*/g, '/')
  .replace(/\s+%/g, '%')
  .replace(/\n{2,}/g, '\n')
  .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');

const aliasesFor = (key) => [...PARAMETERS[key].aliases]
  .sort((a, b) => b.length - a.length)
  .map(escapeRegex)
  .join('|');

const parseNumber = (raw) => {
  const value = raw.replace(/\s/g, '');
  // A single comma between digits is treated as a decimal separator only when
  // the fractional part is short; larger groups remain thousands separators.
  const normalized = /^[-+]?\d+,\d{1,2}$/.test(value)
    ? value.replace(',', '.')
    : value.replace(/,/g, '');
  return Number(normalized);
};

const extractUnit = (tail) => {
  const match = tail.match(/(?:kg\s*\/\s*ha|mg\s*\/\s*kg|g\s*\/\s*kg|dS\s*\/\s*m|mS\s*\/\s*cm|uS\s*\/\s*cm|mmhos\s*\/\s*cm|ppm|%)/i);
  return match ? match[0].replace(/\s+/g, '') : null;
};

const findParameterValue = (line, key) => {
  const label = new RegExp(`^\\s*(?:${aliasesFor(key)})(?:\\b|(?=$|\\s|[:=|()]|\\.))`, 'i');
  const match = line.match(label);
  if (!match) return null;

  const tail = line.slice(match[0].length).replace(/^\s*[:=|\-]?\s*/, '');
  const numberMatch = tail.match(/[-+]?(?:\d[\d,]*(?:\s*\.\s*\d+)?|\.\d+)/);
  if (!numberMatch) return null;

  const value = parseNumber(numberMatch[0]);
  if (!Number.isFinite(value)) return null;
  return {
    value,
    unit: extractUnit(tail),
    originalText: line.trim()
  };
};

const extractSoilParameters = (text, { extractionMethod = 'pdf_text', ocrConfidence = null } = {}) => {
  const normalizedText = normalizeText(text);
  const lines = normalizedText.split('\n').map((line) => line.trim()).filter(Boolean);
  const baseConfidence = extractionMethod === 'ocr'
    ? Math.min(0.89, Math.max(0, Number(ocrConfidence ?? 72) / 100))
    : 0.96;
  const extracted = {};

  for (const line of lines) {
    for (const key of Object.keys(PARAMETERS)) {
      if (extracted[key]) continue;
      const candidate = findParameterValue(line, key);
      if (!candidate) continue;

      const hasUnit = Boolean(candidate.unit);
      const confidence = Math.max(0, Math.min(0.99, baseConfidence - (PARAMETERS[key].unitRequired && !hasUnit ? 0.18 : 0)));
      extracted[key] = {
        ...candidate,
        extractionMethod,
        confidence,
        status: confidence < CONFIDENCE_THRESHOLDS.moderate ? 'needs_review' : 'extracted'
      };
    }
  }

  const validated = validateParameters(extracted);
  const notes = [];
  for (const [key, item] of Object.entries(validated)) {
    if (item.status === 'missing') notes.push(`${PARAMETERS[key].label} was not found in the report`);
    item.notes.forEach((note) => notes.push(`${PARAMETERS[key].label}: ${note}`));
    delete item.notes;
  }

  const foundCount = Object.values(validated).filter((item) => item.status !== 'missing').length;
  const needsReview = Object.values(validated).some((item) => item.status === 'needs_review');
  return {
    parameters: validated,
    notes,
    status: foundCount === 0 ? 'failed' : (needsReview ? 'needs_review' : 'extracted'),
    extractionMethod,
    extractedText: normalizedText.slice(0, 20000)
  };
};

module.exports = { normalizeText, parseNumber, extractUnit, extractSoilParameters };
