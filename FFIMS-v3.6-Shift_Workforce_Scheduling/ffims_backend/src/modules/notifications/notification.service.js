const Notification = require("../../models/notification.model");

/**
 * Service for managing internal in-app notifications.
 */
class NotificationService {
  /**
   * Send a notification to a specific user.
   */
  async send({ recipientId, senderId, ticketId, type, message }) {
    try {
      const notification = await Notification.create({
        recipientId,
        senderId,
        ticketId,
        type,
        message,
      });
      return notification;
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Fail silently to not block main thread
      return null;
    }
  }

  /**
   * List notifications for a user, sorted by most recent.
   */
  async listForUser(userId) {
    return Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  /**
   * Mark a specific notification as read.
   */
  async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    return Notification.updateMany({ recipientId: userId }, { isRead: true });
  }

  /**
   * Delete old notifications (cleanup helper).
   */
  async deleteOld(days = 30) {
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);
    return Notification.deleteMany({ createdAt: { $lt: cutOff } });
  }
}

module.exports = new NotificationService();
