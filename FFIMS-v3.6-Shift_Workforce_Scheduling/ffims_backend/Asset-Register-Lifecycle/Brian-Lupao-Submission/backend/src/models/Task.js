const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  due_date: { type: Date },
  // Many-to-1: Many tasks can belong to one project
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
