const mongoose = require("mongoose");

const complianceCertificateSchema = new mongoose.Schema(
  {
    regulationId: { type: mongoose.Schema.Types.ObjectId, ref: "Regulation", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    certificateNumber: { type: String, required: true, trim: true, unique: true },
    certificateName: { type: String, default: "", trim: true },
    issuedDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    status: { type: String, default: "valid", trim: true },
    fileUrl: { type: String, default: "", trim: true },
    issuedBy: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ComplianceCertificate", complianceCertificateSchema);
