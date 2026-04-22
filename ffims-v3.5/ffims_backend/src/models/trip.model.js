const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestedByName: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    tripDate: { type: Date, required: true },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    origin: { type: String, default: "", trim: true },
    destination: { type: String, default: "", trim: true },
    purpose: { type: String, default: "", trim: true },
    startMileage: { type: Number, default: 0, min: 0 },
    endMileage: { type: Number, default: 0, min: 0 },
    fuelUsed: { type: Number, default: 0, min: 0 },
    status: { type: String, default: "pending", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
