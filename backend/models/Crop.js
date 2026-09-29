const mongoose = require('mongoose');
const numericRangeSchema = new mongoose.Schema({
  min: { type: Number, default: null },
  max: { type: Number, default: null },
  unit: { type: String, default: null }
}, { _id: false });

/**
 * Crop Schema
 * Stores crop requirements and characteristics
 */
const cropSchema = new mongoose.Schema({
  cropId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  cropName: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: { type: String, default: null, trim: true },
  // NPK Requirements
  nitrogenRange: {
    type: numericRangeSchema,
    default: null
  },
  phosphorusRange: {
    type: numericRangeSchema,
    default: null
  },
  potassiumRange: {
    type: numericRangeSchema,
    default: null
  },
  // Existing nutrient ranges have no recorded units or measurement basis. These
  // optional metadata fields must be set before they can participate in comparisons.
  nitrogenRangeUnit: { type: String, default: null },
  phosphorusRangeUnit: { type: String, default: null },
  potassiumRangeUnit: { type: String, default: null },
  // pH Range
  phRange: {
    type: numericRangeSchema,
    default: null
  },
  ecRange: { type: numericRangeSchema, default: null },
  organicCarbonRange: { type: numericRangeSchema, default: null },
  rainfallRequirement: { type: numericRangeSchema, default: null },
  season: { type: [String], default: [] },
  cropStages: { type: [mongoose.Schema.Types.Mixed], default: [] },
  ruleMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  // Water and Weather
  waterRequirement: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: null
  },
  rainDependency: {
    type: Boolean,
    default: null
  },
  // Market
  marketVolatility: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: null
  },
  averageYield: {
    type: Number,
    default: null
  },
  // Growing period in days
  growingPeriod: {
    type: Number,
    default: null
  },
  // Suitable soil types
  suitableSoilTypes: [{
    type: String,
    enum: ['Sandy', 'Loamy', 'Clay']
  }]
}, {
  timestamps: true
});

// Index for queries
cropSchema.index({ suitableSoilTypes: 1 });

// Method to check if crop matches soil conditions
cropSchema.methods.matchesSoil = function(nitrogen, phosphorus, potassium, ph) {
  const matches = (value, range) => Number.isFinite(value) && Number.isFinite(range?.min) && Number.isFinite(range?.max) && value >= range.min && value <= range.max;
  const nMatch = matches(nitrogen, this.nitrogenRange);
  const pMatch = matches(phosphorus, this.phosphorusRange);
  const kMatch = matches(potassium, this.potassiumRange);
  const phMatch = matches(ph, this.phRange);
  
  return {
    matches: nMatch && pMatch && kMatch && phMatch,
    score: this.calculateMatchScore(nitrogen, phosphorus, potassium, ph),
    details: {
      nitrogen: nMatch,
      phosphorus: pMatch,
      potassium: kMatch,
      ph: phMatch
    }
  };
};

cropSchema.methods.calculateMatchScore = function(n, p, k, ph) {
  let score = 0;
  let evaluated = 0;
  
  // Legacy helper: missing values/ranges are excluded from its normalized score.
  if (Number.isFinite(n) && this.nitrogenRange && Number.isFinite(this.nitrogenRange.min) && Number.isFinite(this.nitrogenRange.max)) {
    evaluated += 25;
    if (n >= this.nitrogenRange.min && n <= this.nitrogenRange.max) score += 25;
  }
  
  // P match (25%)
  if (Number.isFinite(p) && this.phosphorusRange && Number.isFinite(this.phosphorusRange.min) && Number.isFinite(this.phosphorusRange.max)) {
    evaluated += 25;
    if (p >= this.phosphorusRange.min && p <= this.phosphorusRange.max) score += 25;
  }
  
  // K match (25%)
  if (Number.isFinite(k) && this.potassiumRange && Number.isFinite(this.potassiumRange.min) && Number.isFinite(this.potassiumRange.max)) {
    evaluated += 25;
    if (k >= this.potassiumRange.min && k <= this.potassiumRange.max) score += 25;
  }
  
  // pH match (25%)
  if (Number.isFinite(ph) && this.phRange && Number.isFinite(this.phRange.min) && Number.isFinite(this.phRange.max)) {
    evaluated += 25;
    if (ph >= this.phRange.min && ph <= this.phRange.max) score += 25;
  }
  
  return evaluated ? Math.round(score / evaluated * 100) : 0;
};

module.exports = mongoose.model('Crop', cropSchema);
