import mongoose from 'mongoose';

const valuationSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true, unique: true },
  originalCost: Number,
  purchaseDate: Date,
  depreciationMethod: String,
  depreciationRate: Number,
  salvageValue: Number,
  estimatedLife: Number,

  calculationHistory: [{
    year: Number,
    depreciationAmount: Number,
    bookValue: Number,
    date: Date
  }],

  currentValue: Number,
  accumulatedDepreciation: Number,
  lastRevalued: Date,
  revaluedValue: Number,
  insuranceValue: Number,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

valuationSchema.index({ assetId: 1 });

export default mongoose.model('Valuation', valuationSchema);
