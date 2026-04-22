import mongoose from 'mongoose';

const AssetTransactionSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  transactionType: { type: String, enum: ['deployment','transfer','maintenance','retirement'], required: true },
  fromLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetLocation' },
  toLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetLocation' },
  timestamp: { type: Date, default: Date.now },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetDocument' },
}, { timestamps: true });

export default mongoose.model('AssetTransaction', AssetTransactionSchema);
