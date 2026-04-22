const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
  {
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill", required: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("BillItem", billItemSchema);
