import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadAndPreprocessData = (csvPath) => {
  // Read CSV file (you can use a library like `csv-parser` or `papaparse`)
  // For simplicity, assume we have a function that returns parsed data
  const rawData = parseCSV(csvPath); // implement or use a library

  // Example preprocessing steps:
  const processed = rawData.map(row => ({
    // Select and transform features
    tenure: Number(row.tenure),
    monthlyCharges: Number(row.monthlyCharges),
    totalCharges: Number(row.totalCharges) || 0,
    contract: row.contract === 'Month-to-month' ? 0 : (row.contract === 'One year' ? 1 : 2),
    // ... map other categoricals to numbers
    churn: row.Churn === 'Yes' ? 1 : 0
  }));

  // Separate features and labels
  const features = processed.map(d => [
    d.tenure, d.monthlyCharges, d.totalCharges, d.contract
    // add other feature columns
  ]);
  const labels = processed.map(d => d.churn);

  return { features, labels };
};