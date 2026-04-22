const mongoose = require("mongoose");

const barrierRequestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    requestType: { type: String, required: true, trim: true },
    reason: { type: String, default: "", trim: true },
    requestedStartAt: { type: Date, default: null },
    requestedEndAt: { type: Date, default: null },
    status: { type: String, default: "pending", trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvalDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BarrierRequest", barrierRequestSchema);
