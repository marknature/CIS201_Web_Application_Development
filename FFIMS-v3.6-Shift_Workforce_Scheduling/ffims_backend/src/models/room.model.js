const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      default: null,
    },
    roomName: { type: String, required: true, trim: true },
    roomType: { type: String, default: "", trim: true },
    capacity: { type: Number, default: 0, min: 0 },
    locationDescription: { type: String, default: "", trim: true },
    availabilityStatus: { type: String, default: "available", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Room", roomSchema);
