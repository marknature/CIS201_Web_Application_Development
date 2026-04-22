const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("validate", function syncSchemaCompat(next) {
  next();
});

userSchema.virtual("fullName").get(function getFullName() {
  return `${this.firstName || ""} ${this.surname || ""}`.trim();
});

userSchema.virtual("status").get(function getStatus() {
  return this.isActive ? "active" : "inactive";
});

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    surname: this.surname,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    roleId: this.roleId,
    roleName: this.role,
    isActive: this.isActive,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLogin: this.lastLogin,
    lastLoginAt: this.lastLogin,
  };
};

module.exports = mongoose.model("User", userSchema);
