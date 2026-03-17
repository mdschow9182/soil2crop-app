#!/usr/bin/env python3
"""
Disease Detection Model Training Script
========================================

This script trains a CNN-based crop disease detection model using transfer learning
with MobileNetV2 (pre-trained on ImageNet) and fine-tunes it on agricultural disease data.

Requirements:
- TensorFlow 2.15.0+
- TensorFlow I/O (for image loading)
- NumPy
- Pandas (optional, for dataset management)

Dataset Format:
Organize your dataset in the following structure:

data/
├── train/
│   ├── healthy/
│   ├── nitrogen_deficiency/
│   ├── rice_blast/
│   └── ... (10 classes total)
├── validation/
│   ├── healthy/
│   └── ... (same classes as train)
└── test/
    ├── healthy/
    └── ... (same classes as train)

Each class folder should contain images of that specific disease.

Usage:
------
python train_disease_model.py

Output:
-------
- backend/models/disease-detector/model.json (TF.js format)
- backend/models/disease-detector/group1-shard*.bin (weights)
- models/disease_model.h5 (Keras format)
- training_history.csv (training metrics)
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import tensorflowjs as tfjs
from datetime import datetime

# Configuration
class Config:
    # Dataset paths
    TRAIN_DIR = 'data/train'
    VAL_DIR = 'data/validation'
    TEST_DIR = 'data/test'
    
    # Model parameters
    IMG_SIZE = 224  # MobileNetV2 input size
    BATCH_SIZE = 32
    NUM_CLASSES = 10
    
    # Disease classes (must match folder names)
    CLASS_NAMES = [
        'healthy',
        'nitrogen_deficiency',
        'rice_blast',
        'rice_brown_spot',
        'rice_bacterial_blight',
        'rice_sheath_blight',
        'wheat_rust',
        'wheat_powdery_mildew',
        'tomato_early_blight',
        'tomato_late_blight'
    ]
    
    # Training parameters
    EPOCHS = 50
    LEARNING_RATE = 0.001
    DROPOUT_RATE = 0.5
    
    # Output paths
    OUTPUT_DIR = 'backend/models/disease-detector'
    KERAS_MODEL_PATH = 'models/disease_model.h5'
    HISTORY_CSV_PATH = 'training_history.csv'


def create_data_generators():
    """
    Create data generators for training, validation, and test sets
    with augmentation for training data
    """
    print("\n" + "="*60)
    print("Creating Data Generators")
    print("="*60)
    
    # Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='nearest'
    )
    
    # Only rescaling for validation and test
    val_datagen = ImageDataGenerator(rescale=1./255)
    test_datagen = ImageDataGenerator(rescale=1./255)
    
    # Load datasets
    print(f"\nLoading training data from: {Config.TRAIN_DIR}")
    train_generator = train_datagen.flow_from_directory(
        Config.TRAIN_DIR,
        target_size=(Config.IMG_SIZE, Config.IMG_SIZE),
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        classes=Config.CLASS_NAMES,
        shuffle=True
    )
    
    print(f"Loading validation data from: {Config.VAL_DIR}")
    val_generator = val_datagen.flow_from_directory(
        Config.VAL_DIR,
        target_size=(Config.IMG_SIZE, Config.IMG_SIZE),
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        classes=Config.CLASS_NAMES,
        shuffle=False
    )
    
    print(f"Loading test data from: {Config.TEST_DIR}")
    test_generator = test_datagen.flow_from_directory(
        Config.TEST_DIR,
        target_size=(Config.IMG_SIZE, Config.IMG_SIZE),
        batch_size=Config.BATCH_SIZE,
        class_mode='categorical',
        classes=Config.CLASS_NAMES,
        shuffle=False
    )
    
    # Print dataset info
    print(f"\n✓ Training samples: {train_generator.samples}")
    print(f"✓ Validation samples: {val_generator.samples}")
    print(f"✓ Test samples: {test_generator.samples}")
    print(f"✓ Image size: {Config.IMG_SIZE}x{Config.IMG_SIZE}")
    print(f"✓ Batch size: {Config.BATCH_SIZE}")
    print(f"✓ Number of classes: {Config.NUM_CLASSES}")
    
    return train_generator, val_generator, test_generator


def build_model():
    """
    Build transfer learning model using MobileNetV2 as base
    """
    print("\n" + "="*60)
    print("Building Model Architecture")
    print("="*60)
    
    # Load pre-trained MobileNetV2 (without top layers)
    print("\nLoading MobileNetV2 base (pre-trained on ImageNet)...")
    base_model = MobileNetV2(
        input_shape=(Config.IMG_SIZE, Config.IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        pooling='avg'  # Global average pooling
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    print(f"✓ Base model layers: {len(base_model.layers)}")
    print(f"✓ Trainable variables in base: {len(base_model.trainable_variables)}")
    
    # Build custom classification head
    print("\nAdding custom classification head...")
    model = Sequential([
        base_model,
        Dropout(rate=Config.DROPOUT_RATE, name='dropout'),
        Dense(128, activation='relu', name='dense_layer'),
        Dropout(rate=0.3, name='dropout_2'),
        Dense(Config.NUM_CLASSES, activation='softmax', name='predictions')
    ])
    
    # Print model summary
    print("\nModel Summary:")
    model.summary()
    
    return model, base_model


def compile_model(model):
    """
    Compile model with optimizer, loss function, and metrics
    """
    print("\n" + "="*60)
    print("Compiling Model")
    print("="*60)
    
    optimizer = Adam(learning_rate=Config.LEARNING_RATE)
    
    model.compile(
        optimizer=optimizer,
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    print(f"✓ Optimizer: Adam (lr={Config.LEARNING_RATE})")
    print(f"✓ Loss: Categorical Crossentropy")
    print(f"✓ Metrics: Accuracy, Precision, Recall")


def setup_callbacks():
    """
    Setup training callbacks for better convergence and model saving
    """
    print("\n" + "="*60)
    print("Setting Up Training Callbacks")
    print("="*60)
    
    # Create output directory
    os.makedirs(Config.OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(Config.KERAS_MODEL_PATH), exist_ok=True)
    
    # Timestamp for unique checkpoints
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    callbacks = [
        # Early stopping
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduce learning rate on plateau
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        
        # Save best model (Keras format)
        ModelCheckpoint(
            filepath=f'models/best_model_{timestamp}.h5',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        )
    ]
    
    print("✓ Early Stopping (patience=10)")
    print("✓ Reduce LR on Plateau (factor=0.5)")
    print("✓ Model Checkpoint (best model saved)")
    
    return callbacks


def train_model(model, train_gen, val_gen, callbacks):
    """
    Train the model with specified parameters
    """
    print("\n" + "="*60)
    print("Starting Model Training")
    print("="*60)
    
    start_time = datetime.now()
    
    history = model.fit(
        train_gen,
        epochs=Config.EPOCHS,
        validation_data=val_gen,
        callbacks=callbacks,
        verbose=1
    )
    
    end_time = datetime.now()
    training_duration = end_time - start_time
    
    print(f"\n✓ Training completed in {training_duration}")
    print(f"✓ Final training accuracy: {history.history['accuracy'][-1]:.4f}")
    print(f"✓ Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")
    
    return history


def evaluate_model(model, test_gen):
    """
    Evaluate model performance on test set
    """
    print("\n" + "="*60)
    print("Evaluating Model on Test Set")
    print("="*60)
    
    results = model.evaluate(test_gen, verbose=1)
    
    print(f"\n{'='*60}")
    print("Test Results:")
    print(f"{'='*60}")
    print(f"✓ Test Loss: {results[0]:.4f}")
    print(f"✓ Test Accuracy: {results[1]:.4f} ({results[1]*100:.2f}%)")
    print(f"✓ Test Precision: {results[2]:.4f}")
    print(f"✓ Test Recall: {results[3]:.4f}")
    
    # Generate predictions for confusion matrix
    print("\nGenerating predictions for analysis...")
    predictions = model.predict(test_gen)
    predicted_classes = np.argmax(predictions, axis=1)
    true_classes = test_gen.classes
    
    # Print class-wise accuracy
    print("\nClass-wise Performance:")
    for i, class_name in enumerate(Config.CLASS_NAMES):
        class_mask = true_classes == i
        if np.sum(class_mask) > 0:
            class_accuracy = np.mean(predicted_classes[class_mask] == i)
            print(f"  • {class_name}: {class_accuracy:.2%} ({np.sum(class_mask)} samples)")
    
    return results


def save_model(model, history):
    """
    Save trained model in both Keras and TensorFlow.js formats
    """
    print("\n" + "="*60)
    print("Saving Trained Model")
    print("="*60)
    
    # Save final model (Keras format)
    print(f"\nSaving Keras model to: {Config.KERAS_MODEL_PATH}")
    model.save(Config.KERAS_MODEL_PATH)
    print("✓ Keras model saved (.h5)")
    
    # Convert to TensorFlow.js format
    print(f"\nConverting to TensorFlow.js format...")
    print(f"Output directory: {Config.OUTPUT_DIR}")
    
    tfjs.converters.save_keras_model(model, Config.OUTPUT_DIR)
    print("✓ TensorFlow.js model saved")
    print(f"  - model.json (architecture + weights manifest)")
    print(f"  - group*-shard*.bin (weight files)")
    
    # Save training history to CSV
    print(f"\nSaving training history to: {Config.HISTORY_CSV_PATH}")
    history_df = tf.keras.preprocessing.sequence.pad_sequences(
        [history.history[k] for k in history.history.keys()], 
        padding='post'
    )
    
    import pandas as pd
    history_dict = {k: v for k, v in zip(history.history.keys(), history_df)}
    df = pd.DataFrame(history_dict)
    df.to_csv(Config.HISTORY_CSV_PATH, index=False)
    print("✓ Training history saved (.csv)")
    
    # Save model info
    model_info = {
        'model_type': 'MobileNetV2 Transfer Learning',
        'input_shape': [Config.IMG_SIZE, Config.IMG_SIZE, 3],
        'num_classes': Config.NUM_CLASSES,
        'classes': Config.CLASS_NAMES,
        'trained_at': datetime.now().isoformat(),
        'epochs_trained': len(history.history['loss']),
        'final_train_accuracy': float(history.history['accuracy'][-1]),
        'final_val_accuracy': float(history.history['val_accuracy'][-1])
    }
    
    import json
    info_path = os.path.join(Config.OUTPUT_DIR, 'model_info.json')
    with open(info_path, 'w') as f:
        json.dump(model_info, f, indent=2)
    print(f"✓ Model info saved to: {info_path}")


def plot_training_history(history):
    """
    Plot and save training curves (requires matplotlib)
    """
    try:
        import matplotlib.pyplot as plt
        
        print("\n" + "="*60)
        print("Generating Training Plots")
        print("="*60)
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Accuracy
        axes[0, 0].plot(history.history['accuracy'], label='Train Acc')
        axes[0, 0].plot(history.history['val_accuracy'], label='Val Acc')
        axes[0, 0].set_title('Model Accuracy')
        axes[0, 0].set_xlabel('Epoch')
        axes[0, 0].set_ylabel('Accuracy')
        axes[0, 0].legend()
        axes[0, 0].grid(True)
        
        # Loss
        axes[0, 1].plot(history.history['loss'], label='Train Loss')
        axes[0, 1].plot(history.history['val_loss'], label='Val Loss')
        axes[0, 1].set_title('Model Loss')
        axes[0, 1].set_xlabel('Epoch')
        axes[0, 1].set_ylabel('Loss')
        axes[0, 1].legend()
        axes[0, 1].grid(True)
        
        # Precision
        axes[1, 0].plot(history.history['precision'], label='Train Prec')
        axes[1, 0].plot(history.history['val_precision'], label='Val Prec')
        axes[1, 0].set_title('Precision')
        axes[1, 0].set_xlabel('Epoch')
        axes[1, 0].set_ylabel('Precision')
        axes[1, 0].legend()
        axes[1, 0].grid(True)
        
        # Recall
        axes[1, 1].plot(history.history['recall'], label='Train Rec')
        axes[1, 1].plot(history.history['val_recall'], label='Val Rec')
        axes[1, 1].set_title('Recall')
        axes[1, 1].set_xlabel('Epoch')
        axes[1, 1].set_ylabel('Recall')
        axes[1, 1].legend()
        axes[1, 1].grid(True)
        
        plt.tight_layout()
        plot_path = 'training_history.png'
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        print(f"✓ Training plots saved to: {plot_path}")
        plt.close()
        
    except ImportError:
        print("\n⚠ Matplotlib not installed. Skipping plot generation.")
        print("  Install with: pip install matplotlib")


def main():
    """
    Main training pipeline
    """
    print("\n" + "="*60)
    print("🌱 Crop Disease Detection Model Training")
    print("="*60)
    print(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"TensorFlow Version: {tf.__version__}")
    print(f"GPU Available: {tf.config.list_physical_devices('GPU') is not None}")
    
    # Step 1: Create data generators
    train_gen, val_gen, test_gen = create_data_generators()
    
    # Step 2: Build model
    model, base_model = build_model()
    
    # Step 3: Compile model
    compile_model(model)
    
    # Step 4: Setup callbacks
    callbacks = setup_callbacks()
    
    # Step 5: Train model (two-phase training)
    print("\n" + "="*60)
    print("PHASE 1: Training with Frozen Base")
    print("="*60)
    print("Training top layers only (base model frozen)...")
    
    history_phase1 = train_model(model, train_gen, val_gen, callbacks)
    
    # Unfreeze some layers for fine-tuning
    print("\n" + "="*60)
    print("PHASE 2: Fine-Tuning")
    print("="*60)
    print("Unfreezing last 50 layers of base model...")
    
    # Unfreeze last N layers of base model
    for layer in base_model.layers[:-50]:
        layer.trainable = False
    for layer in base_model.layers[-50:]:
        layer.trainable = True
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=Config.LEARNING_RATE * 0.1),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
    )
    
    print("Fine-tuning unfrozen layers...")
    history_phase2 = train_model(model, train_gen, val_gen, callbacks)
    
    # Combine histories
    combined_history = type('obj', (object,), {
        'history': {
            k: history_phase1.history.get(k, []) + history_phase2.history.get(k, [])
            for k in set(list(history_phase1.history.keys()) + list(history_phase2.history.keys()))
        }
    })
    
    # Step 6: Evaluate on test set
    test_results = evaluate_model(model, test_gen)
    
    # Step 7: Save model
    save_model(model, combined_history)
    
    # Step 8: Generate plots
    plot_training_history(combined_history)
    
    # Final summary
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETE!")
    print("="*60)
    print(f"Final Test Accuracy: {test_results[1]*100:.2f}%")
    print(f"Model saved to: {Config.OUTPUT_DIR}")
    print(f"\nNext Steps:")
    print("  1. Copy model to: backend/models/disease-detector/")
    print("  2. Test with: node test-disease-detection.js")
    print("  3. Deploy to production")
    print(f"\nEnd Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
