const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // Many-to-1: Many products belong to one category
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryCategory' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
