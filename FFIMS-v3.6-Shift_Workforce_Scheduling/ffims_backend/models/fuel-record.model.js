const mongoose = require("mongoose");

const fuelRecordSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fuelDate: { type: Date, required: true },
    liters: { type: Number, required: true, min: 0 },
    costPerLiter: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    odometerReading: { type: Number, default: 0, min: 0 },
    stationName: { type: String, default: "", trim: true },
    receiptNumber: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("FuelRecord", fuelRecordSchema);
