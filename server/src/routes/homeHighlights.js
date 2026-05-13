const express = require('express');
const router = express.Router();
const HomeHighlight = require('../models/HomeHighlight');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const cloudinary = require('cloudinary').v2;
const stream = require('stream');
const fs = require('fs');
const path = require('path');

// Helper function to upload buffer to cloudinary via stream
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'dynavue_home' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Seed default data if none exists
const seedDefault = async () => {
  const count = await HomeHighlight.countDocuments();
  if (count === 0) {
    await HomeHighlight.create({
      smallHeading: 'Featured Highlights',
      mainTitlePart1: 'The Art of',
      mainTitleItalic: 'Storytelling',
      buttonText: 'Explore Portfolio',
      buttonLink: '/portfolio',
      photos: [
        { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000', alt: 'Elegant wedding rings on silk fabric', category: 'Detail', order: 0 },
        { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=2000', alt: 'Couple embracing on a cliff at sunset', category: 'Portrait', order: 1 },
        { url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=2000', alt: 'Bride getting ready in a sunlit room', category: 'Lifestyle', order: 2 },
        { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000', alt: 'Emotional wedding ceremony moment', category: 'Wedding', order: 3 },
        { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=2000', alt: 'Candid laughter at a reception dinner', category: 'Candid', order: 4 },
        { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=2000', alt: 'Elegant bridal portrait with floral background', category: 'Portrait', order: 5 }
      ]
    });
  }
};

// Get the HomeHighlight section data
router.get('/', async (req, res, next) => {
  try {
    await seedDefault();
    const data = await HomeHighlight.findOne();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Update basic text data or reorder/delete images
router.put('/', auth, async (req, res, next) => {
  try {
    let highlight = await HomeHighlight.findOne();
    if (!highlight) {
      highlight = new HomeHighlight();
    }

    const { smallHeading, mainTitlePart1, mainTitleItalic, buttonText, buttonLink, photos } = req.body;

    if (smallHeading !== undefined) highlight.smallHeading = smallHeading;
    if (mainTitlePart1 !== undefined) highlight.mainTitlePart1 = mainTitlePart1;
    if (mainTitleItalic !== undefined) highlight.mainTitleItalic = mainTitleItalic;
    if (buttonText !== undefined) highlight.buttonText = buttonText;
    if (buttonLink !== undefined) highlight.buttonLink = buttonLink;
    if (photos !== undefined) highlight.photos = photos;

    await highlight.save();
    res.json({ success: true, data: highlight });
  } catch (err) {
    next(err);
  }
});

// Add new photo(s)
router.post('/photos', auth, uploadMiddleware.array('images', 10), async (req, res, next) => {
  try {
    let highlight = await HomeHighlight.findOne();
    if (!highlight) {
      highlight = new HomeHighlight();
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
    const uploadDir = path.join(__dirname, '../uploads');
    
    // get metadata if provided (e.g. array of categories/alts matching files order)
    const { metadata } = req.body;
    let parsedMetadata = [];
    try {
      if (metadata) parsedMetadata = JSON.parse(metadata);
    } catch (e) {}

    let currentOrder = highlight.photos.length;

    for (let i = 0; i < req.files.length; i++) {
      let url, cloudinaryId;
      const file = req.files[i];
      const filename = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
      const uploadDir = path.join(__dirname, '../uploads');

      if (hasCloudinary) {
        try {
          const result = await uploadToCloudinary(file.buffer);
          url = result.secure_url;
          cloudinaryId = result.public_id;
        } catch (cloudinaryError) {
          console.error('Cloudinary upload failed, falling back to local', cloudinaryError);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
          url = (process.env.BACKEND_URL || '') + '/uploads/' + filename;
          cloudinaryId = 'local_' + filename;
        }
      } else {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
        url = (process.env.BACKEND_URL || '') + '/uploads/' + filename;
        cloudinaryId = 'local_' + filename;
      }

      const meta = parsedMetadata[i] || { alt: 'Home Highlight', category: 'Portfolio' };
      
      highlight.photos.push({
        url,
        cloudinaryId,
        alt: meta.alt,
        category: meta.category,
        order: currentOrder++
      });
    }

    await highlight.save();
    res.json({ success: true, data: highlight });
  } catch (err) {
    next(err);
  }
});

// Update CTA background image
router.put('/cta-image', auth, uploadMiddleware.single('ctaImage'), async (req, res, next) => {
  try {
    let highlight = await HomeHighlight.findOne();
    if (!highlight) {
      highlight = new HomeHighlight();
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
    let url;
    
    if (hasCloudinary) {
      const result = await uploadToCloudinary(req.file.buffer);
      url = result.secure_url;
    } else {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const file = req.file;
      const filename = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
      fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
      url = (process.env.BACKEND_URL || '') + '/uploads/' + filename;
    }

    highlight.ctaBgImage = url;
    await highlight.save();
    
    res.json({ success: true, data: highlight });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
