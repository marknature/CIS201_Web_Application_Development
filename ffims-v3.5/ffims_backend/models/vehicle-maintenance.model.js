const mongoose = require("mongoose");

const vehicleMaintenanceSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    maintenanceType: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    serviceDate: { type: Date, required: true },
    nextServiceDate: { type: Date, default: null },
    serviceProvider: { type: String, default: "", trim: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    workOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityWorkOrder",
      default: null,
    },
    cost: { type: Number, default: 0, min: 0 },
    mileageAtService: { type: Number, default: 0, min: 0 },
    status: { type: String, default: "scheduled", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("VehicleMaintenance", vehicleMaintenanceSchema);
