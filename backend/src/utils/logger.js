import Log from "../models/Log.model.js";

export const logEvent = async ({
  level = "INFO",
  source = "System",
  message,
  details = "",
  userId = null,
  metadata = null,
}) => {
  if (!message) return;
  try {
    await Log.create({ level, source, message, details, userId, metadata });
  } catch (err) {
    // Never break API flow due to logging failure.
    console.warn("Log write failed:", err.message);
  }
};
