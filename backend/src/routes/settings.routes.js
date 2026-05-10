import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  getAdminSettings,
  updateProfileSettings,
  changePassword,
  updateSecuritySettings,
  updateSystemSettings,
  updateNotificationSettings,
  logoutAllDevices,
  backupDatabase,
  restoreDatabase,
} from "../controllers/settings.controller.js";
import {
  profileSettingsValidation,
  changePasswordValidation,
  securitySettingsValidation,
  systemSettingsValidation,
  notificationSettingsValidation,
  restoreDatabaseValidation,
} from "../middleware/settings.validation.js";

const router = express.Router();

router.get("/admin", protect, isAdmin, getAdminSettings);
router.patch("/admin/profile", protect, isAdmin, profileSettingsValidation, validateRequest, updateProfileSettings);
router.patch("/admin/security", protect, isAdmin, securitySettingsValidation, validateRequest, updateSecuritySettings);
router.patch("/admin/security/password", protect, isAdmin, changePasswordValidation, validateRequest, changePassword);
router.patch("/admin/system", protect, isAdmin, systemSettingsValidation, validateRequest, updateSystemSettings);
router.patch("/admin/notifications", protect, isAdmin, notificationSettingsValidation, validateRequest, updateNotificationSettings);
router.post("/admin/sessions/logout-all", protect, isAdmin, logoutAllDevices);
router.post("/admin/database/backup", protect, isAdmin, backupDatabase);
router.post("/admin/database/restore", protect, isAdmin, restoreDatabaseValidation, validateRequest, restoreDatabase);

export default router;
