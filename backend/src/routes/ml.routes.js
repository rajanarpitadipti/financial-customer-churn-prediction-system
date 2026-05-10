import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from "../middleware/auth.middleware.js";
import isAdmin from '../middleware/admin.middleware.js';
import {
  adminUploadDataset,
  adminTrainModel,
  adminBatchPredict,
  adminPredictionSummary,
  adminModelStatus,
  bankSinglePredict,
  bankBatchPredict,
  bankPredictionHistory
} from '../controllers/ml.controller.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../..');
const upload = multer({ dest: path.join(ROOT_DIR, 'backend', 'uploads') });

// ADMIN ROUTES
router.post('/admin/upload-dataset', protect, isAdmin, upload.single('file'), adminUploadDataset);
router.post('/admin/train-model', protect, isAdmin, adminTrainModel);
router.post('/admin/batch-predict', protect, isAdmin, adminBatchPredict);
router.post('/admin/prediction-summary', protect, isAdmin, adminPredictionSummary);
router.get('/admin/status', protect, isAdmin, adminModelStatus);

// BANK ROUTES
router.post('/prediction/single', protect, bankSinglePredict);
router.post('/prediction/upload-csv', protect, upload.single('file'), bankBatchPredict);
router.get('/prediction/history', protect, bankPredictionHistory);

export default router;
