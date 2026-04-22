const mongoose = require("mongoose");

const ticketActivitySchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "FaultTicket", required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true, trim: true },
    field: { type: String, default: "", trim: true },
    previousValue: { type: String, default: "", trim: true },
    newValue: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

ticketActivitySchema.index({ ticketId: 1, createdAt: -1 });

module.exports = mongoose.model("TicketActivity", ticketActivitySchema);
