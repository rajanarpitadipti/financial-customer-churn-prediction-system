import { body } from "express-validator";

export const profileSettingsValidation = [
  body("name").optional().isString().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
  body("email").optional().isEmail().withMessage("Valid email required."),
  body("avatarUrl").optional().isString().withMessage("Avatar URL must be valid."),
];

export const changePasswordValidation = [
  body("currentPassword").exists().isString().isLength({ min: 6 }).withMessage("Current password is required."),
  body("newPassword").exists().isString().isLength({ min: 6 }).withMessage("New password must be at least 6 characters."),
];

export const securitySettingsValidation = [
  body("twoFactorEnabled").optional().isBoolean().withMessage("2FA must be a true/false value."),
  body("sessionTimeout").optional().isInt({ min: 5, max: 180 }).withMessage("Session timeout must be between 5 and 180 minutes."),
];

export const systemSettingsValidation = [
  body("themePreference").optional().isIn(["light", "dark"]).withMessage("Theme preference must be light or dark."),
  body("autoLogoutTimer").optional().isInt({ min: 5, max: 120 }).withMessage("Auto logout timer must be between 5 and 120 minutes."),
  body("maintenanceMode").optional().isBoolean().withMessage("Maintenance mode must be true or false."),
  body("defaultDashboard").optional().isString().trim().isLength({ min: 1 }).withMessage("Default dashboard is required."),
];

export const notificationSettingsValidation = [
  body("emailNotifications").optional().isBoolean().withMessage("Email notification toggle must be boolean."),
  body("riskAlerts").optional().isBoolean().withMessage("Risk alert toggle must be boolean."),
  body("modelAlerts").optional().isBoolean().withMessage("Model alert toggle must be boolean."),
  body("weeklyReport").optional().isBoolean().withMessage("Weekly report toggle must be boolean."),
];

export const restoreDatabaseValidation = [
  body("backupFile").exists().trim().notEmpty().withMessage("Backup file name is required."),
];
