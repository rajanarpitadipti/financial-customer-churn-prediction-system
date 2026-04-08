import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import verifyToken from '../middleware/auth.middleware.js';
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
router.post('/admin/upload-dataset', verifyToken, isAdmin, upload.single('file'), adminUploadDataset);
router.post('/admin/train-model', verifyToken, isAdmin, adminTrainModel);
router.post('/admin/batch-predict', verifyToken, isAdmin, adminBatchPredict);
router.post('/admin/prediction-summary', verifyToken, isAdmin, adminPredictionSummary);
router.get('/admin/status', verifyToken, isAdmin, adminModelStatus);

// BANK ROUTES
router.post('/prediction/single', verifyToken, bankSinglePredict);
router.post('/prediction/upload-csv', verifyToken, upload.single('file'), bankBatchPredict);
router.get('/prediction/history', verifyToken, bankPredictionHistory);

export default router;
