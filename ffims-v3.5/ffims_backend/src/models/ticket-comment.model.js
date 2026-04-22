const mongoose = require("mongoose");

const ticketCommentSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "FaultTicket", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

ticketCommentSchema.index({ ticketId: 1, createdAt: -1 });

module.exports = mongoose.model("TicketComment", ticketCommentSchema);
