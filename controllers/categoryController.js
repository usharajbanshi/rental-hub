const Category = require('../models/Category');

// @POST /api/categories - Create category (admin only)
exports.createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, category });
};

// @GET /api/categories - Get all categories
exports.getAllCategories = async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({ success: true, categories });
};

// @DELETE /api/categories/:id - Delete category (admin only)
exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(404).json({ success: false, message: 'Category not found' });
  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted' });
};