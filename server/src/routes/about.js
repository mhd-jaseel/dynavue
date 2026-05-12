const express = require('express');
const router = express.Router();
const AboutContent = require('../models/AboutContent');
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
      { folder: 'dynavue_about' },
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

// Get about content
router.get('/', async (req, res, next) => {
  try {
    let about = await AboutContent.findOne();
    if (!about) {
      // Create default if not exists
      about = new AboutContent({
        hero: { title: "The Story Behind DYNAVUE" },
        bio: { 
          title: "Hello, I'm the eye behind DYNAVUE.",
          paragraphs: [
            "Based in the culturally rich city of Kozhikode, Kerala, DYNAVUE was born out of a profound passion for freezing fleeting moments in time...",
            "My approach to photography is deeply rooted in documentary and editorial styles...",
            "Every couple, every family, every event has a unique rhythm..."
          ]
        },
        philosophy: { quote: "We believe that a photograph shouldn't just be seen; it should be felt. It is the closest thing we have to a time machine." },
        stats: [
          { num: "500+", label: "Weddings" },
          { num: "8", label: "Years Experience" },
          { num: "15+", label: "Cities Travelled" },
          { num: "10k+", label: "Frames Delivered" }
        ],
        gear: {
          cameras: ["Sony A7RV (x2)", "Sony A7IV", "Fujifilm X100V (for candids)"],
          lenses: ["Sony FE 35mm f/1.4 GM", "Sony FE 50mm f/1.2 GM", "Sony FE 85mm f/1.4 GM", "Sony FE 24-70mm f/2.8 GM II"]
        }
      });
      await about.save();
    }
    res.json({ success: true, data: about });
  } catch (err) {
    next(err);
  }
});

// Update about content
router.put('/', auth, uploadMiddleware.fields([{ name: 'heroImage', maxCount: 1 }, { name: 'bioImage', maxCount: 1 }]), async (req, res, next) => {
  try {
    let about = await AboutContent.findOne();
    if (!about) {
      about = new AboutContent();
    }

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    // Handle Hero Image
    if (req.files && req.files.heroImage) {
      const file = req.files.heroImage[0];
      if (hasCloudinary) {
        const result = await uploadToCloudinary(file.buffer);
        about.hero.image = result.secure_url;
      } else {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filename = Date.now() + '-hero-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
        about.hero.image = (process.env.BACKEND_URL || 'http://localhost:5000') + '/uploads/' + filename;
      }
    }

    // Handle Bio Image
    if (req.files && req.files.bioImage) {
      const file = req.files.bioImage[0];
      if (hasCloudinary) {
        const result = await uploadToCloudinary(file.buffer);
        about.bio.image = result.secure_url;
      } else {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const filename = Date.now() + '-bio-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
        about.bio.image = (process.env.BACKEND_URL || 'http://localhost:5000') + '/uploads/' + filename;
      }
    }

    // Handle other fields
    const { heroTitle, bioTitle, bioParagraphs, philosophyQuote, stats, cameras, lenses } = req.body;

    if (heroTitle !== undefined) about.hero.title = heroTitle;
    if (bioTitle !== undefined) about.bio.title = bioTitle;
    if (bioParagraphs !== undefined) about.bio.paragraphs = JSON.parse(bioParagraphs);
    if (philosophyQuote !== undefined) about.philosophy.quote = philosophyQuote;
    if (stats !== undefined) about.stats = JSON.parse(stats);
    if (cameras !== undefined) about.gear.cameras = JSON.parse(cameras);
    if (lenses !== undefined) about.gear.lenses = JSON.parse(lenses);

    await about.save();
    res.json({ success: true, data: about });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
