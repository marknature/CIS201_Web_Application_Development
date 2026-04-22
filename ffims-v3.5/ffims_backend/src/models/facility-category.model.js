const mongoose = require("mongoose");

const facilityCategorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("FacilityCategory", facilityCategorySchema);
