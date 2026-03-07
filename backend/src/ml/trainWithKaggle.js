import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import * as tf from '@tensorflow/tfjs';
import { trainWithRealData } from './churnModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, '../../data/Customer-Churn-Records.csv');

// Helper to parse CSV
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Encoding helpers (same as before)
const encodeGeography = (geo) => {
  const map = { France: 0, Spain: 1, Germany: 2 };
  return map[geo] !== undefined ? map[geo] : 0;
};
const encodeGender = (gender) => (gender === 'Male' ? 1 : 0);
const encodeCardType = (card) => {
  const map = { SILVER: 0, GOLD: 1, PLATINUM: 2, DIAMOND: 3 };
  return map[card] !== undefined ? map[card] : 0;
};

// Preprocess (same as before – you can adjust features)
const preprocessData = (rawData) => {
  const features = [];
  const labels = [];
  rawData.forEach((row) => {
    if (!row.Exited) return;
    const creditScore = parseFloat(row.CreditScore) || 0;
    const age = parseFloat(row.Age) || 0;
    const tenure = parseFloat(row.Tenure) || 0;
    const balance = parseFloat(row.Balance) || 0;
    const numOfProducts = parseFloat(row.NumOfProducts) || 0;
    const hasCrCard = parseFloat(row.HasCrCard) || 0;
    const isActiveMember = parseFloat(row.IsActiveMember) || 0;
    const estimatedSalary = parseFloat(row.EstimatedSalary) || 0;
    const complain = parseFloat(row.Complain) || 0;
    const satisfactionScore = parseFloat(row['Satisfaction Score']) || 0;
    const pointEarned = parseFloat(row['Point Earned']) || 0;
    const geographyCode = encodeGeography(row.Geography);
    const genderCode = encodeGender(row.Gender);
    const cardTypeCode = encodeCardType(row['Card Type']);

    const featureVec = [
      creditScore, age, tenure, balance, numOfProducts, hasCrCard,
      isActiveMember, estimatedSalary, complain, satisfactionScore,
      pointEarned, geographyCode, genderCode, cardTypeCode,
    ];
    const label = parseInt(row.Exited, 10) === 1 ? 1 : 0;
    features.push(featureVec);
    labels.push(label);
  });
  return { features, labels };
};

(async () => {
  try {
    console.log('📂 Loading CSV from:', CSV_PATH);
    const rawData = await parseCSV(CSV_PATH);
    console.log(`✅ Loaded ${rawData.length} rows.`);

    console.log('🔄 Preprocessing data...');
    const { features, labels } = preprocessData(rawData);
    console.log(`✅ Preprocessed ${features.length} samples.`);

    // Train model
    const model = await trainWithRealData(features, labels);

    // ---------- MANUAL SAVE (no tfjs-node) ----------
    const saveDir = path.join(__dirname, '../saved_model');
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    // 1. Save model architecture
    const modelJSON = model.toJSON();
    fs.writeFileSync(path.join(saveDir, 'model.json'), JSON.stringify(modelJSON, null, 2));

    // 2. Save weights as an array
    const weights = model.getWeights().map(w => w.arraySync());
    fs.writeFileSync(path.join(saveDir, 'weights.json'), JSON.stringify(weights, null, 2));

    // 3. Save normalization parameters
    const numFeatures = features[0].length;
    const minVals = new Array(numFeatures).fill(Infinity);
    const maxVals = new Array(numFeatures).fill(-Infinity);
    features.forEach(f => {
      f.forEach((val, i) => {
        if (val < minVals[i]) minVals[i] = val;
        if (val > maxVals[i]) maxVals[i] = val;
      });
    });
    const normData = { min: minVals, max: maxVals };
    fs.writeFileSync(path.join(saveDir, 'normalization.json'), JSON.stringify(normData, null, 2));

    console.log(`✅ Model saved manually to ${saveDir}`);
  } catch (error) {
    console.error('❌ Training failed:', error);
  }
})();