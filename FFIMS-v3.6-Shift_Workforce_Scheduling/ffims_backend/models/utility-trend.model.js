const mongoose = require("mongoose");

const utilityTrendSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building", default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    metricType: { type: String, required: true, trim: true },
    periodLabel: { type: String, required: true, trim: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    value: { type: Number, default: 0 },
    baselineValue: { type: Number, default: 0 },
    variancePercent: { type: Number, default: 0 },
    trendDirection: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("UtilityTrend", utilityTrendSchema);
