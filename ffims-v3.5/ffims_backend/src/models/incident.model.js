const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reportedByName: { type: String, default: "", trim: true },
    incidentDate: { type: Date, required: true },
    type: { type: String, default: "accident", trim: true },
    location: { type: String, default: "", trim: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, default: "minor", trim: true },
    damageEstimate: { type: Number, default: 0, min: 0 },
    status: { type: String, default: "open", trim: true },
    resolutionNotes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);

