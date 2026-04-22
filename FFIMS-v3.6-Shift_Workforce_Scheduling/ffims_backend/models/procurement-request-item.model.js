const mongoose = require("mongoose");

const procurementRequestItemSchema = new mongoose.Schema(
  {
    procurementRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcurementRequest",
      required: true,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      default: null,
    },
    supplierItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplierItem",
      default: null,
    },
    itemName: { type: String, required: true, trim: true },
    quantityRequested: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("ProcurementRequestItem", procurementRequestItemSchema);
