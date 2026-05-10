import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    sessionTimeout: {
      type: Number,
      default: 30,
    },
    themePreference: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    autoLogoutTimer: {
      type: Number,
      default: 15,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    defaultDashboard: {
      type: String,
      default: "overview",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    riskAlerts: {
      type: Boolean,
      default: true,
    },
    modelAlerts: {
      type: Boolean,
      default: true,
    },
    weeklyReport: {
      type: Boolean,
      default: true,
    },
    latestDatasetFilename: {
      type: String,
      default: "",
    },
    datasetValidationStatus: {
      type: String,
      default: "Not available",
    },
    databaseStatus: {
      type: String,
      default: "Healthy",
    },
    storageUsage: {
      type: String,
      default: "12.4 GB",
    },
    lastBackupAt: {
      type: Date,
      default: null,
    },
    lastBackupFile: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
