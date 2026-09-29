const mongoose = require('mongoose');

describe('in-memory database crop catalogue startup', () => {
  let database;
  let ensureCropCatalog;
  let Crop;
  let previousMemorySetting;

  beforeAll(async () => {
    previousMemorySetting = process.env.USE_MEMORY_DB;
    process.env.USE_MEMORY_DB = 'true';
    database = require('../config/database');
    ({ ensureCropCatalog } = require('../scripts/seedCrops'));
    Crop = require('../models/Crop');
    await database.startMemoryDB();
    await ensureCropCatalog();
  });

  afterAll(async () => {
    if (database) await database.stopMemoryDB();
    if (previousMemorySetting === undefined) delete process.env.USE_MEMORY_DB;
    else process.env.USE_MEMORY_DB = previousMemorySetting;
  });

  test('memory-backed MongoDB continues to receive the existing crop catalogue', async () => {
    expect(await mongoose.connection.db.collection('crops').countDocuments()).toBe(8);
    expect(await Crop.distinct('cropId')).toHaveLength(8);
  });
});
