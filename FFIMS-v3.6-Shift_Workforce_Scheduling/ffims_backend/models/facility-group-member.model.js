const mongoose = require("mongoose");

const facilityGroupMemberSchema = new mongoose.Schema(
  {
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacilityNavigationGroup",
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityGroupMember", facilityGroupMemberSchema);
