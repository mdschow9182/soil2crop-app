const config = require('./recommendationConfig');

const SOIL_FIELDS = [
  ['ph', 'pH'], ['nitrogen', 'Nitrogen'], ['phosphorus', 'Phosphorus'], ['potassium', 'Potassium'],
  ['electricalConductivity', 'Electrical Conductivity'], ['organicCarbon', 'Organic Carbon'],
  ['sulphur', 'Sulphur'], ['zinc', 'Zinc'], ['iron', 'Iron'], ['manganese', 'Manganese'], ['copper', 'Copper'], ['boron', 'Boron'], ['soilType', 'Soil type']
];
const CONFIRMED = new Set(['verified', 'manually_entered']);
const PARAMETER_LABELS = { ph: 'pH', nitrogen: 'Nitrogen', phosphorus: 'Phosphorus', potassium: 'Potassium', electricalConductivity: 'Electrical conductivity', organicCarbon: 'Organic carbon', soilType: 'Soil type' };

const describeFactor = (code) => {
  if (code === 'ph_match') return 'Soil pH is within this crop’s existing configured range.';
  if (code === 'ph_outside_range') return 'Soil pH is outside this crop’s existing configured range.';
  if (code === 'soilType_match') return 'Soil type is listed among this crop’s configured suitable soil types.';
  if (code === 'soilType_mismatch') return 'Soil type is not listed among this crop’s configured suitable soil types.';
  if (code === 'soilType_missing') return 'Soil type is unavailable and was not evaluated.';
  if (code === 'no_configured_match') return 'No configured soil compatibility factor matched this crop.';
  const missing = code.match(/^([A-Za-z]+)_missing$/);
  if (missing) return `${PARAMETER_LABELS[missing[1]] || missing[1]} information is unavailable and was not evaluated.`;
  const review = code.match(/^([A-Za-z]+)_needs_review$/);
  if (review) return `${PARAMETER_LABELS[review[1]] || review[1]} needs review and was not evaluated.`;
  const basis = code.match(/^(nitrogen|phosphorus|potassium)_range_basis_unavailable$/);
  if (basis) return `${PARAMETER_LABELS[basis[1]]} compatibility was not evaluated because its existing crop range has no documented unit or soil-test comparison basis.`;
  const requirement = code.match(/^(nitrogen|phosphorus|potassium)_requirement_unavailable$/);
  if (requirement) return `${PARAMETER_LABELS[requirement[1]]} crop requirement data is unavailable.`;
  if (code === 'season_rule_unavailable') return 'Season compatibility is not configured.';
  if (code === 'rainfall_rule_unavailable') return 'Rainfall requirements are not configured.';
  if (code === 'cropStages_rule_unavailable') return 'Crop-stage guidance is not configured.';
  const unknown = code.match(/^(.*)_(rule_unavailable|requirement_unavailable)$/);
  if (unknown) return `${PARAMETER_LABELS[unknown[1]] || unknown[1]} crop suitability rule is unavailable.`;
  const match = code.match(/^(ph|nitrogen|phosphorus|potassium|electricalConductivity|organicCarbon)_(match|outside_range)$/);
  if (match) return `${PARAMETER_LABELS[match[1]]} is ${match[2] === 'match' ? 'within' : 'outside'} the configured comparison range.`;
  return code;
};

const getSoilSummary = (report) => Object.fromEntries(SOIL_FIELDS.map(([key, label]) => {
  const parameter = key === 'soilType'
    ? { value: report?.soilType, status: report?.soilType && report.soilType !== 'Unknown' ? 'manually_entered' : 'missing' }
    : report?.soilParameters?.[key];
  const status = parameter?.status;
  const available = CONFIRMED.has(status) && (key === 'soilType' ? Boolean(parameter?.value) : Number.isFinite(parameter?.value));
  return [key, {
    label,
    value: available ? parameter.value : null,
    unit: available ? parameter.unit || null : null,
    status: available ? 'available' : (status === 'needs_review' || status === 'extracted' ? 'needs_review' : 'missing'),
    source: available ? status : null
  }];
}));

