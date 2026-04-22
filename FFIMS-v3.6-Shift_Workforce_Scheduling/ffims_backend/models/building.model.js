const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    buildingName: { type: String, required: true, trim: true },
    buildingType: { type: String, default: "", trim: true },
    buildingCode: { type: String, default: "", trim: true, unique: true, sparse: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    electricityMeterNumber: { type: String, default: "", trim: true },
    waterMeterNumber: { type: String, default: "", trim: true },
    status: { type: String, default: "active", trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Building", buildingSchema);
