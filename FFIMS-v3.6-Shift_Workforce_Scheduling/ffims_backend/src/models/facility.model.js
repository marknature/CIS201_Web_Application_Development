const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    facilityName: { type: String, required: true, trim: true },
    facilityType: { type: String, default: "", trim: true },
    facilityCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityCategory",
      default: null,
    },
    facilityCode: { type: String, trim: true, unique: true, sparse: true },
    campusTag: { type: String, default: "", trim: true },
    allocationStatus: { type: String, default: "", trim: true },
    occupancyStatus: { type: String, default: "", trim: true },
    capacity: { type: Number, default: 0, min: 0 },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetLocation",
      default: null,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Facility", facilitySchema);
