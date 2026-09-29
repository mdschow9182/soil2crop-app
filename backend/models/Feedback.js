const mongoose = require('mongoose');

/**
 * Feedback Schema
 * Stores farmer feedback for pattern-based learning
 */
const feedbackSchema = new mongoose.Schema({
  feedbackId: {
    type: String,
    unique: true,
    sparse: true  // Allow null initially, will be generated pre-save
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  soilReportId: {
    type: String,
    required: true,
    ref: 'SoilReport'
  },
  // Soil data snapshot for analysis
  nitrogen: {
    type: Number,
    required: true
  },
  phosphorus: {
    type: Number,
    required: true
  },
  potassium: {
    type: Number,
    required: true
  },
  ph: {
    type: Number,
    required: true
  },
  // Feedback data
  cropChosen: {
    type: String,
    required: true
  },
  approximateYield: {
    type: Number,
    required: true,
    min: 0
  },
  satisfactionLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // District for community insights
  district: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for analytics
feedbackSchema.index({ district: 1, cropChosen: 1 });
feedbackSchema.index({ nitrogen: 1, phosphorus: 1, potassium: 1 });
feedbackSchema.index({ createdAt: -1 });

// Generate feedbackId before saving
feedbackSchema.pre('save', function(next) {
  if (!this.feedbackId) {
    this.feedbackId = 'FB' + Date.now().toString(36).toUpperCase();
  }
  next();
});

// Static method to get crop statistics for a district
feedbackSchema.statics.getCropStats = async function(district) {
  const stats = await this.aggregate([
    { $match: { district, satisfactionLevel: { $gte: 3 } } },
    {
      $group: {
        _id: '$cropChosen',
        count: { $sum: 1 },
        avgYield: { $avg: '$approximateYield' },
        avgSatisfaction: { $avg: '$satisfactionLevel' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  
  return stats.map(s => ({
    crop: s._id,
    count: s.count,
    percentage: Math.round((s.count / total) * 100),
    averageYield: Math.round(s.avgYield * 10) / 10,
    averageSatisfaction: Math.round(s.avgSatisfaction * 10) / 10
  }));
};

module.exports = mongoose.model('Feedback', feedbackSchema);
