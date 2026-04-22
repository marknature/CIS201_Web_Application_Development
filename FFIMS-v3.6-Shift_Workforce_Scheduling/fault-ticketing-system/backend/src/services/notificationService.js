const Notification = require("../models/notificationModel");

const notify = async (userId, message, ticketId) => {
  if (!userId) return;
  await Notification.create({ user_id: userId, message, ticket_id: ticketId });
};

module.exports = { notify };
