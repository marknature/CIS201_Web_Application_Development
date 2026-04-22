const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    itemCode: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: "", trim: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      default: null,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetLocation",
      default: null,
    },
    quantityInStock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    supplierName: { type: String, default: "", trim: true },
    status: { type: String, default: "available", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
