const mongoose = require('mongoose');

const ticketImageSchema = new mongoose.Schema({
  // Many-to-1: Many images can belong to one ticket
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  image_url: { type: String, required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('TicketImage', ticketImageSchema);
