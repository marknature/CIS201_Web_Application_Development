const mongoose = require("mongoose");

const facilityAssetConditionSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    assetType: { type: String, required: true, trim: true },
    assetCondition: { type: String, default: "", trim: true },
    quantity: { type: Number, default: 0, min: 0 },
    lastInspectionDate: { type: Date, default: null },
    inspectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    validationStatus: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("FacilityAssetCondition", facilityAssetConditionSchema);
