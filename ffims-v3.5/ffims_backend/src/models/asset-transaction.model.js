const mongoose = require("mongoose");

const assetTransactionSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    transactionType: { type: String, required: true, trim: true },
    fromLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetLocation",
      default: null,
    },
    toLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetLocation",
      default: null,
    },
    transactionDate: { type: Date, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "", trim: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("AssetTransaction", assetTransactionSchema);
