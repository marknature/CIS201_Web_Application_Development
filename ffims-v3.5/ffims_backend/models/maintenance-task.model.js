const mongoose = require("mongoose");

const maintenanceTaskSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    workOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityWorkOrder",
      default: null,
    },
    faultTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaultTicket",
      default: null,
    },
    projectTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectTask",
      default: null,
    },
    taskName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    priorityLevel: { type: String, default: "medium", trim: true },
    dateCreated: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, default: "open", trim: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("MaintenanceTask", maintenanceTaskSchema);
