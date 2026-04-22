const mongoose = require('mongoose');

const ticketCommentSchema = new mongoose.Schema({
  // Many-to-1: Many comments belong to one ticket
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  // Many-to-1: Many comments can be made by one user
  commented_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TicketComment', ticketCommentSchema);
