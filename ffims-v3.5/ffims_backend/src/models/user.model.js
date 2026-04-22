// ffims_backend/src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin', 'technician', 'system_administrator', 'transport_manager', 'facility_manager', 'supervisor', 'operational_staff', 'general_university_staff']
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

function userToPublicShape(u) {
  if (!u) return null;
  const id = u._id ?? u.id;
  return {
    id,
    username: u.username,
    firstName: u.firstName,
    surname: u.surname,
    fullName: `${u.firstName || ""} ${u.surname || ""}`.trim(),
    email: u.email,
    phone: u.phone || "",
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    lastLogin: u.lastLogin,
  };
}

userSchema.methods.toSafeObject = function toSafeObject() {
  return userToPublicShape(this);
};

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

/** Plain object for API responses; works for Mongoose docs and plain user objects. */
User.serializeForApi = function serializeForApi(user) {
  if (user == null) return null;
  if (typeof user.toSafeObject === "function") {
    return user.toSafeObject();
  }
  return userToPublicShape(user);
};

module.exports = User;