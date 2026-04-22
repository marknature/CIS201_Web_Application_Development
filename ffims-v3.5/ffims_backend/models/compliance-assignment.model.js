const mongoose = require("mongoose");

const complianceAssignmentSchema = new mongoose.Schema(
  {
    complianceRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplianceRecord",
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    responsibility: { type: String, default: "", trim: true },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: false,
  }
);

complianceAssignmentSchema.index(
  { complianceRecordId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model("ComplianceAssignment", complianceAssignmentSchema);
