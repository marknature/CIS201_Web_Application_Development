const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierName: { type: String, required: true, trim: true },
    supplierDate: { type: Date, default: null },
    supplierLocation: { type: String, default: "", trim: true },
    contactPerson: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    approvalStatus: { type: String, default: "pending", trim: true },
    quotationFile: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);