const createFertilizerAdvisory = (crop, soilSummary) => {
  const nutrients = [
    ['nitrogen', 'Nitrogen', 'nitrogenRange'],
    ['phosphorus', 'Phosphorus', 'phosphorusRange'],
    ['potassium', 'Potassium', 'potassiumRange']
  ].map(([key, label, rangeKey]) => {
    const soil = soilSummary[key];
    const range = crop?.[rangeKey];
    const metadata = crop?.ruleMetadata?.[rangeKey] || {};
    const reasons = [];

    if (soil.status === 'missing') reasons.push('soil_value_unavailable');
    if (soil.status === 'needs_review') reasons.push('soil_value_needs_review');

    // A numeric legacy range alone is not a documented crop nutrient target.
    // It needs an explicit source and compatible soil-test measurement basis.
    const hasNumericTarget = Number.isFinite(range?.min) && Number.isFinite(range?.max);
    const documentedRequirement = metadata.status === 'source_supported'
      && Boolean(metadata.sourceReference) && hasNumericTarget;
    const normalized = (value) => String(value || '').toLowerCase().replace(/\s/g, '');
    const unitsAndBasisCompatible = documentedRequirement
      && metadata.comparisonBasis === 'soil_test_level'
      && Boolean(metadata.unit)
      && Boolean(soil.unit)
      && normalized(metadata.unit) === normalized(soil.unit);
    if (!documentedRequirement) reasons.push('crop_requirement_unavailable');
    if (soil.status === 'available' && !unitsAndBasisCompatible) reasons.push('units_or_measurement_basis_incompatible');

    return {
      nutrient: key,
      label,
      soilStatus: soil.status,
      soilValue: soil.status === 'available' ? soil.value : null,
      soilUnit: soil.status === 'available' ? soil.unit : null,
      cropRequirementStatus: documentedRequirement ? 'available' : 'unavailable',
      calculationStatus: 'unavailable',
      reasonCodes: reasons,
      // No gap or quantity is computed: the existing records do not currently
      // satisfy the documented-target and compatible-basis requirements.
      calculationPerformed: false
    };
  });

  const missingNutrients = nutrients.filter((item) => item.soilStatus === 'missing').map((item) => item.nutrient);
  const needsReviewNutrients = nutrients.filter((item) => item.soilStatus === 'needs_review').map((item) => item.nutrient);
  const availableNutrients = nutrients.filter((item) => item.soilStatus === 'available').map((item) => item.nutrient);
  const reasonCodes = [...new Set(nutrients.flatMap((item) => item.reasonCodes))];

  return {
    status: 'unavailable',
    reason: reasonCodes[0] || 'crop_requirement_unavailable',
    reasonCodes,
    availableNutrients,
    missingNutrients,
    needsReviewNutrients,
    calculationPerformed: false,
    nutrients
  };
};

const createIrrigationAdvisory = (crop, soilSummary) => {
  const hasWaterCategory = Boolean(crop?.waterRequirement);
  const waterRequirementProvenance = ruleStatus(crop, 'waterRequirement', hasWaterCategory);
  const soilType = soilSummary.soilType;
  const hasCropStages = Array.isArray(crop.cropStages) && crop.cropStages.length > 0;
  const reasonCodes = [
    hasWaterCategory ? 'qualitative_water_category_only' : 'crop_water_requirement_unavailable',
    'crop_water_rate_unavailable',
    ...(!crop.rainfallRequirement ? ['rainfall_requirement_unavailable'] : []),
    'weather_data_unavailable',
    'soil_water_capacity_unavailable',
    ...(!hasCropStages ? ['crop_stage_schedule_unavailable'] : [])
  ];

  return {
    status: 'unavailable',
    waterRequirement: hasWaterCategory ? crop.waterRequirement : null,
    waterRequirementProvenance,
    soilType: soilType.status === 'available' ? soilType.value : null,
    soilTypeStatus: soilType.status,
    rainfallAvailability: crop.rainfallRequirement ? 'project_configured' : 'unavailable',
    weatherAvailability: 'unavailable',
    waterRateAvailability: 'unavailable',
    soilWaterCapacityAvailability: 'unavailable',
    cropStageScheduleAvailability: hasCropStages ? 'project_configured' : 'unavailable',
    reasonCodes,
    reason: hasWaterCategory
      ? 'The catalog has a qualitative water category only; field-specific inputs needed for an irrigation prescription are unavailable.'
      : 'Crop water requirement data is unavailable, so an irrigation prescription cannot be calculated.',
    explanation: 'No irrigation amount or schedule was calculated. Numeric crop water rates, soil water-holding information, and current local weather are unavailable; rainfall requirements and crop-stage schedules are unavailable unless separately marked as project-configured.',
    calculationPerformed: false,
    scheduleCalculated: false
  };
};

