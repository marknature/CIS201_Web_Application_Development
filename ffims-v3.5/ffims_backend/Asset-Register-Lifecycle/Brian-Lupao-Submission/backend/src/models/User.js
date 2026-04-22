import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'asset-manager', 'technician', 'user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
