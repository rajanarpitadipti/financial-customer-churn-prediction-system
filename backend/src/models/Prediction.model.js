import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: "Unknown",
      trim: true,
    },
    prediction: {
      type: String,
      enum: ["Likely to Churn", "Not Likely to Churn"],
      required: true,
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    risk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    source: {
      type: String,
      enum: ["single", "batch"],
      default: "single",
      index: true,
    },
    datasetName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

predictionSchema.index({ userId: 1, createdAt: -1 });

const Prediction = mongoose.model("Prediction", predictionSchema);
export default Prediction;
