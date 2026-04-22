const mongoose = require("mongoose");

const faultTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    ticketType: { type: String, default: "fault", trim: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "resolved", "closed", "escalated"],
      default: "open",
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    images: [{ type: String }],
    resolutionNotes: { type: String, default: "", trim: true },
    escalatedAt: { type: Date, default: null },
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityWorkOrder", default: null },
    dueDate: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FaultTicket", faultTicketSchema);
