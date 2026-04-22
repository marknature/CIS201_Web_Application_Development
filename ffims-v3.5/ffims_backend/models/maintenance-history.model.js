const mongoose = require("mongoose");

const maintenanceHistorySchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    maintenanceTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceTask",
      required: true,
    },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    completedDate: { type: Date, required: true },
    workDone: { type: String, default: "", trim: true },
    partsUsed: { type: String, default: "", trim: true },
    cost: { type: Number, default: 0, min: 0 },
    remarks: { type: String, default: "", trim: true },
    status: { type: String, default: "completed", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("MaintenanceHistory", maintenanceHistorySchema);
