const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// Create category
router.post('/', auth, async (req, res, next) => {
  try {
    const { name, type, order } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const category = new Category({ name, slug, type, order });
    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    next(err);
  }
});

// Update category
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { name, type, order } = req.body;
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name, slug }), ...(type && { type }), ...(order !== undefined && { order }) } },
      { new: true }
    );
    
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
});

// Delete category
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
