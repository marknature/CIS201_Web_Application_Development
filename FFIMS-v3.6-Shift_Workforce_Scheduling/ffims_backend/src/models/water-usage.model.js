const mongoose = require("mongoose");

const waterUsageSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    tankId: { type: mongoose.Schema.Types.ObjectId, ref: "Tank", default: null },
    usageDate: { type: Date, required: true },
    volumeLitres: { type: Number, default: 0, min: 0 },
    costAmount: { type: Number, default: 0, min: 0 },
    sourceType: { type: String, default: "", trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("WaterUsage", waterUsageSchema);
