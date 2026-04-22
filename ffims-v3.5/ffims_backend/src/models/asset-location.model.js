const mongoose = require("mongoose");

const assetLocationSchema = new mongoose.Schema(
  {
    locationName: { type: String, required: true, trim: true },
    building: { type: String, default: "", trim: true },
    floor: { type: String, default: "", trim: true },
    room: { type: String, default: "", trim: true },
    campusTag: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("AssetLocation", assetLocationSchema);
