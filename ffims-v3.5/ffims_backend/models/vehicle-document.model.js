const mongoose = require("mongoose");

const vehicleDocumentSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    documentType: { type: String, required: true, trim: true },
    documentNumber: { type: String, default: "", trim: true },
    filePath: { type: String, default: "", trim: true },
    issueDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    status: { type: String, default: "valid", trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("VehicleDocument", vehicleDocumentSchema);
