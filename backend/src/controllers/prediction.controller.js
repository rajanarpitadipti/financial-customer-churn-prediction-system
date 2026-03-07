
import { predictChurn, getRiskLevel, initModel } from '../ml/churnModel.js';
import csv from 'csv-parser';
import multer from 'multer';
import { trainWithRealData } from '../ml/churnModel.js';

// Define multer upload instance
const upload = multer({ dest: 'uploads/' });

export const uploadAndTrain = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const features = [];
      const labels = [];
      const fs = await import('fs');
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          // Adjust these keys to match your CSV columns
          features.push([
            Number(row.tenure),
            Number(row.monthlyCharges),
            Number(row.contract),
            Number(row.supportCalls)
          ]);
          labels.push(Number(row.churn));
        })
        .on('end', async () => {
          await trainWithRealData(features, labels);
          fs.unlinkSync(req.file.path); // Clean up
          res.json({ success: true, message: 'Model retrained with uploaded data' });
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
];

// For a single customer prediction
export const predictSingleChurn = async (req, res) => {
  try {
    const { tenure, monthlyCharges, contract, supportCalls } = req.body;
    
    if (!tenure || !monthlyCharges || contract === undefined || supportCalls === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: tenure, monthlyCharges, contract, supportCalls' 
      });
    }

    const features = [tenure, monthlyCharges, contract, supportCalls];
    const probability = await predictChurn(features);
    const riskLevel = getRiskLevel(probability);

    res.json({
      success: true,
      churnProbability: Number(probability.toFixed(4)),
      riskLevel,
      features
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// For batch predictions (return distribution) – ✅ this is what your dashboard uses!
export const getChurnDistribution = async (req, res) => {
  try {
    // Generate 100 random realistic customers
    const customers = [];
    for (let i = 0; i < 100; i++) {
      customers.push({
        tenure: Math.floor(Math.random() * 72) + 1,
        monthlyCharges: Math.floor(Math.random() * 100) + 30,
        contract: Math.random() > 0.5 ? 1 : 0,
        supportCalls: Math.floor(Math.random() * 10)
      });
    }

    let low = 0, medium = 0, high = 0;
    for (const cust of customers) {
      const prob = await predictChurn([cust.tenure, cust.monthlyCharges, cust.contract, cust.supportCalls]);
      const risk = getRiskLevel(prob);
      if (risk === 'Low') low++;
      else if (risk === 'Medium') medium++;
      else high++;
    }

    const distribution = [
      { name: 'Low Risk', value: low },
      { name: 'Medium Risk', value: medium },
      { name: 'High Risk', value: high }
    ];

    res.json({
      success: true,
      distribution,
      summary: {
        total: low + medium + high,
        highRiskPercentage: ((high / (low + medium + high)) * 100).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};