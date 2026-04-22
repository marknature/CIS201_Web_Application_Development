import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  changes: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
