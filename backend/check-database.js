/**
 * Database Diagnostic Tool
 * Check what data is actually stored in MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Farmer = require('./models/Farmer');
const SoilReport = require('./models/SoilReport');

async function diagnoseDatabase() {
  try {
    console.log('=================================');
    console.log('🔍 DATABASE DIAGNOSTIC TOOL');
    console.log('=================================\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/soil2crop';
    console.log(`[1] Connecting to MongoDB...`);
    console.log(`    URI: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected successfully\n');

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    console.log(`[2] Available Collections:`);
    console.log(`    Total: ${collections.length}`);
    collections.forEach(col => {
      console.log(`    - ${col.collectionName}`);
    });
    console.log('');

    // Check Farmers collection
    console.log(`[3] Farmers Collection Analysis:`);
    const farmerCount = await Farmer.countDocuments();
    console.log(`    Total Farmers: ${farmerCount}`);
    
    if (farmerCount > 0) {
      const farmers = await Farmer.find().limit(5).lean();
      console.log(`\n    Sample Farmer Documents (first 5):`);
      farmers.forEach((farmer, index) => {
        console.log(`\n    --- Farmer #${index + 1} ---`);
        console.log(`    _id: ${farmer._id}`);
        console.log(`    Name: ${farmer.name || 'MISSING'}`);
        console.log(`    Mobile: ${farmer.mobile || 'MISSING'}`);
        console.log(`    Language: ${farmer.language || 'MISSING'}`);
        console.log(`    District: ${farmer.district || 'MISSING'}`);
        console.log(`    Created: ${farmer.createdAt || 'MISSING'}`);
        console.log(`    Updated: ${farmer.updatedAt || 'MISSING'}`);
      });
      
      // Check for missing fields
      console.log(`\n    Field Completeness Analysis:`);
      const farmersWithAllFields = await Farmer.find({
        name: { $exists: true, $ne: null },
        mobile: { $exists: true, $ne: null },
        language: { $exists: true, $ne: null }
      }).countDocuments();
      
      console.log(`    - Farmers with ALL required fields: ${farmersWithAllFields}/${farmerCount}`);
      console.log(`    - Farmers with MISSING fields: ${farmerCount - farmersWithAllFields}/${farmerCount}`);
      
      // Check for empty strings
      const farmersWithEmptyName = await Farmer.find({ 
        $or: [{ name: '' }, { name: { $exists: false } }] 
      }).countDocuments();
      
      console.log(`    - Farmers with EMPTY name: ${farmersWithEmptyName}/${farmerCount}`);
    }
    console.log('');

    // Check Soil Reports collection
    console.log(`[4] Soil Reports Collection Analysis:`);
    const reportCount = await SoilReport.countDocuments();
    console.log(`    Total Reports: ${reportCount}`);
    
    if (reportCount > 0) {
      const reports = await SoilReport.find().populate('farmerId').limit(5).lean();
      console.log(`\n    Sample Soil Report Documents (first 5):`);
      reports.forEach((report, index) => {
        console.log(`\n    --- Report #${index + 1} ---`);
        console.log(`    _id: ${report._id}`);
        console.log(`    Farmer ID: ${report.farmerId ? report.farmerId._id : 'MISSING'}`);
        console.log(`    Farmer Name: ${report.farmerId ? report.farmerId.name : 'NO FARMER LINK'}`);
        console.log(`    File Path: ${report.filePath || 'NULL (manual entry)'}`);
        console.log(`    pH: ${report.ph || 'NULL'}`);
        console.log(`    Nitrogen: ${report.nitrogen || 'NULL'}`);
        console.log(`    Phosphorus: ${report.phosphorus || 'NULL'}`);
        console.log(`    Potassium: ${report.potassium || 'NULL'}`);
        console.log(`    Soil Type: ${report.soilType || 'NULL'}`);
        console.log(`    Fertility: ${report.fertilityLevel || 'NULL'}`);
        console.log(`    Confidence: ${report.confidenceScore || 'NULL'}`);
        console.log(`    Created: ${report.createdAt || 'MISSING'}`);
      });
      
      // Check for missing fields
      console.log(`\n    Field Completeness Analysis:`);
      const reportsWithAllFields = await SoilReport.find({
        farmerId: { $exists: true, $ne: null },
        ph: { $exists: true, $ne: null }
      }).countDocuments();
      
      console.log(`    - Reports with farmerId + pH: ${reportsWithAllFields}/${reportCount}`);
      
      // Check orphaned reports (no farmer link)
      const orphanedReports = await SoilReport.find({
        farmerId: null
      }).countDocuments();
      
      console.log(`    - Orphaned reports (no farmer): ${orphanedReports}/${reportCount}`);
      
      // Check reports without file uploads (manual entries)
      const manualEntries = await SoilReport.find({
        filePath: null
      }).countDocuments();
      
      console.log(`    - Manual entries (no file): ${manualEntries}/${reportCount}`);
    }
    console.log('');

    // Database statistics
    console.log(`[5] Database Statistics:`);
    const stats = await mongoose.connection.db.stats();
    console.log(`    Database Name: ${stats.db}`);
    console.log(`    Total Documents: ${stats.objects}`);
    console.log(`    Total Collections: ${stats.collections}`);
    console.log(`    Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`    Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    console.log(`    Index Size: ${(stats.indexSize / 1024).toFixed(2)} KB`);
    console.log('');

    // Common issues detection
    console.log(`[6] Issue Detection:`);
    
    // Check for duplicate mobile numbers (should be unique)
    const duplicateMobiles = await Farmer.aggregate([
      {
        $group: {
          _id: '$mobile',
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);
    
    if (duplicateMobiles.length > 0) {
      console.log(`    ⚠️  WARNING: Found ${duplicateMobiles.length} duplicate mobile numbers!`);
      duplicateMobiles.forEach(dup => {
        console.log(`       - Mobile ${dup._id}: ${dup.count} occurrences`);
      });
    } else {
      console.log(`    ✅ No duplicate mobile numbers found`);
    }
    
    // Check for invalid data types
    const farmersWithInvalidMobile = await Farmer.find({
      mobile: { $not: /^\d{10}$/ }
    }).countDocuments();
    
    if (farmersWithInvalidMobile > 0) {
      console.log(`    ⚠️  WARNING: ${farmersWithInvalidMobile} farmers have invalid mobile numbers`);
    } else {
      console.log(`    ✅ All mobile numbers are valid (10 digits)`);
    }
    
    // Check for very old reports
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const oldReports = await SoilReport.find({
      createdAt: { $lt: twoYearsAgo }
    }).countDocuments();
    
    if (oldReports > 0) {
      console.log(`    ℹ️  INFO: ${oldReports} soil reports are older than 2 years`);
    } else {
      console.log(`    ✅ No outdated reports found`);
    }
    
    console.log('');
    console.log('=================================');
    console.log('✅ DIAGNOSIS COMPLETE');
    console.log('=================================\n');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run diagnosis
diagnoseDatabase();
