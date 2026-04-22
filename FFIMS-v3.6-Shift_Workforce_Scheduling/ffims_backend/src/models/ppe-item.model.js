const mongoose = require("mongoose");

const ppeItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    itemCode: { type: String, trim: true, unique: true, sparse: true },
    category: { type: String, default: "", trim: true },
    size: { type: String, default: "", trim: true },
    quantityInStock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    conditionStatus: { type: String, default: "good", trim: true },
    expiryDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PpeItem", ppeItemSchema);
