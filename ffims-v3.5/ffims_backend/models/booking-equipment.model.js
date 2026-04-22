const mongoose = require("mongoose");

const bookingEquipmentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
    quantityRequired: { type: Number, required: true, min: 1 },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("BookingEquipment", bookingEquipmentSchema);
