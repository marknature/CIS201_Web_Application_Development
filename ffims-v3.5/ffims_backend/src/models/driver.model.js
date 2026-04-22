const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true, trim: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    licenseClass: { type: String, default: "Class 4", trim: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    status: { type: String, default: "ACTIVE", trim: true },
    notes: { type: String, default: "", trim: true },
    assignedVehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);

