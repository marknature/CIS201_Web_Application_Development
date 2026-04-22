const mongoose = require("mongoose");

const dutyAssignmentSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    purpose: { type: String, default: "", trim: true },
    status: { type: String, default: "assigned", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("DutyAssignment", dutyAssignmentSchema);
