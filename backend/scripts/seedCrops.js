/**
 * Seed script for Soil2Crop crops database
 * Run: node scripts/seedCrops.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Crop = require('../models/Crop');

// Crop data
const cropsData = [
  {
    cropId: 'rice',
    cropName: 'Rice',
    nitrogenRange: { min: 100, max: 200 },
    phosphorusRange: { min: 15, max: 40 },
    potassiumRange: { min: 100, max: 200 },
    phRange: { min: 5.5, max: 7.5 },
    waterRequirement: 'High',
    rainDependency: true,
    marketVolatility: 'Low',
    averageYield: 25,
    growingPeriod: 120,
    suitableSoilTypes: ['Loamy', 'Clay']
  },
  {
    cropId: 'wheat',
    cropName: 'Wheat',
    nitrogenRange: { min: 80, max: 150 },
    phosphorusRange: { min: 20, max: 45 },
    potassiumRange: { min: 80, max: 160 },
    phRange: { min: 6.0, max: 7.5 },
    waterRequirement: 'Medium',
    rainDependency: false,
    marketVolatility: 'Low',
    averageYield: 30,
    growingPeriod: 140,
    suitableSoilTypes: ['Loamy', 'Sandy']
  },
  {
    cropId: 'cotton',
    cropName: 'Cotton',
    nitrogenRange: { min: 60, max: 120 },
    phosphorusRange: { min: 15, max: 35 },
    potassiumRange: { min: 60, max: 120 },
    phRange: { min: 6.0, max: 8.0 },
    waterRequirement: 'Medium',
    rainDependency: false,
    marketVolatility: 'High',
    averageYield: 15,
    growingPeriod: 180,
    suitableSoilTypes: ['Sandy', 'Loamy']
  },
  {
    cropId: 'maize',
    cropName: 'Maize',
    nitrogenRange: { min: 100, max: 180 },
    phosphorusRange: { min: 20, max: 40 },
    potassiumRange: { min: 80, max: 150 },
    phRange: { min: 5.8, max: 7.0 },
    waterRequirement: 'Medium',
    rainDependency: true,
    marketVolatility: 'Medium',
    averageYield: 40,
    growingPeriod: 100,
    suitableSoilTypes: ['Loamy', 'Sandy']
  },
  {
    cropId: 'sugarcane',
    cropName: 'Sugarcane',
    nitrogenRange: { min: 120, max: 250 },
    phosphorusRange: { min: 25, max: 50 },
    potassiumRange: { min: 100, max: 200 },
    phRange: { min: 6.0, max: 7.5 },
    waterRequirement: 'High',
    rainDependency: true,
    marketVolatility: 'Low',
    averageYield: 80,
    growingPeriod: 300,
    suitableSoilTypes: ['Loamy', 'Clay']
  },
  {
    cropId: 'groundnut',
    cropName: 'Groundnut',
    nitrogenRange: { min: 20, max: 60 },
    phosphorusRange: { min: 20, max: 45 },
    potassiumRange: { min: 30, max: 80 },
    phRange: { min: 6.0, max: 7.5 },
    waterRequirement: 'Low',
    rainDependency: false,
    marketVolatility: 'Medium',
    averageYield: 12,
    growingPeriod: 110,
    suitableSoilTypes: ['Sandy', 'Loamy']
  },
  {
    cropId: 'soybean',
    cropName: 'Soybean',
    nitrogenRange: { min: 20, max: 80 },
    phosphorusRange: { min: 20, max: 40 },
    potassiumRange: { min: 40, max: 100 },
    phRange: { min: 6.0, max: 7.5 },
    waterRequirement: 'Medium',
    rainDependency: true,
    marketVolatility: 'Medium',
    averageYield: 18,
    growingPeriod: 100,
    suitableSoilTypes: ['Loamy', 'Clay']
  },
  {
    cropId: 'chickpea',
    cropName: 'Chickpea',
    nitrogenRange: { min: 20, max: 60 },
    phosphorusRange: { min: 15, max: 35 },
    potassiumRange: { min: 30, max: 80 },
    phRange: { min: 6.0, max: 8.0 },
    waterRequirement: 'Low',
    rainDependency: false,
    marketVolatility: 'Low',
    averageYield: 10,
    growingPeriod: 100,
    suitableSoilTypes: ['Loamy', 'Sandy']
  }
];

// Existing seed ranges are project-configured placeholders without a recorded
// publication. Preserve the values while marking that provenance explicitly.
cropsData.forEach((crop) => {
  crop.ruleMetadata = {
    phRange: { status: 'project_configured', sourceReference: null },
    suitableSoilTypes: { status: 'project_configured', sourceReference: null },
    nitrogenRange: { status: 'project_configured', sourceReference: null, unit: null, comparisonBasis: null },
    phosphorusRange: { status: 'project_configured', sourceReference: null, unit: null, comparisonBasis: null },
    potassiumRange: { status: 'project_configured', sourceReference: null, unit: null, comparisonBasis: null },
    waterRequirement: { status: 'project_configured', sourceReference: null }
  };
});

// Insert only missing project records. Never delete or overwrite crop values.
const seedCrops = async () => {
  for (const crop of cropsData) {
    await Crop.updateOne({ cropId: crop.cropId }, { $setOnInsert: crop }, { upsert: true });
  }
  return Crop.countDocuments();
};

// Seed only a completely empty collection during application startup. Existing
// catalogues are left untouched; the underlying upserts remain safe to rerun.
const ensureCropCatalog = async () => {
  const existingCount = await Crop.countDocuments();
  if (existingCount > 0) {
    return { seeded: false, count: existingCount };
  }

  const count = await seedCrops();
  return { seeded: true, count };
};

if (require.main === module) {
  (async () => {
    try {
      if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI environment variable is not defined');
      await mongoose.connect(process.env.MONGODB_URI);
      const count = await seedCrops();
      console.log(`Crop seed complete; ${count} crop records are available.`);
      await mongoose.disconnect();
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exitCode = 1;
    }
  })();
}

module.exports = { cropsData, seedCrops, ensureCropCatalog };
