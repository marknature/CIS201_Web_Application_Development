const mongoose = require("mongoose");

const energySourceSchema = new mongoose.Schema(
  {
    sourceName: { type: String, required: true, trim: true },
    sourceType: { type: String, required: true, trim: true },
    providerName: { type: String, default: "", trim: true },
    status: { type: String, default: "active", trim: true },
    unitOfMeasure: { type: String, default: "kWh", trim: true },
    notes: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EnergySource", energySourceSchema);
