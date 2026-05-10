import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/auth-context";
import {
  getAdminSettings,
  updateAdminProfileSettings,
  changeAdminPassword,
  updateAdminSecuritySettings,
  updateAdminSystemSettings,
  updateAdminNotificationSettings,
  logoutAllAdminSessions,
  uploadAdminDataset,
  retrainAdminModel,
  getAdminModelStatus,
  backupDatabase,
  restoreDatabase,
} from "../../services/api";

const colors = {
  primary: "#001845",
  secondary: "#0f172a",
  accent: "#0f4c81",
  accentSoft: "#e7f1ff",
  card: "#ffffff",
  lightBg: "#f8fafc",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#10b981",
  warning: "#f97316",
  danger: "#ef4444",
  dark: "#0f172a",
};

const Settings = () => {
  const { user, updateUserProfile, logout } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState({ profile: false, security: false, system: false, notifications: false, model: false, database: false });
  const [alerts, setAlerts] = useState({ profile: "", security: "", system: "", notifications: "", model: "", database: "" });
  const [profileForm, setProfileForm] = useState({ name: "", email: "", avatarUrl: "" });
  const [securityForm, setSecurityForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "", twoFactorEnabled: false, sessionTimeout: 30 });
  const [systemForm, setSystemForm] = useState({ themePreference: "light", autoLogoutTimer: 15, maintenanceMode: false, defaultDashboard: "overview" });
  const [notificationForm, setNotificationForm] = useState({ emailNotifications: true, riskAlerts: true, modelAlerts: true, weeklyReport: true });
  const [modelStatus, setModelStatus] = useState({ accuracy: null, lastTrained: null, version: null, datasetFilename: null, validationStatus: "Not available" });
  const [modelFile, setModelFile] = useState(null);
  const [databaseForm, setDatabaseForm] = useState({ backupFileName: "", status: "Healthy", storageUsage: "Calculating...", lastBackupAt: null });
  const [pendingFileName, setPendingFileName] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const [response, modelResponse] = await Promise.all([getAdminSettings(), getAdminModelStatus()]);
      const serverSettings = response.data.settings;
      const profile = response.data.user;
      const mergedSettings = {
        ...serverSettings,
        loginActivity: response.data.loginActivity || [],
      };
      setSettings(mergedSettings);
      setProfileForm({
        name: profile.name || "",
        email: profile.email || "",
        avatarUrl: serverSettings.avatarUrl || "",
      });
      setSecurityForm((prev) => ({
        ...prev,
        twoFactorEnabled: serverSettings.twoFactorEnabled ?? false,
        sessionTimeout: serverSettings.sessionTimeout ?? 30,
      }));
      setSystemForm((prev) => ({
        ...prev,
        themePreference: serverSettings.themePreference || "light",
        autoLogoutTimer: serverSettings.autoLogoutTimer ?? 15,
        maintenanceMode: serverSettings.maintenanceMode ?? false,
        defaultDashboard: serverSettings.defaultDashboard || "overview",
      }));
      setNotificationForm({
        emailNotifications: serverSettings.emailNotifications ?? true,
        riskAlerts: serverSettings.riskAlerts ?? true,
        modelAlerts: serverSettings.modelAlerts ?? true,
        weeklyReport: serverSettings.weeklyReport ?? true,
      });
      setModelStatus({
        accuracy: modelResponse.data.status.accuracy || null,
        lastTrained: modelResponse.data.status.lastTrained || null,
        version: modelResponse.data.status.version || "Not trained",
        datasetFilename: serverSettings.latestDatasetFilename || null,
        validationStatus: serverSettings.datasetValidationStatus || "Ready to upload",
      });
      setDatabaseForm({
        backupFileName: serverSettings.lastBackupFile || "",
        status: serverSettings.databaseStatus || "Healthy",
        storageUsage: serverSettings.storageUsage || "12.4 GB",
        lastBackupAt: serverSettings.lastBackupAt || null,
      });
      setAlerts((prev) => ({ ...prev, profile: "", security: "", system: "", notifications: "", model: "", database: "" }));
    } catch (error) {
      console.error(error);
      setAlerts((prev) => ({ ...prev, profile: "Unable to load settings. Refresh to retry." }));
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAlerts((prev) => ({ ...prev, profile: "Upload a valid avatar image file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, avatarUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      setAlerts((prev) => ({ ...prev, profile: "Name and email are required." }));
      return;
    }
    setSectionLoading((prev) => ({ ...prev, profile: true }));
    try {
      const response = await updateAdminProfileSettings(profileForm);
      const updatedUser = response.data.user;
      updateUserProfile({ name: updatedUser.name, email: updatedUser.email, profileImage: updatedUser.avatarUrl });
      setAlerts((prev) => ({ ...prev, profile: "Profile settings saved successfully." }));
      setSettings((prev) => ({ ...prev, avatarUrl: profileForm.avatarUrl }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, profile: error?.response?.data?.message || "Failed to save profile." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const handleSecurityChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSecurityForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSecurity = async (event) => {
    event.preventDefault();
    if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
      setAlerts((prev) => ({ ...prev, security: "New password and confirmation do not match." }));
      return;
    }
    setSectionLoading((prev) => ({ ...prev, security: true }));
    try {
      if (securityForm.currentPassword && securityForm.newPassword) {
        await changeAdminPassword({
          currentPassword: securityForm.currentPassword,
          newPassword: securityForm.newPassword,
        });
      }
      await updateAdminSecuritySettings({
        twoFactorEnabled: securityForm.twoFactorEnabled,
        sessionTimeout: Number(securityForm.sessionTimeout),
      });
      setAlerts((prev) => ({ ...prev, security: "Security settings updated successfully." }));
      setSecurityForm((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, security: error?.response?.data?.message || "Failed to update security settings." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, security: false }));
    }
  };

  const saveSystem = async (event) => {
    event.preventDefault();
    setSectionLoading((prev) => ({ ...prev, system: true }));
    try {
      await updateAdminSystemSettings({
        themePreference: systemForm.themePreference,
        autoLogoutTimer: Number(systemForm.autoLogoutTimer),
        maintenanceMode: systemForm.maintenanceMode,
        defaultDashboard: systemForm.defaultDashboard,
      });
      updateUserProfile({ themePreference: systemForm.themePreference });
      setAlerts((prev) => ({ ...prev, system: "System settings were saved." }));
      setSettings((prev) => ({ ...prev, themePreference: systemForm.themePreference }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, system: error?.response?.data?.message || "Failed to update system settings." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, system: false }));
    }
  };

  const toggleNotification = (event) => {
    const { name, checked } = event.target;
    setNotificationForm((prev) => ({ ...prev, [name]: checked }));
  };

  const saveNotifications = async (event) => {
    event.preventDefault();
    setSectionLoading((prev) => ({ ...prev, notifications: true }));
    try {
      await updateAdminNotificationSettings(notificationForm);
      setAlerts((prev) => ({ ...prev, notifications: "Notification settings updated." }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, notifications: error?.response?.data?.message || "Failed to save notifications." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, notifications: false }));
    }
  };

  const handleDatasetUpload = (event) => {
    setModelFile(event.target.files[0]);
  };

  const uploadDataset = async () => {
    if (!modelFile) {
      setAlerts((prev) => ({ ...prev, model: "Please select a dataset file to upload." }));
      return;
    }
    setSectionLoading((prev) => ({ ...prev, model: true }));
    try {
      const response = await uploadAdminDataset(modelFile);
      const filename = response.data.file;
      setModelStatus((prev) => ({ ...prev, datasetFilename: filename, validationStatus: "Dataset uploaded" }));
      setSettings((prev) => ({ ...prev, latestDatasetFilename: filename, datasetValidationStatus: "Uploaded" }));
      setAlerts((prev) => ({ ...prev, model: "Dataset uploaded successfully." }));
      setModelFile(null);
    } catch (error) {
      setAlerts((prev) => ({ ...prev, model: error?.response?.data?.message || "Dataset upload failed." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, model: false }));
    }
  };

  const retrainModel = async () => {
    const filename = settings?.latestDatasetFilename;
    if (!filename) {
      setAlerts((prev) => ({ ...prev, model: "Upload a dataset before retraining the model." }));
      return;
    }
    setSectionLoading((prev) => ({ ...prev, model: true }));
    try {
      await retrainAdminModel(filename);
      const modelResponse = await getAdminModelStatus();
      setModelStatus({
        accuracy: modelResponse.data.status.accuracy || null,
        lastTrained: modelResponse.data.status.lastTrained || null,
        version: modelResponse.data.status.version || "Not trained",
        datasetFilename: filename,
        validationStatus: "Model retrained",
      });
      setAlerts((prev) => ({ ...prev, model: "Model retraining started successfully." }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, model: error?.response?.data?.message || "Model retraining failed." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, model: false }));
    }
  };

  const handleBackup = async () => {
    setSectionLoading((prev) => ({ ...prev, database: true }));
    try {
      const response = await backupDatabase();
      setDatabaseForm((prev) => ({ ...prev, backupFileName: response.data.backupFile, status: "Backup complete", lastBackupAt: response.data.createdAt }));
      setAlerts((prev) => ({ ...prev, database: "Database backup completed." }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, database: error?.response?.data?.message || "Database backup failed." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, database: false }));
    }
  };

  const handleRestore = async () => {
    if (!pendingFileName) {
      setAlerts((prev) => ({ ...prev, database: "Provide the backup file name to restore." }));
      return;
    }
    setSectionLoading((prev) => ({ ...prev, database: true }));
    try {
      await restoreDatabase({ backupFile: pendingFileName });
      setAlerts((prev) => ({ ...prev, database: "Database restore completed. Please refresh to verify." }));
      setDatabaseForm((prev) => ({ ...prev, status: "Restored" }));
    } catch (error) {
      setAlerts((prev) => ({ ...prev, database: error?.response?.data?.message || "Database restore failed." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, database: false }));
    }
  };

  const handleLogoutAllDevices = async () => {
    setSectionLoading((prev) => ({ ...prev, security: true }));
    try {
      await logoutAllAdminSessions();
      setAlerts((prev) => ({ ...prev, security: "All other sessions have been signed out." }));
      logout();
    } catch (error) {
      setAlerts((prev) => ({ ...prev, security: error?.response?.data?.message || "Could not log out all devices." }));
    } finally {
      setSectionLoading((prev) => ({ ...prev, security: false }));
    }
  };

  if (settingsLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loader}>Loading bank settings...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageIntro}>
        <div>
          <h1 style={styles.pageTitle}>Admin Settings</h1>
          <p style={styles.pageDescription}>Manage bank security, model integrations, notification preferences, backups, and system controls from one enterprise console.</p>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Profile Settings</h2>
            <span style={styles.cardNote}>Core admin profile and avatar management</span>
          </div>
          <div style={styles.profileGrid}>
            <div style={styles.avatarPanel}>
              {profileForm.avatarUrl ? (
                <img src={profileForm.avatarUrl} alt="Avatar" style={styles.avatarImage} />
              ) : (
                <div style={styles.avatarFallback}>{user?.name?.charAt(0)?.toUpperCase() || "A"}</div>
              )}
              <label style={styles.uploadLabel} htmlFor="avatar-upload">
                Upload avatar
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} style={styles.hiddenInput} />
            </div>
            <form style={styles.formSection} onSubmit={saveProfile}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Admin name</label>
                <input name="name" value={profileForm.name} onChange={handleProfileChange} style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email address</label>
                <input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} style={styles.input} />
              </div>
              {alerts.profile && <div style={{ ...styles.banner, color: alerts.profile.includes("failed") ? colors.danger : colors.success }}>{alerts.profile}</div>}
              <button type="submit" style={styles.primaryButton} disabled={sectionLoading.profile}>{sectionLoading.profile ? "Saving..." : "Update profile"}</button>
            </form>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Security Settings</h2>
            <span style={styles.cardNote}>Protect access with password controls, 2FA, and session governance</span>
          </div>
          <form style={styles.sectionForm} onSubmit={saveSecurity}>
            <div style={styles.doubleRow}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Current password</label>
                <input name="currentPassword" type="password" value={securityForm.currentPassword} onChange={handleSecurityChange} style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>New password</label>
                <input name="newPassword" type="password" value={securityForm.newPassword} onChange={handleSecurityChange} style={styles.input} />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirm password</label>
                <input name="confirmPassword" type="password" value={securityForm.confirmPassword} onChange={handleSecurityChange} style={styles.input} />
              </div>
            </div>
            <div style={styles.toggleRow}>
              <label style={styles.toggleLabel}>
                <span>Enable two-factor auth</span>
                <input name="twoFactorEnabled" type="checkbox" checked={securityForm.twoFactorEnabled} onChange={handleSecurityChange} style={styles.toggleInput} />
              </label>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Session timeout (minutes)</label>
                <select name="sessionTimeout" value={securityForm.sessionTimeout} onChange={handleSecurityChange} style={styles.input}>
                  {[15, 30, 45, 60, 120].map((value) => (
                    <option key={value} value={value}>{value} minutes</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.loginActivity}>
              <div style={styles.activityHeader}>Recent login activity</div>
              {(settings.loginActivity || []).slice(0, 4).map((entry, index) => (
                <div key={index} style={styles.activityRow}>
                  <span>{entry.message || "Login event"}</span>
                  <span style={styles.activityTime}>{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleLogoutAllDevices} style={{ ...styles.secondaryButton, marginBottom: 16 }} disabled={sectionLoading.security}>{sectionLoading.security ? "Signing out..." : "Logout from all devices"}</button>
            {alerts.security && <div style={{ ...styles.banner, color: alerts.security.includes("failed") ? colors.danger : colors.success }}>{alerts.security}</div>}
            <button type="submit" style={styles.primaryButton} disabled={sectionLoading.security}>{sectionLoading.security ? "Saving..." : "Save security preferences"}</button>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>System Settings</h2>
            <span style={styles.cardNote}>Theme, maintenance mode, default dashboard and auto logout</span>
          </div>
          <form style={styles.sectionForm} onSubmit={saveSystem}>
            <div style={styles.toggleRow}>
              <label style={styles.toggleLabel}>
                <span>Dark mode</span>
                <input name="themePreference" type="checkbox" checked={systemForm.themePreference === "dark"} onChange={() => setSystemForm((prev) => ({ ...prev, themePreference: prev.themePreference === "dark" ? "light" : "dark" }))} style={styles.toggleInput} />
              </label>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Default dashboard</label>
                <select name="defaultDashboard" value={systemForm.defaultDashboard} onChange={handleSystemChange} style={styles.input}>
                  <option value="overview">Overview</option>
                  <option value="users">Manage Users</option>
                  <option value="analytics">Analytics</option>
                  <option value="model">Model Control</option>
                  <option value="logs">System Logs</option>
                  <option value="settings">Settings</option>
                </select>
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Auto logout timer</label>
                <select name="autoLogoutTimer" value={systemForm.autoLogoutTimer} onChange={handleSystemChange} style={styles.input}>
                  {[5, 10, 15, 30, 60].map((value) => (
                    <option key={value} value={value}>{value} min</option>
                  ))}
                </select>
              </div>
            </div>
            <label style={styles.toggleLabel}>
              <span>Maintenance mode</span>
              <input name="maintenanceMode" type="checkbox" checked={systemForm.maintenanceMode} onChange={handleSystemChange} style={styles.toggleInput} />
            </label>
            {alerts.system && <div style={{ ...styles.banner, color: alerts.system.includes("failed") ? colors.danger : colors.success }}>{alerts.system}</div>}
            <button type="submit" style={styles.primaryButton} disabled={sectionLoading.system}>{sectionLoading.system ? "Saving..." : "Save system settings"}</button>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Notification Settings</h2>
            <span style={styles.cardNote}>Manage alert channels for model and risk events</span>
          </div>
          <form style={styles.sectionForm} onSubmit={saveNotifications}>
            {[
              { label: "Email notifications", name: "emailNotifications" },
              { label: "Risk alert notifications", name: "riskAlerts" },
              { label: "Model failure alerts", name: "modelAlerts" },
              { label: "Weekly performance report", name: "weeklyReport" },
            ].map((item) => (
              <label key={item.name} style={styles.toggleLabel}>
                <span>{item.label}</span>
                <input name={item.name} type="checkbox" checked={notificationForm[item.name]} onChange={toggleNotification} style={styles.toggleInput} />
              </label>
            ))}
            {alerts.notifications && <div style={{ ...styles.banner, color: alerts.notifications.includes("failed") ? colors.danger : colors.success }}>{alerts.notifications}</div>}
            <button type="submit" style={styles.primaryButton} disabled={sectionLoading.notifications}>{sectionLoading.notifications ? "Saving..." : "Save notification settings"}</button>
          </form>
        </section>

        <section style={styles.cardWide}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Model Settings</h2>
            <span style={styles.cardNote}>Review model accuracy, dataset status, and training actions</span>
          </div>
          <div style={styles.modelGrid}>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>{modelStatus.accuracy !== null ? `${modelStatus.accuracy}%` : "N/A"}</span>
              <span style={styles.metricLabel}>Current model accuracy</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>{modelStatus.lastTrained ? new Date(modelStatus.lastTrained).toLocaleDateString() : "Not trained"}</span>
              <span style={styles.metricLabel}>Last trained date</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>{modelStatus.datasetFilename || "No dataset"}</span>
              <span style={styles.metricLabel}>Active dataset</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricValue}>{modelStatus.validationStatus}</span>
              <span style={styles.metricLabel}>Dataset validation</span>
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleDatasetUpload} style={styles.inputFile} />
          </div>
          <div style={styles.actionRow}>
            <button onClick={uploadDataset} style={styles.secondaryButton} disabled={sectionLoading.model}>{sectionLoading.model ? "Uploading..." : "Upload new dataset"}</button>
            <button onClick={retrainModel} style={styles.primaryButton} disabled={sectionLoading.model}>{sectionLoading.model ? "Retraining..." : "Retrain model"}</button>
          </div>
          {alerts.model && <div style={{ ...styles.banner, color: alerts.model.includes("failed") ? colors.danger : colors.success }}>{alerts.model}</div>}
        </section>

        <section style={styles.cardWide}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Database / Backup Settings</h2>
            <span style={styles.cardNote}>Store backups, restore state, and monitor storage health</span>
          </div>
          <div style={styles.databaseGrid}>
            <div style={styles.statusPanel}>
              <span style={styles.statusLabel}>Database status</span>
              <span style={{ ...styles.statusBadge, background: databaseForm.status === "Healthy" ? "#e6fffa" : "#fef3c7", color: databaseForm.status === "Healthy" ? "#047857" : "#b45309" }}>{databaseForm.status}</span>
            </div>
            <div style={styles.statusPanel}>
              <span style={styles.statusLabel}>Storage usage</span>
              <span style={styles.dataValue}>{databaseForm.storageUsage}</span>
            </div>
            <div style={styles.statusPanel}>
              <span style={styles.statusLabel}>Last backup</span>
              <span style={styles.dataValue}>{databaseForm.lastBackupAt ? new Date(databaseForm.lastBackupAt).toLocaleString() : "No backup yet"}</span>
            </div>
          </div>
          <div style={styles.actionRow}>
            <button onClick={handleBackup} style={styles.secondaryButton} disabled={sectionLoading.database}>{sectionLoading.database ? "Backing up..." : "Backup database"}</button>
            <div style={styles.restoreGroup}>
              <input placeholder="Backup file name" value={pendingFileName} onChange={(e) => setPendingFileName(e.target.value)} style={styles.input} />
              <button onClick={handleRestore} style={styles.primaryButton} disabled={sectionLoading.database}>{sectionLoading.database ? "Restoring..." : "Restore backup"}</button>
            </div>
          </div>
          {alerts.database && <div style={{ ...styles.banner, color: alerts.database.includes("failed") ? colors.danger : colors.success }}>{alerts.database}</div>}
        </section>
      </div>
    </div>
  );

  function handleSystemChange(event) {
    const { name, checked, value, type } = event.target;
    setSystemForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }
};

const baseCard = {
  background: colors.card,
  borderRadius: 16,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
  padding: 24,
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: "24px 0",
  },
  loadingWrapper: {
    padding: 32,
    background: colors.lightBg,
    borderRadius: 16,
    textAlign: "center",
    color: colors.muted,
  },
  loader: {
    padding: 24,
    borderRadius: 14,
    background: "#ffffff",
    display: "inline-block",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  pageIntro: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  pageTitle: {
    margin: 0,
    fontSize: "2rem",
    color: colors.primary,
  },
  pageDescription: {
    margin: 0,
    color: colors.muted,
    fontSize: "1rem",
    maxWidth: 700,
  },
  grid: {
    display: "grid",
    gap: 24,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  card: {
    ...baseCard,
  },
  cardWide: {
    ...baseCard,
    gridColumn: "1 / -1",
  },
  cardHeader: {
    marginBottom: 18,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 700,
    color: colors.dark,
  },
  cardNote: {
    color: colors.muted,
    fontSize: "0.95rem",
  },
  profileGrid: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: 24,
  },
  avatarPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    border: `1px solid ${colors.border}`,
  },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.accentSoft,
    color: colors.accent,
    fontSize: "2.5rem",
    fontWeight: 700,
  },
  uploadLabel: {
    cursor: "pointer",
    color: colors.accent,
    fontWeight: 600,
  },
  hiddenInput: {
    display: "none",
  },
  formSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionForm: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    color: colors.muted,
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    padding: "12px 14px",
    fontSize: "0.95rem",
    color: colors.dark,
    outline: "none",
  },
  inputFile: {
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    padding: "14px",
    fontSize: "0.95rem",
    color: colors.dark,
    width: "100%",
    cursor: "pointer",
    background: colors.lightBg,
  },
  toggleRow: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "1fr 1fr",
  },
  toggleLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    background: colors.accentSoft,
    padding: "16px",
    color: colors.dark,
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  toggleInput: {
    width: 20,
    height: 20,
    cursor: "pointer",
  },
  loginActivity: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "16px",
    background: colors.lightBg,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
  },
  activityHeader: {
    fontWeight: 600,
    color: colors.primary,
  },
  activityRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    color: colors.muted,
    fontSize: "0.95rem",
  },
  activityTime: {
    minWidth: 120,
    textAlign: "right",
  },
  actionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  restoreGroup: {
    display: "grid",
    gap: 12,
    flex: 1,
  },
  banner: {
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: "0.95rem",
    fontWeight: 600,
    background: "#f8fafc",
  },
  primaryButton: {
    borderRadius: 12,
    border: "none",
    background: colors.secondary,
    color: colors.card,
    padding: "12px 22px",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 170,
  },
  secondaryButton: {
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.card,
    color: colors.dark,
    padding: "12px 22px",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 170,
  },
  metricCard: {
    background: colors.lightBg,
    borderRadius: 14,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 190,
  },
  metricValue: {
    fontSize: "1.9rem",
    fontWeight: 700,
    color: colors.primary,
  },
  metricLabel: {
    color: colors.muted,
  },
  modelGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    marginBottom: 18,
  },
  databaseGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    marginBottom: 18,
  },
  statusPanel: {
    padding: 18,
    borderRadius: 14,
    background: colors.lightBg,
    border: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  statusLabel: {
    color: colors.muted,
    fontWeight: 600,
  },
  statusBadge: {
    alignSelf: "flex-start",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  dataValue: {
    fontSize: "1rem",
    fontWeight: 700,
    color: colors.dark,
  },
};

export default Settings;
