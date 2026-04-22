const mongoose = require('mongoose');

const requisitionSchema = new mongoose.Schema({
  // Many-to-1: Many requisitions can reference one product
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  requester_name: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requisition_date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Requisition', requisitionSchema);
