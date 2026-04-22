const mongoose = require("mongoose");

const faultTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    ticketType: { type: String, default: "fault", trim: true },
    priority: { type: String, default: "medium", trim: true },
    status: { type: String, default: "open", trim: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FaultTicket", faultTicketSchema);
