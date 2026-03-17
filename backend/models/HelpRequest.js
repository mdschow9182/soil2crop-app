/**
 * Help/Feedback Model
 * Stores farmer feedback, issues, and support requests
 */

const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technical_issue',
      'feature_request', 
      'bug_report',
      'general_feedback',
      'account_issue',
      'data_issue',
      'other'
    ],
    default: 'general_feedback'
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 2000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  contactPreference: {
    type: String,
    enum: ['email', 'phone', 'sms', 'none'],
    default: 'none'
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: Date
  }],
  language: {
    type: String,
    enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml'],
    default: 'en'
  },
  resolution: {
    type: String,
    maxlength: 2000
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  },
  farmerSatisfaction: {
    type: Number,
    min: 1,
    max: 5
  },
  farmerComments: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
helpRequestSchema.index({ farmerId: 1, createdAt: -1 });
helpRequestSchema.index({ status: 1 });
helpRequestSchema.index({ category: 1 });
helpRequestSchema.index({ priority: 1 });

// Virtual for request ID
helpRequestSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Static method to get statistics
helpRequestSchema.statics.getStatistics = async function(farmerId) {
  const stats = await this.aggregate([
    {
      $match: farmerId ? { farmerId: new mongoose.Types.ObjectId(farmerId) } : {}
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, item) => {
    acc[item._id] = item.count;
    acc.total = (acc.total || 0) + item.count;
    return acc;
  }, {});
};

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
