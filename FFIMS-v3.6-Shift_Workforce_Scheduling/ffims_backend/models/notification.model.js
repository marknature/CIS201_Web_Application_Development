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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
