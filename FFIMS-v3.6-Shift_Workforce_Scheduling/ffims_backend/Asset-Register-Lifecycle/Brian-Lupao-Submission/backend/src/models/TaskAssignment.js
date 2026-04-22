const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema({
  // Many-to-1: Many assignments belong to one task
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  // Many-to-1: Many assignments can go to one user
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assigned_at: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);
