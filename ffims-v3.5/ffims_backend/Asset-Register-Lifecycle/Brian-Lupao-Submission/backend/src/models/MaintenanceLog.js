import mongoose from 'mongoose';

const MaintenanceLogSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  maintenanceDate: { type: Date, required: true },
  type: { type: String, required: true },
  description: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cost: { type: Number, default: 0 },
  nextMaintenanceDate: { type: Date },
}, { timestamps: true });

export default mongoose.model('MaintenanceLog', MaintenanceLogSchema);
