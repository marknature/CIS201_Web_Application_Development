const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Many-to-1: Many notifications can be sent to one user
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  // Optional: link notification back to a ticket
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
