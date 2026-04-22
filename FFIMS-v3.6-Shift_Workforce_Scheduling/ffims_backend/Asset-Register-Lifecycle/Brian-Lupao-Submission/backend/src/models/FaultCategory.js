const mongoose = require('mongoose');

// 1-to-Many: One category can have many tickets
const faultCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  // 1-to-Many: One category can belong to many fault tickets
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FaultTicket' }],
}, { timestamps: true });

module.exports = mongoose.model('FaultCategory', faultCategorySchema);
