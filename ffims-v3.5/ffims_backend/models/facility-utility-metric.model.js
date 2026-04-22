const mongoose = require("mongoose");

const facilityUtilityMetricSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    lawnGrassHeight: { type: Number, default: 0 },
    boreholePumpStatus: { type: String, default: "", trim: true },
    groundsConditionIndicator: { type: String, default: "", trim: true },
    utilityOperationalStatus: { type: String, default: "", trim: true },
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityUtilityMetric", facilityUtilityMetricSchema);
