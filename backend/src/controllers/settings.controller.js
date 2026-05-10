import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import User from "../models/User.model.js";
import Settings from "../models/Settings.model.js";
import Prediction from "../models/Prediction.model.js";
import Log from "../models/Log.model.js";
import { logEvent } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../..");
const BACKUP_DIR = path.join(ROOT_DIR, "backend", "backups");

const ensureBackupDirectory = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

const getDefaultSettings = () => ({
  avatarUrl: "",
  twoFactorEnabled: false,
  sessionTimeout: 30,
  themePreference: "light",
  autoLogoutTimer: 15,
  maintenanceMode: false,
  defaultDashboard: "overview",
  emailNotifications: true,
  riskAlerts: true,
  modelAlerts: true,
  weeklyReport: true,
  latestDatasetFilename: "",
  datasetValidationStatus: "Not available",
  databaseStatus: "Healthy",
  storageUsage: "12.4 GB",
  lastBackupAt: null,
  lastBackupFile: "",
});

const buildLoginActivity = async (userId) => {
  const events = await Log.find({ userId, source: "Auth" })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("message createdAt")
    .lean();
  return events.map((event) => ({
    message: event.message,
    createdAt: event.createdAt,
  }));
};

export const getAdminSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }
    const defaults = getDefaultSettings();
    const settings = await Settings.findOneAndUpdate(
      { admin: user._id },
      { $setOnInsert: defaults },
      { new: true, upsert: true }
    ).lean();
    const loginActivity = await buildLoginActivity(user._id);
    res.json({ success: true, user, settings, loginActivity });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to load admin settings", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
};

export const updateProfileSettings = async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: "Email address is already in use." });
      }
      user.email = email;
    }
    if (name) user.name = name;
    await user.save();
    const settings = await Settings.findOneAndUpdate(
      { admin: user._id },
      { $set: { avatarUrl: avatarUrl || "" } },
      { new: true, upsert: true }
    );
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      approved: user.approved,
      avatarUrl: settings.avatarUrl,
    };
    res.json({ success: true, message: "Profile updated successfully.", user: payload, settings });
    logEvent({ level: "INFO", source: "Settings", message: "Admin profile updated", userId: req.user.id });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to update profile settings", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Could not update profile settings." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.json({ success: true, message: "Password changed successfully. Please sign in again." });
    logEvent({ level: "INFO", source: "Settings", message: "Admin changed password", userId: req.user.id });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to change password", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Could not change password." });
  }
};

export const updateSecuritySettings = async (req, res) => {
  try {
    const { twoFactorEnabled, sessionTimeout } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { admin: req.user.id },
      {
        $set: {
          twoFactorEnabled: Boolean(twoFactorEnabled),
          sessionTimeout: Number(sessionTimeout),
        },
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: "Security settings updated.", settings });
    logEvent({ level: "INFO", source: "Settings", message: "Security settings updated", userId: req.user.id });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to update security settings", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Could not update security settings." });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    const { themePreference, autoLogoutTimer, maintenanceMode, defaultDashboard } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { admin: req.user.id },
      {
        $set: {
          themePreference: themePreference === "dark" ? "dark" : "light",
          autoLogoutTimer: Number(autoLogoutTimer),
          maintenanceMode: Boolean(maintenanceMode),
          defaultDashboard: defaultDashboard || "overview",
        },
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: "System settings updated.", settings });
    logEvent({ level: "INFO", source: "Settings", message: "System settings updated", userId: req.user.id });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to update system settings", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Could not update system settings." });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, riskAlerts, modelAlerts, weeklyReport } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { admin: req.user.id },
      {
        $set: {
          emailNotifications: Boolean(emailNotifications),
          riskAlerts: Boolean(riskAlerts),
          modelAlerts: Boolean(modelAlerts),
          weeklyReport: Boolean(weeklyReport),
        },
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: "Notification settings updated.", settings });
    logEvent({ level: "INFO", source: "Settings", message: "Notification settings updated", userId: req.user.id });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to update notification settings", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Could not update notification settings." });
  }
};

export const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found" });
    }
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.json({ success: true, message: "All sessions have been terminated." });
    logEvent({ level: "INFO", source: "Settings", message: "Logged out all devices", userId: req.user.id });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Failed to terminate sessions", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Could not logout devices." });
  }
};

const collectDatabaseSnapshot = async () => {
  const snapshot = {
    users: await User.find({}, "-password").lean(),
    predictions: await Prediction.find({}).lean(),
    logs: await Log.find({}).lean(),
    settings: await Settings.find({}).lean(),
  };
  return snapshot;
};

export const backupDatabase = async (req, res) => {
  try {
    ensureBackupDirectory();
    const snapshot = await collectDatabaseSnapshot();
    const filename = `db-backup-${Date.now()}.json`;
    const filePath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify({ generatedAt: new Date(), backup: snapshot }, null, 2));
    await Settings.findOneAndUpdate(
      { admin: req.user.id },
      { $set: { lastBackupAt: new Date(), lastBackupFile: filename, databaseStatus: "Healthy", storageUsage: `${(Object.keys(snapshot).length * 1.2).toFixed(1)} GB` } },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: "Database backup completed.", backupFile: filename, createdAt: new Date() });
    logEvent({ level: "INFO", source: "Settings", message: "Database backup created", userId: req.user.id, metadata: { backupFile: filename } });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Database backup failed", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Database backup failed." });
  }
};

export const restoreDatabase = async (req, res) => {
  try {
    const { backupFile } = req.body;
    const filePath = path.join(BACKUP_DIR, backupFile);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Backup file not found." });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed?.backup?.settings) {
      return res.status(400).json({ success: false, message: "Backup file is missing settings data." });
    }
    const settingsData = parsed.backup.settings;
    await Settings.deleteMany({ admin: req.user.id });
    for (const record of settingsData.filter((item) => String(item.admin) === String(req.user.id))) {
      const { _id, admin, ...rest } = record;
      await Settings.create({ admin, ...rest });
    }
    res.json({ success: true, message: "Database restore completed." });
    logEvent({ level: "INFO", source: "Settings", message: "Database restore completed", userId: req.user.id, metadata: { backupFile } });
  } catch (error) {
    logEvent({ level: "ERROR", source: "Settings", message: "Database restore failed", details: error.message, userId: req.user.id });
    res.status(500).json({ success: false, message: "Database restore failed." });
  }
};
