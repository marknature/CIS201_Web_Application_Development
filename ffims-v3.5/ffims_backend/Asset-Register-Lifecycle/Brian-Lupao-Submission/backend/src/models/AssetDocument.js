import mongoose from 'mongoose';

const VALID_DOCUMENT_TYPES = ['invoice', 'contract', 'report', 'manual', 'warranty', 'certificate', 'general', 'receipt', 'photo'];

const AssetDocumentSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, default: 0 },
  mimeType: { type: String },
  description: { type: String, default: '' },
  documentType: { type: String, enum: VALID_DOCUMENT_TYPES, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });

AssetDocumentSchema.index({ assetId: 1, createdAt: -1 });
AssetDocumentSchema.index({ documentType: 1 });

export default mongoose.model('AssetDocument', AssetDocumentSchema);
