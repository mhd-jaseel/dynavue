const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const auth = require('../middleware/auth');

// Middleware to ensure admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

router.get('/stats', auth, adminOnly, adminController.getStats);

module.exports = router;
