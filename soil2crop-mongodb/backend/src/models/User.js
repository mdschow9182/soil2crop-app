const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Stores farmer information
 */
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    sparse: true  // Allow null initially, will be generated pre-save
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'],
    index: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  language: {
    type: String,
    required: true,
    enum: ['en', 'hi', 'te', 'ta', 'kn', 'ml'],
    default: 'en'
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
userSchema.index({ district: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate userId if not provided
userSchema.pre('save', function(next) {
  if (!this.userId) {
    this.userId = 'USR' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
