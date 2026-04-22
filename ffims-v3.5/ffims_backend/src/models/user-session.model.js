const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    expiryTime: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("UserSession", userSessionSchema);
