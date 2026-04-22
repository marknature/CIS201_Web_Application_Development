const mongoose = require("mongoose");

const facilityScoreBreakdownSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    securityScore: { type: Number, default: 0 },
    securityWeight: { type: Number, default: 0 },
    lifeSafetyScore: { type: Number, default: 0 },
    lifeSafetyWeight: { type: Number, default: 0 },
    habitabilityScore: { type: Number, default: 0 },
    habitabilityWeight: { type: Number, default: 0 },
    weightedTotalScore: { type: Number, default: 0 },
    calculatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityScoreBreakdown", facilityScoreBreakdownSchema);
