const mongoose = require("mongoose");

const regulationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    regulationCode: { type: String, default: "", trim: true, unique: true, sparse: true },
    category: { type: String, default: "", trim: true },
    issuingAuthority: { type: String, default: "", trim: true },
    effectiveDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    status: { type: String, default: "active", trim: true },
    description: { type: String, default: "", trim: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Regulation", regulationSchema);
