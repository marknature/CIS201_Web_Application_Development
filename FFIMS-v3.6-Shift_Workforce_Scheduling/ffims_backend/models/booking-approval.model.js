const mongoose = require("mongoose");

const bookingApprovalSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: { type: String, default: "pending", trim: true },
    actionDate: { type: Date, default: Date.now },
    remarks: { type: String, default: "", trim: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("BookingApproval", bookingApprovalSchema);
