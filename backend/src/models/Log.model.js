import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["INFO", "WARN", "ERROR", "DEBUG"],
      default: "INFO",
      index: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      default: "System",
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });

const Log = mongoose.model("Log", logSchema);
export default Log;
