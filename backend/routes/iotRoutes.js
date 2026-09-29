const express = require("express");
const router = express.Router();

// In-memory sensor data store (fallback when no hardware connected)
let sensorData = {
  temperature: 28,
  humidity: 65,
  soil_moisture: 45,
  ph: 6.5,
  nitrogen: 120,
  pump: "OFF"
};

/**
 * GET /api/iot/sensor-data/:farmer_id
 * Get current sensor data for a farmer
 */
router.get("/sensor-data/:farmer_id", (req, res) => {
  console.log(`[IoT] Fetching sensor data for farmer: ${req.params.farmer_id}`);
  
  res.json({
    success: true,
    data: sensorData,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/iot/sensor-data
 * Update sensor data (from physical sensors or simulation)
 */
router.post("/sensor-data", (req, res) => {
  const { farmer_id, temperature, humidity, soil_moisture, ph, nitrogen, pump } = req.body;
  
  // Update sensor data
  if (temperature !== undefined) sensorData.temperature = temperature;
  if (humidity !== undefined) sensorData.humidity = humidity;
  if (soil_moisture !== undefined) sensorData.soil_moisture = soil_moisture;
  if (ph !== undefined) sensorData.ph = ph;
  if (nitrogen !== undefined) sensorData.nitrogen = nitrogen;
  if (pump !== undefined) sensorData.pump = pump;
  
  // Auto-control pump based on soil moisture
  if (sensorData.soil_moisture < 35 && sensorData.pump === "OFF") {
    sensorData.pump = "ON";
    console.log("[IoT] Auto-turning ON pump due to low moisture");
  } else if (sensorData.soil_moisture >= 60 && sensorData.pump === "ON") {
    sensorData.pump = "OFF";
    console.log("[IoT] Auto-turning OFF pump due to sufficient moisture");
  }
  
  console.log("[IoT] Sensor data updated:", sensorData);
  
  res.json({
    success: true,
    message: "Sensor data saved successfully",
    data: sensorData,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/iot/sensor-history/:farmer_id
 * Get historical sensor data (mock implementation)
 */
router.get("/sensor-history/:farmer_id", (req, res) => {
  // Generate mock historical data
  const history = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
    history.push({
      timestamp: time.toISOString(),
      temperature: Math.round((sensorData.temperature + (Math.random() * 4 - 2)) * 10) / 10,
      humidity: Math.round((sensorData.humidity + (Math.random() * 6 - 3)) * 10) / 10,
      soil_moisture: Math.round((sensorData.soil_moisture + (Math.random() * 4 - 2)) * 10) / 10,
      ph: Math.round((sensorData.ph + (Math.random() * 0.2 - 0.1)) * 10) / 10
    });
  }
  
  res.json({
    success: true,
    data: history.reverse(),
    count: history.length
  });
});

module.exports = router;
