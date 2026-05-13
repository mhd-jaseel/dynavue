const Gallery = require('../../models/Gallery');
const cloudinary = require('../../config/cloudinary');
const stream = require('stream');
const fs = require('fs');
const path = require('path');

// Helper function to upload buffer to cloudinary via stream
const uploadToCloudinary = (buffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'dynavue_galleries', resource_type: resourceType },
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

exports.getGalleries = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category: category.toLowerCase() } : {};
    const galleries = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: galleries });
  } catch (err) {
    next(err);
  }
};

exports.createGallery = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No media uploaded' });
    }

    const { title, category, description, featured, coverIndex, cardSize } = req.body;
    const isFeatured = featured === 'true';
    const cIndex = parseInt(coverIndex) || 0;

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
    const uploadedImages = [];
    const uploadedVideos = [];

    // Map through req.files and handle based on mimetype
    if (hasCloudinary) {
      for (let i = 0; i < req.files.length; i++) {
        const isVideo = req.files[i].mimetype.startsWith('video/');
        const result = await uploadToCloudinary(req.files[i].buffer, isVideo ? 'video' : 'image');
        
        if (isVideo) {
          uploadedVideos.push({
            cloudinaryId: result.public_id,
            url: result.secure_url,
            order: i
          });
        } else {
          uploadedImages.push({
            cloudinaryId: result.public_id,
            url: result.secure_url,
            order: i
          });
        }
      }
    } else {
      // Local fallback
      const uploadDir = path.join(__dirname, '../../uploads'); // Adjust path relative to controller
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const isVideo = file.mimetype.startsWith('video/');
        const filename = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
        
        const mediaObj = {
          cloudinaryId: 'local_' + filename,
          url: (process.env.BACKEND_URL || '') + '/uploads/' + filename,
          order: i
        };

        if (isVideo) {
          uploadedVideos.push(mediaObj);
        } else {
          uploadedImages.push(mediaObj);
        }
      }
    }

    // Determine cover image (prefer selected index from images, fallback to first image, then first video)
    const allMedia = [...uploadedImages, ...uploadedVideos].sort((a, b) => a.order - b.order);
    const coverImage = allMedia[cIndex] || allMedia[0];

    const gallery = new Gallery({
      title,
      category,
      description,
      featured: isFeatured,
      cardSize: cardSize || 'medium',
      coverImage: {
        cloudinaryId: coverImage.cloudinaryId,
        url: coverImage.url
      },
      images: uploadedImages,
      videos: uploadedVideos
    });

    await gallery.save();
    res.json({ success: true, data: gallery });
  } catch (err) {
    next(err);
  }
};

exports.deleteGallery = async (req, res, next) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    if (hasCloudinary) {
      for (const img of gallery.images) {
        if (!img.cloudinaryId.startsWith('local_')) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }
    }

    await gallery.deleteOne();
    res.json({ success: true, message: 'Gallery deleted' });
  } catch (err) {
    next(err);
  }
};

exports.updateGallery = async (req, res, next) => {
  try {
    const { title, category, description, featured, visibility, cardSize, coverImage, images, videos } = req.body;
    
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });

    if (title !== undefined) gallery.title = title;
    if (category !== undefined) gallery.category = category;
    if (description !== undefined) gallery.description = description;
    if (featured !== undefined) gallery.featured = featured;
    if (visibility !== undefined) gallery.visibility = visibility;
    if (cardSize !== undefined) gallery.cardSize = cardSize;
    if (coverImage !== undefined) gallery.coverImage = coverImage;
    
    if (images !== undefined) gallery.images = images;
    if (videos !== undefined) gallery.videos = videos;

    await gallery.save();
    res.json({ success: true, data: gallery });
  } catch (err) {
    next(err);
  }
};
