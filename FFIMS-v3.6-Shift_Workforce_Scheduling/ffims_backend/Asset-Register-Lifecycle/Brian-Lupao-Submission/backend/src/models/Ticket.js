const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  // Many-to-1: Many tickets can belong to one user
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Many-to-1: Many tickets can have one category, priority, status
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'FaultCategory' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Closed'], default: 'Open' },
  // Many-to-1: Many tickets can reference one asset
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
