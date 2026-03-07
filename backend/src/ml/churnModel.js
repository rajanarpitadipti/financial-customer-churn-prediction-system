import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateTrainingData } from './trainData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let model = null;
let normData = null; // will store { min, max } for input scaling

//  NORMALIZATION 
const normalize = (features, minVals, maxVals) => {
  return features.map((val, i) => {
    if (maxVals[i] - minVals[i] === 0) return 0;
    return (val - minVals[i]) / (maxVals[i] - minVals[i]);
  });
};

//  SYNTHETIC TRAINING (fallback) 
export const trainModel = async () => {
  console.log('🔄 Training churn prediction model with synthetic data...');

  const dataset = generateTrainingData();
  const rawFeatures = dataset.map(d => d.features);
  const labels = dataset.map(d => d.label);

  // Compute min/max from synthetic data
  const numFeatures = rawFeatures[0].length;
  const minVals = new Array(numFeatures).fill(Infinity);
  const maxVals = new Array(numFeatures).fill(-Infinity);
  rawFeatures.forEach(f => {
    f.forEach((val, i) => {
      if (val < minVals[i]) minVals[i] = val;
      if (val > maxVals[i]) maxVals[i] = val;
    });
  });

  const xs = rawFeatures.map(f => normalize(f, minVals, maxVals));
  const ys = labels;

  const inputTensor = tf.tensor2d(xs, [xs.length, numFeatures]);
  const labelTensor = tf.tensor2d(ys, [ys.length, 1]);

  model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [numFeatures],
    units: 1,
    activation: 'sigmoid',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  await model.fit(inputTensor, labelTensor, {
    epochs: 50,
    batchSize: 32,
    validationSplit: 0.2,
    verbose: 0
  });

  console.log('✅ Model trained with synthetic data!');
  return { model, normData: { min: minVals, max: maxVals } };
};

//  TRAIN WITH REAL DATA (provided as arrays) 
export const trainWithRealData = async (featuresArray, labelsArray) => {
  console.log('🔄 Training model with real data...');

  const numFeatures = featuresArray[0].length;
  const minVals = new Array(numFeatures).fill(Infinity);
  const maxVals = new Array(numFeatures).fill(-Infinity);

  featuresArray.forEach(f => {
    f.forEach((val, i) => {
      if (val < minVals[i]) minVals[i] = val;
      if (val > maxVals[i]) maxVals[i] = val;
    });
  });

  const xs = featuresArray.map(f => normalize(f, minVals, maxVals));
  const ys = labelsArray;

  const inputTensor = tf.tensor2d(xs, [xs.length, numFeatures]);
  const labelTensor = tf.tensor2d(ys, [ys.length, 1]);

  model = tf.sequential();
  model.add(tf.layers.dense({
    inputShape: [numFeatures],
    units: 1,
    activation: 'sigmoid',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }));

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });

  await model.fit(inputTensor, labelTensor, {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    verbose: 0
  });

  console.log('✅ Model trained with real data!');
  normData = { min: minVals, max: maxVals };
  return model;
};

//  LOAD SAVED MODEL (manual JSON) 
export const loadModel = async () => {
  const saveDir = path.join(__dirname, '../saved_model');
  const modelJsonPath = path.join(saveDir, 'model.json');
  const weightsPath = path.join(saveDir, 'weights.json');
  const normPath = path.join(saveDir, 'normalization.json');

  if (fs.existsSync(modelJsonPath) && fs.existsSync(weightsPath) && fs.existsSync(normPath)) {
    try {
      console.log('📂 Loading saved model from disk...');
      // 1. Read model architecture JSON (handle double-encoded JSON)
      let modelJSON = fs.readFileSync(modelJsonPath, 'utf8');
      if (typeof modelJSON === 'string') {
        try {
          modelJSON = JSON.parse(modelJSON);
        } catch (e) {
          // Already parsed
        }
      }
      if (typeof modelJSON === 'string') {
        modelJSON = JSON.parse(modelJSON);
      }
      // Defensive: check for config.layers
      if (!modelJSON.config || !Array.isArray(modelJSON.config.layers) || !modelJSON.config.layers[0]) {
        throw new Error('Invalid model.json: missing config.layers');
      }
      // 2. Recreate the model using tf.sequential() and add layers from config
      const model = tf.sequential();
      const layerConfig = modelJSON.config.layers[0].config;
      model.add(tf.layers.dense({
        units: layerConfig.units,
        activation: layerConfig.activation,
        inputShape: layerConfig.batch_input_shape.slice(1),
        kernelRegularizer: tf.regularizers.l2({ l2: layerConfig.kernel_regularizer?.config?.l2 || 0.001 })
      }));
      // 3. Compile the model (must compile before setting weights)
      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
      // 4. Read weights and set them
      const weightsData = JSON.parse(fs.readFileSync(weightsPath, 'utf8'));
      const weightTensors = weightsData.map(w => tf.tensor(w));
      model.setWeights(weightTensors);
      // 5. Load normalization parameters
      const normData = JSON.parse(fs.readFileSync(normPath, 'utf8'));
      console.log('✅ Model loaded successfully.');
      return { model, normData };
    } catch (error) {
      console.error('❌ Failed to load saved model:', error);
      return null;
    }
  } else {
    console.log('ℹ️ No saved model found – will train on synthetic data when needed.');
    return null;
  }
};
//  PREDICT CHURN 
export const predictChurn = async (customerFeatures) => {
  // Ensure model is loaded (or fallback to synthetic training)
  if (!model) {
    const loaded = await loadModel();
    if (loaded) {
      model = loaded.model;
      normData = loaded.normData;
    } else {
      // No saved model, train synthetic one
      const trained = await trainModel();
      model = trained.model;
      normData = trained.normData;
    }
  }

  // Normalize input features using stored min/max
  const normalized = normalize(customerFeatures, normData.min, normData.max);
  const input = tf.tensor2d([normalized], [1, normalized.length]);
  const prediction = model.predict(input);
  const probability = (await prediction.data())[0];
  return probability;
};

//  RISK LEVEL 
export const getRiskLevel = (probability) => {
  if (probability < 0.3) return 'Low';
  if (probability < 0.6) return 'Medium';
  return 'High';
};

//  INIT MODEL (optional, can be called at server start) 
export const initModel = async () => {
  const loaded = await loadModel();
  if (loaded) {
    model = loaded.model;
    normData = loaded.normData;
  } else {
    console.log('🔄 No saved model – training synthetic model on startup...');
    const trained = await trainModel();
    model = trained.model;
    normData = trained.normData;
  }
  return { model, normData };
};