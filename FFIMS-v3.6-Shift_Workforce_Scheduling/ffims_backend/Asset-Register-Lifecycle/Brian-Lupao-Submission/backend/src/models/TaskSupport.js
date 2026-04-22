const mongoose = require('mongoose');

// TaskSchedule - 1-to-1 with Task
const taskScheduleSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, unique: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  recurrence: { type: String, enum: ['None', 'Daily', 'Weekly', 'Monthly'], default: 'None' },
}, { timestamps: true });

// TaskQueue - Many-to-1 with Task
const taskQueueSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  position: { type: Number, required: true },
  queued_at: { type: Date, default: Date.now },
}, { timestamps: true });

// TaskDependency - Many-to-Many between Tasks
const taskDependencySchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  depends_on: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
}, { timestamps: true });

// TaskApproval - Many-to-1 with Task and User
const taskApprovalSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  comments: { type: String },
}, { timestamps: true });

// MaterialRequest - Many-to-1 with Task and User
const materialRequestSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  requested_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  material_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Delivered'], default: 'Pending' },
}, { timestamps: true });

// WorkLog - Many-to-1 with Task and User
const workLogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  logged_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hours_worked: { type: Number, required: true },
  description: { type: String },
  log_date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = {
  TaskSchedule: mongoose.model('TaskSchedule', taskScheduleSchema),
  TaskQueue: mongoose.model('TaskQueue', taskQueueSchema),
  TaskDependency: mongoose.model('TaskDependency', taskDependencySchema),
  TaskApproval: mongoose.model('TaskApproval', taskApprovalSchema),
  MaterialRequest: mongoose.model('MaterialRequest', materialRequestSchema),
  WorkLog: mongoose.model('WorkLog', workLogSchema),
};
