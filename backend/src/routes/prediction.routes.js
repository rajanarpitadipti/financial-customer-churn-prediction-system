import express from 'express';
import { predictSingleChurn} from '../controllers/prediction.controller.js';
import { protect } from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import { uploadAndTrain } from "../controllers/prediction.controller.js";
import { predictionLimiter } from "../middleware/predictionLimiter.js";

const router = express.Router();
router.post("/predict", protect, ); // Protected Route

router.post("/predict", protect, predictionLimiter, ); // // 🔐 Secure + Limited Prediction API

// BANK + ADMIN ROUTE
// POST /api/predictions/single
// Predict churn for one customer
router.post(
  '/single',
  protect,        // must be logged in
  predictSingleChurn  // controller
);



// ADMIN ONLY ROUTE
// GET /api/predictions/churn-distribution
// Used in Admin Dashboard analytics
router.get(
  '/churn-distribution',
  protect,  // must be logged in
  isAdmin,      // must be admin role
  
);

router.post(
  '/upload-train',
  protect,
  isAdmin,
  uploadAndTrain
);

export default router;