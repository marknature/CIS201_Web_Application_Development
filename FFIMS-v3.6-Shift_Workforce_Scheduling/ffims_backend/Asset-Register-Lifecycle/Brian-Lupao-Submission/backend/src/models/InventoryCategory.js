const mongoose = require('mongoose');

// 1-to-Many: One category can have many assets
const inventoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // 1-to-Many: One category can have many assets
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Asset' }],
}, { timestamps: true });

module.exports = mongoose.model('InventoryCategory', inventoryCategorySchema);
