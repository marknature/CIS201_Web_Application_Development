const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    channel: { type: String, default: "in_app", trim: true },
    notificationType: { type: String, default: "general", trim: true },
    entityType: { type: String, default: "", trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    status: { type: String, default: "unread", trim: true },
    readAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaultTicket",
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: ["status_update", "assignment", "escalation", "comment", "system"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
