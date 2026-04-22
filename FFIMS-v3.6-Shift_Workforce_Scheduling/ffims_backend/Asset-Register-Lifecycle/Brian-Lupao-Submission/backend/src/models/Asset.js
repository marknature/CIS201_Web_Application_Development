import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'maintenance', 'retired'], default: 'active' },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetLocation' },
  purchaseDate: { type: Date },
  purchaseCost: { type: Number, default: 0 },
  salvageValue: { type: Number, default: 0 },
  usefulLife: { type: Number, default: 5 },
  depreciationRate: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  condition: { type: String },
  custodian: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Asset', AssetSchema);
