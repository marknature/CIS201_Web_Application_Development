const mongoose = require("mongoose");

const powerUsageSchema = new mongoose.Schema(
  {
    buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Building", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    energySourceId: { type: mongoose.Schema.Types.ObjectId, ref: "EnergySource", default: null },
    usageDate: { type: Date, required: true },
    kilowattHours: { type: Number, default: 0, min: 0 },
    peakDemand: { type: Number, default: 0, min: 0 },
    costAmount: { type: Number, default: 0, min: 0 },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("PowerUsage", powerUsageSchema);
