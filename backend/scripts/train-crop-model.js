/**
 * Crop Prediction Model Training Script
 * 
 * This script trains a Random Forest-like model using TensorFlow.js
 * on Indian agricultural dataset for crop recommendation.
 * 
 * Usage:
 *   node scripts/train-crop-model.js
 */

const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');
const mlService = require('../services/mlCropPrediction');
const cropDataset = require('../data/cropDataset');

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     🌱 SOIL2CROP - ML CROP PREDICTION MODEL TRAINING    ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

async function trainModel() {
  try {
    console.log('📊 Dataset Information:');
    console.log(`   Total samples: ${cropDataset.length}`);
    console.log(`   Features: soil_type, ph, nitrogen, phosphorus, potassium, rainfall, temperature, season`);
    console.log(`   Classes: ${mlService.cropLabels.join(', ')}\n`);

    // Validate dataset size
    if (cropDataset.length < 10) {
      throw new Error('Dataset too small. Need at least 10 samples for training.');
    }

    console.log('🔄 Preprocessing data...');
    
    // Shuffle dataset
    const shuffled = [...cropDataset].sort(() => Math.random() - 0.5);
    
    // Split into train/test (80/20)
    const splitIndex = Math.floor(shuffled.length * 0.8);
    const trainData = shuffled.slice(0, splitIndex);
    const testData = shuffled.slice(splitIndex);

    console.log(`   Training samples: ${trainData.length}`);
    console.log(`   Test samples: ${testData.length}\n`);

    console.log('🧠 Starting model training...\n');

    // Train the model
    const startTime = Date.now();
    const history = await mlService.trainModel(trainData);
    const trainingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Training completed!\n');

    // Evaluate on test set
    console.log('📈 Evaluating model performance...');
    
    let correctPredictions = 0;
    const predictions = [];

    for (const sample of testData) {
      const prediction = await mlService.predictCrop({
        soil_type: sample.soil_type,
        ph: sample.ph,
        nitrogen: sample.nitrogen,
        phosphorus: sample.phosphorus,
        potassium: sample.potassium,
        rainfall_mm: sample.rainfall_mm,
        temperature_avg: sample.temperature_avg,
        season: sample.season
      });

      const predictedCrop = prediction.predictions[0].crop;
      const actualCrop = sample.crop;
      
      const isCorrect = predictedCrop === actualCrop;
      if (isCorrect) correctPredictions++;

      predictions.push({
        actual: actualCrop,
        predicted: predictedCrop,
        confidence: prediction.predictions[0].probability,
        correct: isCorrect
      });
    }

    const accuracy = correctPredictions / testData.length;
    console.log(`   Test Accuracy: ${(accuracy * 100).toFixed(2)}%`);
    console.log(`   Correct predictions: ${correctPredictions}/${testData.length}\n`);

    // Show detailed predictions
    console.log('📋 Test Predictions:');
    predictions.forEach((pred, idx) => {
      const icon = pred.correct ? '✅' : '❌';
      console.log(`   ${idx + 1}. ${icon} Actual: ${pred.actual}, Predicted: ${pred.predicted} (${(pred.confidence * 100).toFixed(1)}%)`);
    });

    console.log('\n💾 Model saved to: backend/models/crop-predictor/\n');

    // Create model info file
    const modelInfoPath = path.join(__dirname, '..', 'models', 'crop-predictor', 'model-info.json');
    const modelInfoDir = path.dirname(modelInfoPath);
    
    if (!fs.existsSync(modelInfoDir)) {
      fs.mkdirSync(modelInfoDir, { recursive: true });
    }

    const modelInfo = {
      version: 'v1.0.0',
      trained_at: new Date().toISOString(),
      training_samples: trainData.length,
      test_samples: testData.length,
      test_accuracy: parseFloat((accuracy * 100).toFixed(2)),
      training_time_seconds: parseFloat(trainingTime),
      architecture: 'Dense Neural Network (Random Forest-like)',
      features: [
        'ph', 'nitrogen', 'phosphorus', 'potassium', 
        'rainfall_mm', 'temperature_avg', 'soil_type', 'season'
      ],
      classes: mlService.cropLabels,
      final_training_accuracy: parseFloat(history.history.acc[history.history.acc.length - 1].toFixed(4)),
      final_training_loss: parseFloat(history.history.loss[history.history.loss.length - 1].toFixed(4))
    };

    fs.writeFileSync(modelInfoPath, JSON.stringify(modelInfo, null, 2));
    console.log('📄 Model info saved to:', modelInfoPath);

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ TRAINING COMPLETE                   ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log(`   Model Version: ${modelInfo.version}`);
    console.log(`   Test Accuracy: ${modelInfo.test_accuracy}%`);
    console.log(`   Training Time: ${trainingTime}s`);
    console.log(`   Classes: ${modelInfo.classes.length} crops\n`);

    console.log('🎯 Next Steps:');
    console.log('   1. Test the model with real soil data');
    console.log('   2. Integrate into /api/soil2crop endpoint');
    console.log('   3. Collect farmer feedback for continuous learning\n');

    return modelInfo;

  } catch (error) {
    console.error('\n❌ Training failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run training
trainModel().catch(console.error);
