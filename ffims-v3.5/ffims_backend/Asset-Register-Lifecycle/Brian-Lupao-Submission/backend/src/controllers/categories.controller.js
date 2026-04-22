import AssetCategory from '../models/AssetCategory.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await AssetCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await AssetCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await AssetCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await AssetCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await AssetCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchCategories = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    if (!q) {
      const categories = await AssetCategory.find().sort({ createdAt: -1 }).limit(limit);
      return res.status(200).json({ success: true, data: categories });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[]\\]/g, '\\$&'), 'i');
    const categories = await AssetCategory.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    }).limit(limit);
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetsInCategory = async (req, res) => {
  try {
    const Asset = (await import('../models/Asset.js')).default;
    const assets = await Asset.find({ category: req.params.id }).populate('location', 'building floor room').populate('custodian', 'name email');
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
