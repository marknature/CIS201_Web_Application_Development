const mongoose = require("mongoose");

const assetDocumentSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
    documentType: { type: String, required: true, trim: true },
    filePath: { type: String, default: "", trim: true },
    fileName: { type: String, default: "", trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("AssetDocument", assetDocumentSchema);
