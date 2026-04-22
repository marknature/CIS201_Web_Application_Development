const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectCode: { type: String, required: true, unique: true, trim: true },
    projectName: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    projectType: { type: String, default: "", trim: true },
    status: { type: String, default: "planning", trim: true },
    priority: { type: String, default: "medium", trim: true },
    facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", default: null },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    budgetAmount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
