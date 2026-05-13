const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res, next) => {
  try {
    const enquiry = new Enquiry(req.body);
    
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        enquiry.user = decoded.id;
      } catch (err) {}
    }

    await enquiry.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Enquiry from ${enquiry.name} - ${enquiry.serviceType}`,
      text: `Name: ${enquiry.name}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nDate: ${enquiry.eventDate}\nService: ${enquiry.serviceType}\nMessage: ${enquiry.message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error('Email error:', error);
    });

    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
});

router.get('/my-enquiries', auth, async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    next(err);
  }
});

router.get('/calendar', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const enquiries = await Enquiry.find({
      status: { $in: ['confirmed', 'completed'] }
    }).sort({ eventDate: 1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    next(err);
  }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
