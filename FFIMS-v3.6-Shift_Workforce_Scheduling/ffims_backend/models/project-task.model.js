const mongoose = require("mongoose");

const projectTaskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectTask", default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, default: "open", trim: true },
    priority: { type: String, default: "medium", trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    plannedStartDate: { type: Date, default: null },
    plannedEndDate: { type: Date, default: null },
    actualStartDate: { type: Date, default: null },
    actualEndDate: { type: Date, default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "FacilityWorkOrder", default: null },
    faultTicketId: { type: mongoose.Schema.Types.ObjectId, ref: "FaultTicket", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
