const mongoose = require("mongoose");

const facilityHealthRecordSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    overallHealthScore: { type: Number, default: 0 },
    healthStatusLabel: { type: String, default: "", trim: true },
    lastInspectionDate: { type: Date, default: null },
    inspectionType: { type: String, default: "", trim: true },
    validationStatus: { type: String, default: "", trim: true },
    responsibleInspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("FacilityHealthRecord", facilityHealthRecordSchema);
