import mongoose from 'mongoose';

const AssetLocationSchema = new mongoose.Schema({
  building: { type: String, required: true },
  floor: { type: String },
  room: { type: String },
  coordinates: { lat: Number, lng: Number },
}, { timestamps: true });

export default mongoose.model('AssetLocation', AssetLocationSchema);
