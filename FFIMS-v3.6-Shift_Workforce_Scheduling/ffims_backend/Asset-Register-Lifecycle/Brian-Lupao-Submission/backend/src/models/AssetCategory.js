import mongoose from 'mongoose';

const AssetCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  depreciationMethod: { type: String, default: 'straight-line' },
}, { timestamps: true });

export default mongoose.model('AssetCategory', AssetCategorySchema);
