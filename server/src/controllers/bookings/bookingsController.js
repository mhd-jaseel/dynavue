const BookingRequest = require('../../models/BookingRequest');
const Enquiry = require('../../models/Enquiry');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

exports.createRequest = async (req, res) => {
  try {
    const { bookingId, requestType, updatedData } = req.body;
    
    // Verify booking belongs to user
    const booking = await Enquiry.findOne({ _id: bookingId, user: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found or access denied' });

    // Check if a pending request already exists
    const existingRequest = await BookingRequest.findOne({ bookingId, status: 'pending' });
    if (existingRequest) return res.status(400).json({ success: false, message: 'A request is already pending for this booking' });

    const newRequest = new BookingRequest({
      bookingId,
      userId: req.user.id,
      requestType,
      updatedData: requestType === 'edit' ? updatedData : null,
      status: 'pending'
    });

    await newRequest.save();
    
    // Send notification to admin
    const admin = await User.findOne({ role: 'admin' });
    const currentUser = await User.findById(req.user.id);
    if (admin && currentUser) {
      const notification = new Notification({
        receiver: admin._id,
        sender: req.user.id,
        type: 'booking_request',
        title: `Booking ${requestType === 'edit' ? 'Edit' : 'Cancellation'} Request`,
        message: `${currentUser.name} requested an ${requestType} for booking ${bookingId}`,
        relatedId: newRequest._id
      });
      await notification.save();
    }
    
    res.json({ success: true, message: 'Request submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BookingRequest.find({ userId: req.user.id }).populate('bookingId');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const requests = await BookingRequest.find(query)
      .populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await BookingRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });

    request.status = status;
    request.updatedAt = Date.now();
    await request.save();

    if (status === 'approved') {
      if (request.requestType === 'cancel') {
        // Update booking status to cancelled
        await Enquiry.findByIdAndUpdate(request.bookingId, { status: 'cancelled' });
      } else if (request.requestType === 'edit') {
        // Update booking with updatedData
        await Enquiry.findByIdAndUpdate(request.bookingId, request.updatedData);
      }
    }

    // Send notification to user
    const notification = new Notification({
      receiver: request.userId,
      sender: req.user.id,
      type: 'booking_update',
      title: `Booking Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your ${request.requestType} request for booking ${request.bookingId} has been ${status}.`,
      relatedId: request._id
    });
    await notification.save();
    
    res.json({ success: true, message: `Request ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
