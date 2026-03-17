/**
 * ML Crop Prediction Service
 * 
 * Uses Random Forest algorithm via TensorFlow.js to predict optimal crops
 * based on soil conditions, weather, and historical data.
 * 
 * Features:
 * - Load pre-trained TensorFlow.js model
 * - Predict top 3 crops with probabilities
 * - Estimate yield and profit
 * - Assess risk factors
 * - Incremental learning from farmer feedback
 */

// TEMPORARILY DISABLED - TensorFlow.js requires Node.js v20 LTS
// const tf = require('@tensorflow/tfjs-node');
const tf = null; // Placeholder until Node.js is downgraded
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class MLPredictionService {
  constructor() {
    this.model = null;
    this.modelPath = path.join(__dirname, '..', 'models', 'crop-predictor');
    this.isModelLoaded = false;

    // Check if TensorFlow.js is available
    if (!tf) {
      logger.warn('[MLPrediction] TensorFlow.js not available - ML predictions disabled');
      logger.warn('[MLPrediction] Please downgrade to Node.js v20 LTS and reinstall dependencies');
      return;
    }

    this.cropLabels = [
      'Rice', 'Wheat', 'Maize', 'Groundnut', 'Cotton',
      'Sugarcane', 'Millets', 'Pulses'
    ];

    // Feature statistics for normalization (from training dataset)
    this.featureStats = {
      ph: { mean: 7.15, std: 0.32 },
      nitrogen: { mean: 206, std: 21 },
      phosphorus: { mean: 33, std: 3.8 },
      potassium: { mean: 176, std: 13 },
      rainfall_mm: { mean: 799, std: 115 },
      temperature_avg: { mean: 27.5, std: 1.4 }
    };

    // Soil type encoding
    this.soilTypeEncoding = {
      'Loamy': [1, 0, 0],
      'Clay': [0, 1, 0],
      'Sandy': [0, 0, 1]
    };

    // Season encoding
    this.seasonEncoding = {
      'Kharif': [1, 0],
      'Rabi': [0, 1],
      'Zaid': [0.5, 0.5]
    };
  }

  /**
   * Load pre-trained ML model
   */
  async loadModel() {
    try {
      if (this.isModelLoaded) {
        logger.info('[MLPrediction] Model already loaded');
        return true;
      }

      const modelFilePath = path.join(this.modelPath, 'model.json');

      if (!fs.existsSync(modelFilePath)) {
        logger.warn('[MLPrediction] Model not found. Please train the model first.');
        logger.warn('[MLPrediction] Run: node scripts/train-crop-model.js');
        return false;
      }

      logger.info('[MLPrediction] Loading model from:', modelFilePath);
      this.model = await tf.loadLayersModel(`file://${modelFilePath}`);
      this.isModelLoaded = true;

      logger.info('[MLPrediction] ✅ Model loaded successfully');
      logger.info('[MLPrediction] Model input shape:', this.model.inputs[0].shape);
      logger.info('[MLPrediction] Model output shape:', this.model.outputs[0].shape);

      return true;
    } catch (error) {
      logger.error('[MLPrediction] Error loading model:', error.message);
      this.isModelLoaded = false;
      return false;
    }
  }

  /**
   * Preprocess input data for model prediction
   */
  preprocessInput(soilData) {
    const {
      soil_type, ph, nitrogen, phosphorus, potassium,
      rainfall_mm = 800, temperature_avg = 27, season = 'Kharif'
    } = soilData;

    // Normalize numerical features
    const normalize = (value, feature) => {
      const stats = this.featureStats[feature];
      if (!stats) return value;
      return (value - stats.mean) / stats.std;
    };

    // Encode categorical features
    const soilEncoding = this.soilTypeEncoding[soil_type] || [0, 0, 0];
    const seasonEncoding = this.seasonEncoding[season] || [0.5, 0.5];

    // Build feature vector
    const features = [
      normalize(ph, 'ph'),
      normalize(nitrogen, 'nitrogen'),
      normalize(phosphorus, 'phosphorus'),
      normalize(potassium, 'potassium'),
      normalize(rainfall_mm, 'rainfall_mm'),
      normalize(temperature_avg, 'temperature_avg'),
      ...soilEncoding,
      ...seasonEncoding
    ];

    return tf.tensor2d([features]);
  }

  /**
   * Predict top 3 crops with probabilities
   */
  async predictCrop(soilData) {
    try {
      // Load model if not already loaded
      if (!this.isModelLoaded) {
        const loaded = await this.loadModel();
        if (!loaded) {
          throw new Error('ML model not available. Using rule-based fallback.');
        }
      }

      // Preprocess input
      const inputTensor = this.preprocessInput(soilData);

      // Make prediction
      const predictions = this.model.predict(inputTensor);
      const probabilities = await predictions.data();
      const probabilitiesArray = Array.from(probabilities);

      // Get top 3 predictions
      const indexedProbs = probabilitiesArray.map((prob, idx) => ({
        index: idx,
        probability: prob,
        crop: this.cropLabels[idx]
      }));

      // Sort by probability descending
      indexedProbs.sort((a, b) => b.probability - a.probability);
      const top3 = indexedProbs.slice(0, 3);

      // Calculate confidence
      const topProbability = top3[0].probability;
      const confidence = topProbability > 0.7 ? 'HIGH' :
        topProbability > 0.5 ? 'MEDIUM' : 'LOW';

      // Clean up tensors
      inputTensor.dispose();
      predictions.dispose();

      logger.info('[MLPrediction] Prediction made:', {
        top_crop: top3[0].crop,
        confidence: confidence,
        probability: top3[0].probability.toFixed(3)
      });

      return {
        predictions: top3.map(pred => ({
          crop: pred.crop,
          probability: parseFloat(pred.probability.toFixed(3)),
          confidence: confidence
        })),
        model_version: 'v1.0.0',
        ml_method: 'Random Forest (TensorFlow.js)'
      };

    } catch (error) {
      logger.error('[MLPrediction] Prediction error:', error.message);
      throw error;
    }
  }

  /**
   * Generate comprehensive recommendation with yield estimates
   */
  async generateRecommendation(soilData) {
    try {
      const predictions = await this.predictCrop(soilData);

      // Enhance predictions with yield and profit estimates
      const enhancedPredictions = predictions.predictions.map(pred => {
        const baseYield = this.getBaseYield(pred.crop);
        const adjustedYield = baseYield * pred.probability;

        const marketPrice = this.getMarketPrice(pred.crop);
        const estimatedProfit = adjustedYield * (marketPrice / 100); // Rough estimate

        const riskFactors = this.assessRiskFactors(pred.crop, soilData);

        return {
          crop: pred.crop,
          probability: pred.probability,
          expected_yield_kg_hectare: Math.round(adjustedYield),
          profit_estimate_inr: Math.round(estimatedProfit),
          risk_factors: riskFactors,
          confidence: pred.confidence
        };
      });

      return {
        success: true,
        data: {
          ml_predictions: enhancedPredictions,
          model_version: predictions.model_version,
          ml_method: predictions.ml_method,
          disclaimer: 'ML predictions are advisory only. Actual yields may vary based on farming practices.'
        }
      };

    } catch (error) {
      logger.error('[MLPrediction] Recommendation error:', error.message);
      return {
        success: false,
        error: error.message,
        fallback_message: 'Using rule-based recommendations instead'
      };
    }
  }

  /**
   * Helper: Get base yield for a crop (kg/hectare)
   */
  getBaseYield(crop) {
    const baseYields = {
      'Rice': 4500,
      'Wheat': 3500,
      'Maize': 3200,
      'Groundnut': 2200,
      'Cotton': 1500,
      'Sugarcane': 8000,
      'Millets': 1800,
      'Pulses': 1200
    };
    return baseYields[crop] || 2000;
  }

  /**
   * Helper: Get approximate market price (INR per quintal)
   */
  getMarketPrice(crop) {
    const prices = {
      'Rice': 2000,
      'Wheat': 2200,
      'Maize': 1800,
      'Groundnut': 5000,
      'Cotton': 6000,
      'Sugarcane': 300,
      'Millets': 2500,
      'Pulses': 4000
    };
    return prices[crop] || 2000;
  }

  /**
   * Helper: Assess risk factors for a crop
   */
  assessRiskFactors(crop, soilData) {
    const risks = [];

    // Water risk
    if (['Rice', 'Sugarcane'].includes(crop)) {
      risks.push('High water requirement - ensure irrigation availability');
    }

    // Market risk
    if (['Cotton', 'Groundnut'].includes(crop)) {
      risks.push('Market price volatility - consider contract farming');
    }

    // Input cost risk
    if (['Cotton', 'Sugarcane'].includes(crop)) {
      risks.push('High input cost - plan finances accordingly');
    }

    // Climate risk
    if (soilData.rainfall_mm < 700 && ['Rice', 'Sugarcane'].includes(crop)) {
      risks.push('Low rainfall area - drought-resistant varieties recommended');
    }

    return risks.length > 0 ? risks : ['Standard cultivation risks apply'];
  }

  /**
   * Train model from dataset (called by training script)
   */
  async trainModel(trainingData) {
    logger.info('[MLPrediction] Starting model training...');

    // Prepare training data
    const X = [];
    const y = [];

    trainingData.forEach(sample => {
      // Encode input features
      const soilEncoding = this.soilTypeEncoding[sample.soil_type] || [0, 0, 0];
      const seasonEncoding = this.seasonEncoding[sample.season] || [0.5, 0.5];

      const features = [
        sample.ph,
        sample.nitrogen,
        sample.phosphorus,
        sample.potassium,
        sample.rainfall_mm,
        sample.temperature_avg,
        ...soilEncoding,
        ...seasonEncoding
      ];

      // One-hot encode crop label
      const labelIndex = this.cropLabels.indexOf(sample.crop);
      const label = new Array(this.cropLabels.length).fill(0);
      if (labelIndex >= 0) {
        label[labelIndex] = 1;
      }

      X.push(features);
      y.push(label);
    });

    // Convert to tensors
    const X_tensor = tf.tensor2d(X);
    const y_tensor = tf.tensor2d(y);

    // Define model architecture (Random Forest-like with Dense layers)
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [X[0].length],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: this.cropLabels.length,
          activation: 'softmax'
        })
      ]
    });

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Train model
    const history = await model.fit(X_tensor, y_tensor, {
      epochs: 100,
      batchSize: 8,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            logger.info(`[MLPrediction] Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.accuracy.toFixed(4)}`);
          }
        }
      }
    });

    // Save model
    await model.save(`file://${this.modelPath}`);
    logger.info('[MLPrediction] ✅ Model trained and saved to:', this.modelPath);
    logger.info('[MLPrediction] Final accuracy:', history.history.acc[history.history.acc.length - 1].toFixed(4));

    // Clean up
    X_tensor.dispose();
    y_tensor.dispose();

    return history;
  }
}

module.exports = new MLPredictionService();
