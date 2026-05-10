export const uploadAndTrain = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fs = await import("fs");
    const csv = (await import("csv-parser")).default;
    const { trainWithRealData } = await import("../ml/churnModel.js");

    const features = [];
    const labels = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        const t = Number(row.tenure);
        const mc = Number(row.monthlyCharges);
        const c = Number(row.contract);
        const sc = Number(row.supportCalls);
        const label = Number(row.churn);

        if (
          isNaN(t) ||
          isNaN(mc) ||
          isNaN(c) ||
          isNaN(sc) ||
          isNaN(label)
        ) {
          return;
        }

        features.push([t, mc, c, sc]);
        labels.push(label);
      })
      .on("end", async () => {
        await trainWithRealData(features, labels);

        fs.unlinkSync(req.file.path);

        res.status(200).json({
          success: true,
          message: "Model retrained successfully",
        });
      });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
import { predictChurn, getRiskLevel } from "../ml/churnModel.js";

export const predictSingleChurn = async (req, res) => {
  try {
    let { tenure, monthlyCharges, contract, supportCalls } = req.body;

    // ✅ 1. Check missing fields
    if (
      tenure === undefined ||
      monthlyCharges === undefined ||
      contract === undefined ||
      supportCalls === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: tenure, monthlyCharges, contract, supportCalls",
      });
    }

    // ✅ 2. Convert to numbers
    tenure = Number(tenure);
    monthlyCharges = Number(monthlyCharges);
    contract = Number(contract);
    supportCalls = Number(supportCalls);

    // ✅ 3. Type validation
    if (
      isNaN(tenure) ||
      isNaN(monthlyCharges) ||
      isNaN(contract) ||
      isNaN(supportCalls)
    ) {
      return res.status(400).json({
        success: false,
        message: "All inputs must be valid numbers",
      });
    }

    // ✅ 4. Range validation
    if (tenure < 0 || tenure > 100) {
      return res.status(400).json({
        success: false,
        message: "Tenure must be between 0 and 100",
      });
    }

    if (monthlyCharges < 0 || monthlyCharges > 10000) {
      return res.status(400).json({
        success: false,
        message: "Monthly charges must be between 0 and 10000",
      });
    }

    if (![0, 1].includes(contract)) {
      return res.status(400).json({
        success: false,
        message: "Contract must be 0 (monthly) or 1 (yearly)",
      });
    }

    if (supportCalls < 0 || supportCalls > 50) {
      return res.status(400).json({
        success: false,
        message: "Support calls must be between 0 and 50",
      });
    }

    // ✅ 5. Prepare features
    const features = [
      Number(tenure),
      Number(monthlyCharges),
      Number(contract),
      Number(supportCalls),
    ];

    // ✅ 6. Call ML model
    const probability = await predictChurn(features);
    const riskLevel = getRiskLevel(probability);

    // ✅ 7. Send response
    return res.status(200).json({
      success: true,
      data: {
        churnProbability: Number(probability.toFixed(4)),
        riskLevel,
        input: {
          tenure,
          monthlyCharges,
          contract,
          supportCalls,
        },
      },
    });

  } catch (error) {
    console.error("Prediction Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};