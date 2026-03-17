const mongoose = require('mongoose');

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
  // NPK Requirements
  nitrogenRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  phosphorusRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  potassiumRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  // pH Range
  phRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  // Water and Weather
  waterRequirement: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  rainDependency: {
    type: Boolean,
    default: false
  },
  // Market
  marketVolatility: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  averageYield: {
    type: Number,
    required: true
  },
  // Growing period in days
  growingPeriod: {
    type: Number,
    default: 90
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
  const nMatch = nitrogen >= this.nitrogenRange.min && nitrogen <= this.nitrogenRange.max;
  const pMatch = phosphorus >= this.phosphorusRange.min && phosphorus <= this.phosphorusRange.max;
  const kMatch = potassium >= this.potassiumRange.min && potassium <= this.potassiumRange.max;
  const phMatch = ph >= this.phRange.min && ph <= this.phRange.max;
  
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
  
  // N match (25%)
  if (n >= this.nitrogenRange.min && n <= this.nitrogenRange.max) {
    score += 25;
  } else {
    const range = this.nitrogenRange.max - this.nitrogenRange.min;
    const mid = (this.nitrogenRange.min + this.nitrogenRange.max) / 2;
    const dist = Math.abs(n - mid);
    score += Math.max(0, 25 - (dist / range) * 25);
  }
  
  // P match (25%)
  if (p >= this.phosphorusRange.min && p <= this.phosphorusRange.max) {
    score += 25;
  }
  
  // K match (25%)
  if (k >= this.potassiumRange.min && k <= this.potassiumRange.max) {
    score += 25;
  }
  
  // pH match (25%)
  if (ph >= this.phRange.min && ph <= this.phRange.max) {
    score += 25;
  }
  
  return Math.round(score);
};

module.exports = mongoose.model('Crop', cropSchema);
