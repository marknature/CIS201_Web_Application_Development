const mongoose = require("mongoose");

const ticketAssignmentSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "FaultTicket", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedRole: { type: String, default: "", trim: true },
    assignedAt: { type: Date, default: Date.now },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, default: "assigned", trim: true },
  },
  {
    timestamps: false,
  }
);

ticketAssignmentSchema.index({ ticketId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("TicketAssignment", ticketAssignmentSchema);
