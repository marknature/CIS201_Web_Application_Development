const mongoose = require("mongoose");

const facilityThresholdRuleSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    healthyThreshold: { type: Number, default: 0 },
    degradedThreshold: { type: Number, default: 0 },
    zeroToleranceRuleCategory: { type: String, default: "", trim: true },
    triggerCondition: { type: String, default: "", trim: true },
    forcedScoreAction: { type: String, default: "", trim: true },
    alertLogicExplanation: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("FacilityThresholdRule", facilityThresholdRuleSchema);
