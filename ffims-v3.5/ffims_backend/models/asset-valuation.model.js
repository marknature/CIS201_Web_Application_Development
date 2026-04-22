const mongoose = require("mongoose");

const assetValuationSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    valuationDate: { type: Date, required: true },
    valuationAmount: { type: Number, required: true, min: 0 },
    valuationMethod: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    valuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("AssetValuation", assetValuationSchema);
