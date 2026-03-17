/**
 * Farmer Model
 * 
 * Research Relevance:
 * - Tracks farmer engagement patterns over time
 * - Supports multilingual user base analysis
 * - Enables personalized recommendation systems
 */

const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml'],
    default: 'en'
  },
  district: {
    type: String,
    trim: true,
    default: 'Unknown'
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
farmerSchema.index({ mobile: 1 });
farmerSchema.index({ createdAt: -1 });

// Virtual for farmer id reference (for backward compatibility)
farmerSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('Farmer', farmerSchema);
