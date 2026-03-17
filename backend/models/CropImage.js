/**
 * Crop Image Model
 * 
 * Stores crop monitoring images and AI analysis results
 */

const mongoose = require('mongoose');

const cropImageSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: [true, 'Farmer ID is required'],
    index: true
  },
  imagePath: {
    type: String,
    required: [true, 'Image path is required']
  },
  analysisResult: {
    type: Object,
    default: {}
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for farmer queries
cropImageSchema.index({ farmerId: 1, createdAt: -1 });

// Virtual for image id reference
cropImageSchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('CropImage', cropImageSchema);
