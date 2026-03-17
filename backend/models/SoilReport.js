/**
 * Soil Report Model
 * 
 * Research Relevance:
 * - Stores historical soil data for trend analysis
 * - Links soil conditions to crop outcomes
 * - Supports precision agriculture research
 */

const mongoose = require('mongoose');

const soilReportSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  filePath: {
    type: String,
    default: null
  },
  ph: {
    type: Number,
    min: [0, 'pH cannot be less than 0'],
    max: [14, 'pH cannot be more than 14'],
    default: null
  },
  nitrogen: {
    type: Number,
    min: [0, 'Nitrogen cannot be negative'],
    default: null
  },
  phosphorus: {
    type: Number,
    min: [0, 'Phosphorus cannot be negative'],
    default: null
  },
  potassium: {
    type: Number,
    min: [0, 'Potassium cannot be negative'],
    default: null
  },
  soilType: {
    type: String,
    enum: ['Sandy', 'Loamy', 'Clay', 'Silty', 'Unknown'],
    default: 'Unknown'
  },
  fertilityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', null],
    default: null
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for farmer queries
soilReportSchema.index({ farmerId: 1, createdAt: -1 });

// Virtual for report id reference
soilReportSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Note: confidenceScore is automatically set to 100 by schema default

// Instance method to calculate confidence score
soilReportSchema.methods.calculateConfidenceScore = function() {
  let score = 100;
  
  // Check report age (-30% if older than 2 years)
  if (this.createdAt) {
    const ageInDays = Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (ageInDays > 730) {
      score -= 30;
    }
  }
  
  // Check for extreme values (-10% each)
  if (this.nitrogen !== null && (this.nitrogen > 400 || this.nitrogen < 10)) score -= 10;
  if (this.phosphorus !== null && (this.phosphorus > 80 || this.phosphorus < 5)) score -= 10;
  if (this.potassium !== null && (this.potassium > 400 || this.potassium < 10)) score -= 10;
  if (this.ph !== null && (this.ph > 9 || this.ph < 4)) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Static method to get confidence label
soilReportSchema.statics.getConfidenceLabel = function(score) {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

module.exports = mongoose.model('SoilReport', soilReportSchema);
