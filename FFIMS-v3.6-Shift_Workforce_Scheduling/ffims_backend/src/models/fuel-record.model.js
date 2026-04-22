const mongoose = require("mongoose");

const fuelRecordSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestedBy: { type: String, default: "", trim: true },
    fuelDate: { type: Date, required: true },
    litres: { type: Number, required: true, min: 0 },
    costPerLitre: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    odometer: { type: Number, default: 0, min: 0 },
    stationName: { type: String, default: "", trim: true },
    receiptNumber: { type: String, default: "", trim: true },
    status: { type: String, default: "pending", trim: true },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FuelRecord", fuelRecordSchema);

