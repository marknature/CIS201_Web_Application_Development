const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    faultTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaultTicket",
      default: null,
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    incidentDate: { type: Date, required: true },
    location: { type: String, default: "", trim: true },
    description: { type: String, required: true, trim: true },
    severity: { type: String, default: "low", trim: true },
    status: { type: String, default: "open", trim: true },
    resolutionNotes: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Incident", incidentSchema);
