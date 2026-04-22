const mongoose = require("mongoose");

const facilityActivityLogSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    activityType: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    activityTime: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityActivityLog", facilityActivityLogSchema);
