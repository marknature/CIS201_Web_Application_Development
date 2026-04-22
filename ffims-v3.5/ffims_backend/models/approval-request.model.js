const mongoose = require("mongoose");

const approvalRequestSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, default: "pending", trim: true },
    remarks: { type: String, default: "", trim: true },
    requestedAt: { type: Date, default: Date.now },
    actionDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ApprovalRequest", approvalRequestSchema);
