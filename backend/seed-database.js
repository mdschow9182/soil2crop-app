/**
 * Database Seed Script
 * Populates MongoDB with sample farmers and soil reports for testing
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Farmer = require('./models/Farmer');
const SoilReport = require('./models/SoilReport');

async function seedDatabase() {
  try {
    console.log('=================================');
    console.log('🌱 SEEDING DATABASE...');
    console.log('=================================\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/soil2crop';
    console.log(`[1] Connecting to MongoDB...`);
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected successfully\n');

    // Clear existing data (optional - comment out to keep existing data)
    console.log('[2] Clearing existing data...');
    await Farmer.deleteMany({});
    await SoilReport.deleteMany({});
    console.log('✅ Collections cleared\n');

    // Sample farmers data
    console.log('[3] Creating sample farmers...');
    const farmersData = [
      {
        name: 'Ramesh Kumar',
        mobile: '9876543210',
        language: 'hi',
        district: 'Guntur'
      },
      {
        name: 'Srinivas Rao',
        mobile: '9123456789',
        language: 'te',
        district: 'Krishna'
      },
      {
        name: 'Venkatesh',
        mobile: '8765432109',
        language: 'te',
        district: 'Guntur'
      },
      {
        name: 'Arjun Reddy',
        mobile: '7654321098',
        language: 'en',
        district: 'Chittoor'
      },
      {
        name: 'Lakshmi Devi',
        mobile: '9988776655',
        language: 'hi',
        district: 'Kurnool'
      }
    ];

    const farmers = await Farmer.insertMany(farmersData);
    console.log(`✅ Created ${farmers.length} farmers\n`);

    // Sample soil reports data
    console.log('[4] Creating sample soil reports...');
    const soilReportsData = [
      {
        farmerId: farmers[0]._id,
        filePath: null, // Manual entry
        ph: 7.2,
        nitrogen: 220,
        phosphorus: 25,
        potassium: 180,
        soilType: 'Loamy',
        fertilityLevel: 'Medium'
      },
      {
        farmerId: farmers[1]._id,
        filePath: null,
        ph: 6.8,
        nitrogen: 180,
        phosphorus: 30,
        potassium: 200,
        soilType: 'Clay',
        fertilityLevel: 'High'
      },
      {
        farmerId: farmers[2]._id,
        filePath: '/uploads/soil-reports/sample1.pdf',
        ph: 7.5,
        nitrogen: 150,
        phosphorus: 20,
        potassium: 160,
        soilType: 'Sandy',
        fertilityLevel: 'Low'
      },
      {
        farmerId: farmers[3]._id,
        filePath: null,
        ph: 6.5,
        nitrogen: 250,
        phosphorus: 35,
        potassium: 220,
        soilType: 'Loamy',
        fertilityLevel: 'High'
      },
      {
        farmerId: farmers[4]._id,
        filePath: null,
        ph: 7.0,
        nitrogen: 200,
        phosphorus: 28,
        potassium: 190,
        soilType: 'Silty',
        fertilityLevel: 'Medium'
      }
    ];

    const soilReports = await SoilReport.insertMany(soilReportsData);
    console.log(`✅ Created ${soilReports.length} soil reports\n`);

    // Display summary
    console.log('[5] Database Summary:');
    console.log('=================================');
    console.log('FARMERS CREATED:');
    console.log('=================================');
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name}`);
      console.log(`   Mobile: ${farmer.mobile}`);
      console.log(`   Language: ${farmer.language}`);
      console.log(`   District: ${farmer.district}`);
      console.log(`   ID: ${farmer._id}`);
      console.log('');
    });

    console.log('=================================');
    console.log('SOIL REPORTS CREATED:');
    console.log('=================================');
    soilReports.forEach((report, index) => {
      console.log(`${index + 1}. Report for Farmer ID: ${report.farmerId}`);
      console.log(`   pH: ${report.ph}`);
      console.log(`   N-P-K: ${report.nitrogen}-${report.phosphorus}-${report.potassium}`);
      console.log(`   Soil Type: ${report.soilType}`);
      console.log(`   Fertility: ${report.fertilityLevel}`);
      console.log(`   ID: ${report._id}`);
      console.log('');
    });

    console.log('=================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('=================================\n');

    console.log('📊 Total Documents:');
    console.log(`   Farmers: ${farmers.length}`);
    console.log(`   Soil Reports: ${soilReports.length}`);
    console.log('\n💡 You can now test the application with real data!');
    console.log('   Frontend URL: http://localhost:5173');
    console.log('   Backend URL: http://localhost:3000\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run seeder
seedDatabase();
