const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      default: null,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      default: null,
    },
    equipmentName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    quantityAvailable: { type: Number, default: 0, min: 0 },
    status: { type: String, default: "available", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
