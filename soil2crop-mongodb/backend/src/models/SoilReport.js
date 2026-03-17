const mongoose = require('mongoose');

/**
 * Soil Report Schema
 * Stores soil test data with confidence scoring
 */
const soilReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    sparse: true  // Allow null initially, will be generated pre-save
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  // Soil parameters
  nitrogen: {
    type: Number,
    required: [true, 'Nitrogen value is required'],
    min: [0, 'Nitrogen cannot be negative'],
    max: [500, 'Nitrogen value seems unrealistic']
  },
  phosphorus: {
    type: Number,
    required: [true, 'Phosphorus value is required'],
    min: [0, 'Phosphorus cannot be negative'],
    max: [100, 'Phosphorus value seems unrealistic']
  },
  potassium: {
    type: Number,
    required: [true, 'Potassium value is required'],
    min: [0, 'Potassium cannot be negative'],
    max: [500, 'Potassium value seems unrealistic']
  },
  ph: {
    type: Number,
    required: [true, 'pH value is required'],
    min: [0, 'pH cannot be less than 0'],
    max: [14, 'pH cannot be more than 14']
  },
  // Metadata
  reportDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  soilType: {
    type: String,
    enum: ['Sandy', 'Loamy', 'Clay', 'Unknown'],
    default: 'Unknown'
  }
}, {
  timestamps: true
});

// Compound index for user queries
soilReportSchema.index({ userId: 1, createdAt: -1 });

// Calculate confidence score before saving
soilReportSchema.pre('save', function(next) {
  this.confidenceScore = this.calculateInstanceConfidenceScore();
  
  // Generate reportId if not provided
  if (!this.reportId) {
    this.reportId = 'SR' + Date.now().toString(36).toUpperCase();
  }
  
  next();
});

// Static method to calculate confidence score
soilReportSchema.statics.calculateConfidenceScore = function({
  reportDate,
  nitrogen,
  phosphorus,
  potassium,
  ph
}) {
  let score = 100;
  
  // Check report age (-30% if older than 2 years)
  const ageInDays = Math.floor((Date.now() - new Date(reportDate).getTime()) / (1000 * 60 * 60 * 24));
  if (ageInDays > 730) {
    score -= 30;
  }
  
  // Check for extreme values (-10% each)
  if (nitrogen > 400 || nitrogen < 10) score -= 10;
  if (phosphorus > 80 || phosphorus < 5) score -= 10;
  if (potassium > 400 || potassium < 10) score -= 10;
  if (ph > 9 || ph < 4) score -= 10;
  
  return Math.max(0, Math.min(100, score));
};

// Instance method to calculate confidence score (for pre-save hook)
soilReportSchema.methods.calculateInstanceConfidenceScore = function() {
  return this.constructor.calculateConfidenceScore({
    reportDate: this.reportDate,
    nitrogen: this.nitrogen,
    phosphorus: this.phosphorus,
    potassium: this.potassium,
    ph: this.ph
  });
};

// Static method to get confidence label
soilReportSchema.statics.getConfidenceLabel = function(score) {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

module.exports = mongoose.model('SoilReport', soilReportSchema);
