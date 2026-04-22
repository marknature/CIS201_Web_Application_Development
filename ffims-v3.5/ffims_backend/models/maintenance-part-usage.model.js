const mongoose = require("mongoose");

const maintenancePartUsageSchema = new mongoose.Schema(
  {
    maintenanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleMaintenance",
      required: true,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
    },
    quantityUsed: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("MaintenancePartUsage", maintenancePartUsageSchema);
