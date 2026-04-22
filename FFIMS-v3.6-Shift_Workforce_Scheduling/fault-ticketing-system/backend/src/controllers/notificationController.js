const Notification = require("../models/notificationModel");
const { ok, fail } = require("../utils/apiResponse");

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.getByUserId(req.user.id);
    return ok(res, "Notifications fetched", notifications);
  } catch (error) {
    return next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const updated = await Notification.markRead(req.params.id, req.user.id);
    if (!updated) return fail(res, "Notification not found", 404);
    return ok(res, "Notification marked as read");
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNotifications, markAsRead };
