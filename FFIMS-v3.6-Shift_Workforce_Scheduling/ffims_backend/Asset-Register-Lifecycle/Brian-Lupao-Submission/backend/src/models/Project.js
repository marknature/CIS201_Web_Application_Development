const mongoose = require('mongoose');

// 1-to-Many: One project can have many tasks
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], default: 'Planning' },
  start_date: { type: Date },
  end_date: { type: Date },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
