const mongoose = require("mongoose");

const utilityAlertSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building", default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    alertType: { type: String, required: true, trim: true },
    alertCategory: { type: String, default: "", trim: true },
    severity: { type: String, default: "medium", trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, default: "open", trim: true },
    detectedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("UtilityAlert", utilityAlertSchema);
