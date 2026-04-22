const mongoose = require("mongoose");

const facilityNavigationGroupSchema = new mongoose.Schema(
  {
    groupName: { type: String, required: true, unique: true, trim: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityNavigationGroup", facilityNavigationGroupSchema);