const ruleStatus = (crop, key, hasValue) => {
  if (!hasValue) return { status: 'unavailable', sourceReference: null };
  const metadata = crop.ruleMetadata?.[key];
  if (metadata?.status === 'unavailable') return metadata;
  if (metadata?.status === 'source_supported') return metadata.sourceReference ? metadata : { status: 'unavailable', sourceReference: null };
  if (metadata?.status === 'project_configured') return metadata;
  // Existing records predate provenance fields. Preserve their configured values,
  // but never imply that an agronomic source was recorded.
  return { status: 'project_configured', sourceReference: null, provenanceNote: 'Legacy project configuration; source not recorded' };
};

const evaluateCrop = (crop, report, soilSummary) => {
  const matchedFactors = [];
  const limitingFactors = [];
  const missingInputs = [];
  const evaluations = [];
  const ruleProvenance = {};
  const addMissingStatus = (key) => {
    const state = soilSummary[key]?.status;
    if (state !== 'available') {
      if (state === 'needs_review') limitingFactors.push(`${key}_needs_review`);
      else {
        missingInputs.push(key);
        limitingFactors.push(`${key}_missing`);
      }
    }
  };

  // pH has a comparable, dimensionless soil value and an existing configured crop range.
  const phRule = ruleStatus(crop, 'phRange', Number.isFinite(crop.phRange?.min) && Number.isFinite(crop.phRange?.max));
  ruleProvenance.phRange = phRule;
  if (soilSummary.ph.status !== 'available') addMissingStatus('ph');
  else if (phRule.status === 'unavailable') limitingFactors.push('ph_rule_unavailable');
  else {
    const compatible = soilSummary.ph.value >= crop.phRange.min && soilSummary.ph.value <= crop.phRange.max;
    evaluations.push({ key: 'ph', matched: compatible, weight: config.weights.ph, ruleStatus: phRule.status });
    (compatible ? matchedFactors : limitingFactors).push(compatible ? 'ph_match' : 'ph_outside_range');
  }

  // Only compare nutrient thresholds explicitly declared as unit-aligned soil-test
  // levels. Crop nutrient demand and soil-test availability are distinct quantities.
  for (const [key, rangeKey] of [
    ['nitrogen', 'nitrogenRange'], ['phosphorus', 'phosphorusRange'], ['potassium', 'potassiumRange']
  ]) {
    if (soilSummary[key].status !== 'available') addMissingStatus(key);
    const metadata = crop.ruleMetadata?.[rangeKey];
    const range = crop[rangeKey];
    const configuredUnit = metadata?.unit || crop[`${key}RangeUnit`] || range?.unit;
    const sameUnit = String(configuredUnit || '').toLowerCase().replace(/\s/g, '') === String(soilSummary[key].unit || '').toLowerCase().replace(/\s/g, '');
    const comparable = metadata?.comparisonBasis === 'soil_test_level' && Boolean(configuredUnit) && sameUnit;
    const rule = ruleStatus(crop, rangeKey, comparable && Number.isFinite(range?.min) && Number.isFinite(range?.max));
    ruleProvenance[rangeKey] = comparable ? rule : { status: 'unavailable', sourceReference: metadata?.sourceReference || null, provenanceNote: 'Unit-aligned soil-test basis is not configured' };
    if (soilSummary[key].status === 'available' && rule.status !== 'unavailable') {
      const compatible = soilSummary[key].value >= range.min && soilSummary[key].value <= range.max;
      evaluations.push({ key, matched: compatible, weight: config.weights[key], ruleStatus: rule.status });
      (compatible ? matchedFactors : limitingFactors).push(`${key}_${compatible ? 'match' : 'outside_range'}`);
    } else if (range?.min != null || range?.max != null) limitingFactors.push(`${key}_range_basis_unavailable`);
    else limitingFactors.push(`${key}_requirement_unavailable`);
  }

  for (const [key, rangeKey] of [
    ['electricalConductivity', 'ecRange'], ['organicCarbon', 'organicCarbonRange']
  ]) {
    if (soilSummary[key].status !== 'available') addMissingStatus(key);
    const metadata = crop.ruleMetadata?.[rangeKey];
    const range = crop[rangeKey];
    const configuredUnit = metadata?.unit || range?.unit;
    const sameUnit = String(configuredUnit || '').toLowerCase().replace(/\s/g, '') === String(soilSummary[key].unit || '').toLowerCase().replace(/\s/g, '');
    const comparable = metadata?.comparisonBasis === 'soil_test_level' && Boolean(configuredUnit) && sameUnit;
    const rule = ruleStatus(crop, rangeKey, comparable && Number.isFinite(range?.min) && Number.isFinite(range?.max));
    ruleProvenance[rangeKey] = comparable ? rule : { status: 'unavailable', sourceReference: metadata?.sourceReference || null, provenanceNote: 'Unit-aligned soil-test basis is not configured' };
    if (soilSummary[key].status === 'available' && rule.status !== 'unavailable') {
      const compatible = soilSummary[key].value >= range.min && soilSummary[key].value <= range.max;
      evaluations.push({ key, matched: compatible, weight: config.weights[key], ruleStatus: rule.status });
      (compatible ? matchedFactors : limitingFactors).push(`${key}_${compatible ? 'match' : 'outside_range'}`);
    } else limitingFactors.push(`${key}_rule_unavailable`);
  }

  const suitableSoilTypes = Array.isArray(crop.suitableSoilTypes) ? crop.suitableSoilTypes : [];
  const soilType = report?.soilType;
  const soilTypeRule = ruleStatus(crop, 'suitableSoilTypes', suitableSoilTypes.length > 0);
  ruleProvenance.suitableSoilTypes = soilTypeRule;
  if (!soilType || soilType === 'Unknown') {
    limitingFactors.push('soilType_missing');
    missingInputs.push('soilType');
  }
  else if (soilTypeRule.status !== 'unavailable') {
    const compatible = suitableSoilTypes.includes(soilType);
    evaluations.push({ key: 'soilType', matched: compatible, weight: config.weights.soilType, ruleStatus: soilTypeRule.status });
    (compatible ? matchedFactors : limitingFactors).push(compatible ? 'soilType_match' : 'soilType_mismatch');
  } else limitingFactors.push('soilType_rule_unavailable');

  if (!Array.isArray(crop.season) || crop.season.length === 0) limitingFactors.push('season_rule_unavailable');
  if (!crop.rainfallRequirement) limitingFactors.push('rainfall_rule_unavailable');
  if (!Array.isArray(crop.cropStages) || crop.cropStages.length === 0) limitingFactors.push('cropStages_rule_unavailable');
  ruleProvenance.season = ruleStatus(crop, 'season', Boolean(crop.season?.length));
  ruleProvenance.rainfallRequirement = ruleStatus(crop, 'rainfallRequirement', Boolean(crop.rainfallRequirement));
  ruleProvenance.cropStages = ruleStatus(crop, 'cropStages', Boolean(crop.cropStages?.length));
  ruleProvenance.waterRequirement = ruleStatus(crop, 'waterRequirement', Boolean(crop.waterRequirement));

  const availableWeight = evaluations.reduce((sum, item) => sum + item.weight, 0);
  const score = availableWeight > 0
    ? Math.round(evaluations.reduce((sum, item) => sum + (item.matched ? item.weight : 0), 0) / availableWeight * 100)
    : null;
  const matchedWeight = evaluations.filter((item) => item.matched).reduce((sum, item) => sum + item.weight, 0);
  const hasMatch = matchedWeight > 0;
  const missingSet = new Set(missingInputs);
  const matchedFactorKeys = [...new Set(matchedFactors)];
  const limitingFactorKeys = [...new Set(limitingFactors)];
  const matchedFactorDescriptions = matchedFactorKeys.map(describeFactor);
  const limitingFactorDescriptions = limitingFactorKeys.map(describeFactor);
  return {
    cropId: crop.cropId,
    cropName: crop.cropName,
    scientificName: crop.scientificName || null,
    score,
    coveragePercent: Math.round(availableWeight / Object.values(config.weights).reduce((sum, value) => sum + value, 0) * 100),
    confidence: 'low',
    suitability: score === null ? 'not_evaluated' : (score >= 75 ? 'higher_relative_fit' : score >= 40 ? 'partial_relative_fit' : 'lower_relative_fit'),
    matchedFactors: matchedFactorDescriptions,
    limitingFactors: limitingFactorDescriptions,
    matchedFactorKeys,
    limitingFactorKeys,
    missingInputs: [...missingSet],
    explanation: matchedFactorDescriptions.length
      ? `${matchedFactorDescriptions.join(' ')}${limitingFactorDescriptions.length ? ` ${limitingFactorDescriptions[0]}` : ''}`
      : describeFactor('no_configured_match'),
    waterRequirement: crop.waterRequirement || null,
    growingPeriodDays: Number.isFinite(crop.growingPeriod) ? crop.growingPeriod : null,
    ruleProvenance,
    fertilizerAdvisory: createFertilizerAdvisory(crop, soilSummary),
    irrigationAdvisory: createIrrigationAdvisory(crop, soilSummary),
    _hasMatch: hasMatch,
    _evaluatedCount: evaluations.length
  };
};

