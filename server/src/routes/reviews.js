const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews/reviewsController');
const auth = require('../middleware/auth');

// Middleware to ensure admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

router.get('/approved', reviewsController.getApprovedReviews);
router.post('/', auth, reviewsController.submitReview);
router.get('/my-review', auth, reviewsController.getMyReview);
router.put('/my-review', auth, reviewsController.updateMyReview);
router.delete('/my-review', auth, reviewsController.deleteMyReview);
router.get('/admin/all', auth, adminOnly, reviewsController.getAllReviews);
router.patch('/:id/status', auth, adminOnly, reviewsController.updateReviewStatus);
router.delete('/:id', auth, adminOnly, reviewsController.deleteReview);

module.exports = router;
