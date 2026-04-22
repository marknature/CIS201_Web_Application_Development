const {
  NotificationDocument,
  mapNotification,
  toObjectId
} = require("./mongoCollections");

const create = async ({ user_id, message, ticket_id }) => {
  const objectId = toObjectId(user_id);
  const ticketObjectId = toObjectId(ticket_id);
  if (!objectId) {
    return null;
  }

  const notification = await NotificationDocument.create({
    user_id: objectId,
    ticket_id: ticketObjectId,
    message
  });

  return mapNotification(notification);
};

const getByUserId = async (userId) => {
  const objectId = toObjectId(userId);
  if (!objectId) {
    return [];
  }

  const notifications = await NotificationDocument.find({ user_id: objectId })
    .sort({ created_at: -1 })
    .lean();

  return notifications.map((notification) => mapNotification(notification));
};

const markRead = async (id, userId) => {
  const notificationId = toObjectId(id);
  const objectId = toObjectId(userId);
  if (!notificationId || !objectId) {
    return false;
  }

  const result = await NotificationDocument.updateOne(
    { _id: notificationId, user_id: objectId },
    { $set: { is_read: true } }
  );

  return result.matchedCount > 0;
};

module.exports = { create, getByUserId, markRead };
