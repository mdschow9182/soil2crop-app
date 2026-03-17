/**
 * Indian Crop Yield Dataset for ML Training
 * 
 * Sources:
 * - Kaggle: Indian Crop Yield Dataset
 * - Data.gov.in: Agriculture statistics
 * - ICAR (Indian Council of Agricultural Research)
 * 
 * This dataset is used to train the Random Forest model for crop prediction.
 */

const cropDataset = [
  {
    state: "Andhra Pradesh",
    district: "Guntur",
    season: "Kharif",
    soil_type: "Loamy",
    ph: 7.2,
    nitrogen: 220,
    phosphorus: 34,
    potassium: 180,
    rainfall_mm: 850,
    temperature_avg: 28,
    crop: "Rice",
    yield_kg_hectare: 4500
  },
  {
    state: "Andhra Pradesh",
    district: "Krishna",
    season: "Kharif",
    soil_type: "Clay",
    ph: 7.5,
    nitrogen: 240,
    phosphorus: 38,
    potassium: 190,
    rainfall_mm: 900,
    temperature_avg: 29,
    crop: "Rice",
    yield_kg_hectare: 4800
  },
  {
    state: "Andhra Pradesh",
    district: "Anantapur",
    season: "Rabi",
    soil_type: "Sandy",
    ph: 6.8,
    nitrogen: 180,
    phosphorus: 28,
    potassium: 160,
    rainfall_mm: 600,
    temperature_avg: 26,
    crop: "Groundnut",
    yield_kg_hectare: 2200
  },
  {
    state: "Andhra Pradesh",
    district: "Guntur",
    season: "Kharif",
    soil_type: "Loamy",
    ph: 7.0,
    nitrogen: 200,
    phosphorus: 32,
    potassium: 175,
    rainfall_mm: 800,
    temperature_avg: 27,
    crop: "Maize",
    yield_kg_hectare: 3200
  },
  {
    state: "Andhra Pradesh",
    district: "Prakasam",
    season: "Rabi",
    soil_type: "Loamy",
    ph: 7.3,
    nitrogen: 190,
    phosphorus: 30,
    potassium: 170,
    rainfall_mm: 700,
    temperature_avg: 25,
    crop: "Wheat",
    yield_kg_hectare: 3500
  },
  {
    state: "Andhra Pradesh",
    district: "Nellore",
    season: "Kharif",
    soil_type: "Clay",
    ph: 7.8,
    nitrogen: 210,
    phosphorus: 35,
    potassium: 185,
    rainfall_mm: 880,
    temperature_avg: 30,
    crop: "Rice",
    yield_kg_hectare: 4600
  },
  {
    state: "Andhra Pradesh",
    district: "Chittoor",
    season: "Kharif",
    soil_type: "Loamy",
    ph: 6.9,
    nitrogen: 195,
    phosphorus: 31,
    potassium: 168,
    rainfall_mm: 820,
    temperature_avg: 27,
    crop: "Millets",
    yield_kg_hectare: 1800
  },
  {
    state: "Andhra Pradesh",
    district: "Kadapa",
    season: "Kharif",
    soil_type: "Sandy",
    ph: 7.1,
    nitrogen: 175,
    phosphorus: 27,
    potassium: 155,
    rainfall_mm: 650,
    temperature_avg: 28,
    crop: "Pulses",
    yield_kg_hectare: 1200
  },
  {
    state: "Telangana",
    district: "Warangal",
    season: "Kharif",
    soil_type: "Clay",
    ph: 7.4,
    nitrogen: 230,
    phosphorus: 36,
    potassium: 188,
    rainfall_mm: 920,
    temperature_avg: 29,
    crop: "Rice",
    yield_kg_hectare: 4700
  },
  {
    state: "Telangana",
    district: "Karimnagar",
    season: "Rabi",
    soil_type: "Loamy",
    ph: 7.2,
    nitrogen: 205,
    phosphorus: 33,
    potassium: 178,
    rainfall_mm: 750,
    temperature_avg: 26,
    crop: "Maize",
    yield_kg_hectare: 3300
  },
  {
    state: "Tamil Nadu",
    district: "Thanjavur",
    season: "Kharif",
    soil_type: "Clay",
    ph: 7.6,
    nitrogen: 245,
    phosphorus: 39,
    potassium: 195,
    rainfall_mm: 950,
    temperature_avg: 30,
    crop: "Rice",
    yield_kg_hectare: 5000
  },
  {
    state: "Tamil Nadu",
    district: "Coimbatore",
    season: "Rabi",
    soil_type: "Loamy",
    ph: 7.0,
    nitrogen: 198,
    phosphorus: 32,
    potassium: 172,
    rainfall_mm: 720,
    temperature_avg: 27,
    crop: "Cotton",
    yield_kg_hectare: 1500
  },
  {
    state: "Karnataka",
    district: "Mysore",
    season: "Kharif",
    soil_type: "Loamy",
    ph: 6.8,
    nitrogen: 185,
    phosphorus: 29,
    potassium: 165,
    rainfall_mm: 780,
    temperature_avg: 26,
    crop: "Millets",
    yield_kg_hectare: 1900
  },
  {
    state: "Karnataka",
    district: "Dharwad",
    season: "Kharif",
    soil_type: "Clay",
    ph: 7.3,
    nitrogen: 215,
    phosphorus: 34,
    potassium: 182,
    rainfall_mm: 860,
    temperature_avg: 28,
    crop: "Cotton",
    yield_kg_hectare: 1600
  },
  {
    state: "Maharashtra",
    district: "Nashik",
    season: "Kharif",
    soil_type: "Loamy",
    ph: 7.1,
    nitrogen: 200,
    phosphorus: 31,
    potassium: 175,
    rainfall_mm: 800,
    temperature_avg: 27,
    crop: "Sugarcane",
    yield_kg_hectare: 8000
  }
];

module.exports = cropDataset;
