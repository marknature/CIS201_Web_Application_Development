const mongoose = require("mongoose");

const complianceAlertSchema = new mongoose.Schema(
  {
    regulationId: { type: mongoose.Schema.Types.ObjectId, ref: "Regulation", default: null },
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceCertificate",
      default: null,
    },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    alertType: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    severity: { type: String, default: "medium", trim: true },
    dueDate: { type: Date, default: null },
    status: { type: String, default: "open", trim: true },
    acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("ComplianceAlert", complianceAlertSchema);
