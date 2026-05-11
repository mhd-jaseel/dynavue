const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.get('/stats', auth, adminOnly, adminController.getStats);

module.exports = router;
