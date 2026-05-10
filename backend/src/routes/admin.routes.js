import express from "express";
import { approveUser, getAnalytics, getLogs } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";

// ✅ 1. Create router instance
const router = express.Router();

// ✅ 2. Define routes
router.patch("/approve/:userId", protect, isAdmin, approveUser);
router.get("/analytics", protect, isAdmin, getAnalytics);
router.get("/logs", protect, isAdmin, getLogs);

// Add any other admin routes here
// router.get("/dashboard", protect, isAdmin, adminDashboard);

// ✅ 3. Export router
export default router;