const generateCropAdvice = ({ report, crops }) => {
  const soilSummary = getSoilSummary(report);
  const hasConfirmedInput = Object.values(soilSummary).some((parameter) => parameter.status === 'available') || (report?.soilType && report.soilType !== 'Unknown');
  const evaluatedCropRows = crops.map((crop) => evaluateCrop(crop, report, soilSummary));
  const candidates = evaluatedCropRows.filter((crop) => crop._hasMatch).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const recommendations = candidates.slice(0, config.limit).map(({ _hasMatch, _evaluatedCount, ...crop }) => crop);
  const missingInputs = [...new Set(Object.entries(soilSummary).filter(([, item]) => item.status !== 'available').map(([key]) => key))];
  return {
    success: true,
    soilSummary,
    recommendations,
    catalogAvailability: crops.length ? 'available' : 'empty',
    missingInputs,
    sufficientData: hasConfirmedInput && recommendations.length > 0,
    fertilizerAdvisory: ['nitrogen', 'phosphorus', 'potassium'].map((key) => ({
      nutrient: key,
      status: 'unavailable',
      reason: soilSummary[key].status !== 'available' ? 'soil_value_unavailable' : 'crop_requirement_unavailable'
    })),
    irrigationAdvisory: recommendations.map((crop) => ({
      cropId: crop.cropId,
      status: crop.irrigationAdvisory.status,
      waterRequirement: crop.waterRequirement,
      reason: crop.irrigationAdvisory.reasonCodes[0],
      calculationPerformed: false
    })),
    weatherAvailability: 'unavailable',
    disclaimer: 'This is a relative decision-support indicator based on existing project-configured pH and soil-type rules. It is not a scientific guarantee or a substitute for local agronomic advice.'
  };
};

module.exports = { generateCropAdvice, getSoilSummary, evaluateCrop, ruleStatus };
