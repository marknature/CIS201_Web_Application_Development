const mongoose = require("mongoose");

const facilityWorkOrderSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    faultTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaultTicket",
      default: null,
    },
    ticketStatus: { type: String, default: "", trim: true },
    workOrderType: { type: String, default: "", trim: true },
    triggerReason: { type: String, default: "", trim: true },
    resolutionState: { type: String, default: "", trim: true },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityWorkOrder", facilityWorkOrderSchema);
