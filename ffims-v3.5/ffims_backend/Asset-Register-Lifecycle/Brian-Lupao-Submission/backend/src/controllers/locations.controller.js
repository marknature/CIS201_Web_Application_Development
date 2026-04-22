import AssetLocation from '../models/AssetLocation.js';

export const getLocations = async (req, res) => {
  try {
    const locations = await AssetLocation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const location = await AssetLocation.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await AssetLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const location = await AssetLocation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.json({ success: true, data: location });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await AssetLocation.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchLocations = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    if (!q) {
      const locations = await AssetLocation.find().sort({ createdAt: -1 }).limit(limit);
      return res.status(200).json({ success: true, data: locations });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[]\\]/g, '\\$&'), 'i');
    const locations = await AssetLocation.find({
      $or: [
        { name: regex },
        { building: regex },
        { floor: regex },
        { room: regex },
        { address: regex }
      ]
    }).limit(limit);

    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetsAtLocation = async (req, res) => {
  try {
    const Asset = (await import('../models/Asset.js')).default;
    const assets = await Asset.find({ location: req.params.id }).populate('category', 'name').populate('custodian', 'name email');
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
