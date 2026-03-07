import express from 'express';
import multer from 'multer';
import verifyToken from '../middleware/auth.middleware.js';
import isAdmin from '../middleware/admin.middleware.js';
import {
  adminUploadDataset,
  adminTrainModel,
  adminBatchPredict,
  adminPredictionSummary,
  bankSinglePredict,
  bankBatchPredict
} from '../controllers/ml.controller.js';

const router = express.Router();
const upload = multer({ dest: '../../backend/data' });

// ADMIN ROUTES
router.post('/admin/upload-dataset', verifyToken, isAdmin, upload.single('file'), adminUploadDataset);
router.post('/admin/train-model', verifyToken, isAdmin, adminTrainModel);
router.post('/admin/batch-predict', verifyToken, isAdmin, adminBatchPredict);
router.post('/admin/prediction-summary', verifyToken, isAdmin, adminPredictionSummary);

// BANK ROUTES
router.post('/prediction/single', verifyToken, bankSinglePredict);
router.post('/prediction/upload-csv', verifyToken, upload.single('file'), bankBatchPredict);

export default router;
