const mongoose = require("mongoose");

const securityIncidentSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    incidentType: { type: String, required: true, trim: true },
    severity: { type: String, default: "medium", trim: true },
    description: { type: String, required: true, trim: true },
    occurredAt: { type: Date, default: Date.now },
    status: { type: String, default: "open", trim: true },
    actionTaken: { type: String, default: "", trim: true },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("SecurityIncident", securityIncidentSchema);
