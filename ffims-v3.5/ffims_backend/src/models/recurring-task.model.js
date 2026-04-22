const mongoose = require("mongoose");

const recurringTaskSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    maintenanceTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceTask",
      required: true,
    },
    recurrenceType: { type: String, required: true, trim: true },
    recurrenceInterval: { type: Number, required: true, min: 1 },
    nextDueDate: { type: Date, required: true },
    lastCompletedDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("RecurringTask", recurringTaskSchema);
