const AssetCategory = require('AssetCategory');

exports.createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        
        const newCategory = await AssetCategory.create({ categoryName, description });
        
        res.status(201).json({
            success: true,
            data: newCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await AssetCategory.find();
        
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};