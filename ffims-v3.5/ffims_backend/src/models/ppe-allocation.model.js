const mongoose = require("mongoose");

const ppeAllocationSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    ppeItemId: { type: mongoose.Schema.Types.ObjectId, ref: "PpeItem", required: true },
    quantityAllocated: { type: Number, default: 1, min: 1 },
    allocationDate: { type: Date, default: Date.now },
    returnDueDate: { type: Date, default: null },
    returnedAt: { type: Date, default: null },
    status: { type: String, default: "allocated", trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("PpeAllocation", ppeAllocationSchema);
