const mongoose = require("mongoose");

const complianceRecordSchema = new mongoose.Schema(
  {
    recordNumber: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    complianceType: { type: String, default: "", trim: true },
    status: { type: String, default: "open", trim: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", default: null },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    faultTicketId: { type: mongoose.Schema.Types.ObjectId, ref: "FaultTicket", default: null },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ComplianceRecord", complianceRecordSchema);
