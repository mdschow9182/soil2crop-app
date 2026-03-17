/**
 * Farmer Support Request Model
 * Stores farmer questions, problems, and support requests
 */

const mongoose = require('mongoose');

const farmerSupportSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['question', 'problem', 'tip_request', 'contact_request'],
    default: 'question'
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: 2000
  },
  image: {
    url: String,
    filename: String,
    uploadedAt: Date
  },
  cropType: {
    type: String,
    trim: true
  },
  farmLocation: {
    district: String,
    village: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
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
  response: {
    type: String,
    maxlength: 2000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  },
  respondedAt: Date,
  language: {
    type: String,
    enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml'],
    default: 'en'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Boolean
  },
  farmerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      maxlength: 500
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
farmerSupportSchema.index({ farmerId: 1, createdAt: -1 });
farmerSupportSchema.index({ type: 1 });
farmerSupportSchema.index({ status: 1 });
farmerSupportSchema.index({ priority: 1 });

// Virtual for request ID
farmerSupportSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Static method to get statistics
farmerSupportSchema.statics.getStatistics = async function(farmerId) {
  const stats = await this.aggregate([
    {
      $match: farmerId ? { farmerId: new mongoose.Types.ObjectId(farmerId) } : {}
    },
    {
      $group: {
        _id: '$type',
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

module.exports = mongoose.model('FarmerSupport', farmerSupportSchema);
