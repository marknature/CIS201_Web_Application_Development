const mongoose = require("mongoose");

const shiftScheduleSchema = new mongoose.Schema(
  {
    shiftCode: { type: String, required: true, unique: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    shiftDate: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    shiftType: { type: String, default: "", trim: true },
    status: { type: String, default: "scheduled", trim: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShiftSchedule", shiftScheduleSchema);
