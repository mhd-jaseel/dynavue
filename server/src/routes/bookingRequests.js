const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings/bookingsController');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.post('/', auth, bookingsController.createRequest);
router.get('/my-requests', auth, bookingsController.getMyRequests);
router.get('/admin/all', auth, adminOnly, bookingsController.getAllRequests);
router.patch('/:id/status', auth, adminOnly, bookingsController.updateRequestStatus);

module.exports = router;
