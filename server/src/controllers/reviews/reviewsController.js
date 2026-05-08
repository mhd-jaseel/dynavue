const Review = require('../../models/Review');

exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { review, rating, image, name } = req.body;
    
    // Create new review
    const newReview = new Review({
      user: req.user.id,
      name: name || 'Valued Client',
      review,
      rating,
      image,
      status: 'pending' // Always pending by default
    });

    await newReview.save();
    res.json({ success: true, message: 'Review submitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ user: req.user.id });
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMyReview = async (req, res) => {
  try {
    const { review, rating, image, name } = req.body;
    const updatedReview = await Review.findOneAndUpdate(
      { user: req.user.id },
      { review, rating, image, name, status: 'pending' },
      { new: true }
    );
    if (!updatedReview) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review: updatedReview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMyReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ user: req.user.id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } }
      ];
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email profilePic')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
