const mongoose = require("mongoose");

const tankSchema = new mongoose.Schema(
  {
    tankName: { type: String, required: true, trim: true },
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building", default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    capacityLitres: { type: Number, default: 0, min: 0 },
    currentLevelLitres: { type: Number, default: 0, min: 0 },
    status: { type: String, default: "operational", trim: true },
    sourceType: { type: String, default: "", trim: true },
    locationDescription: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tank", tankSchema);
