const mongoose = require('mongoose');

const ticketLogSchema = new mongoose.Schema({
  // Many-to-1: Many logs belong to one ticket
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  // Many-to-1: Many logs can be triggered by one user
  changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. "Status changed to Resolved"
  previous_value: { type: String },
  new_value: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('TicketLog', ticketLogSchema);
