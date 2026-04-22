const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    paymentDate: { type: Date, required: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: "", trim: true },
    paymentReference: { type: String, default: "", trim: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
