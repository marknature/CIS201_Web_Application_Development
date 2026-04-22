const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, required: true, unique: true, trim: true },
    eventTitle: { type: String, required: true, trim: true },
    eventDescription: { type: String, default: "", trim: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    bookingDate: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, default: "pending", trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
