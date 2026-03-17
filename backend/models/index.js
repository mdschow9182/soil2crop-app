/**
 * Models Index
 * Central export for all MongoDB models
 */

const Farmer = require('./Farmer');
const SoilReport = require('./SoilReport');
const CropImage = require('./CropImage');
const HelpRequest = require('./HelpRequest');
const FarmerSupport = require('./FarmerSupport');

module.exports = {
  Farmer,
  SoilReport,
  CropImage,
  HelpRequest,
  FarmerSupport
};
