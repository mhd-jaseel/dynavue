const Video = require('../../models/Video');
const cloudinary = require('../../config/cloudinary');
const stream = require('stream');
const fs = require('fs');
const path = require('path');

exports.getVideos = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category: category.toLowerCase() } : {};
    const videos = await Video.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (err) {
    next(err);
  }
};

exports.createVideo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    if (hasCloudinary) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'dynavue_videos' },
        async (error, result) => {
          if (error) return next(error);
          
          try {
            const video = new Video({
              cloudinaryId: result.public_id,
              url: result.secure_url,
              title: req.body.title,
              category: req.body.category,
              duration: req.body.duration || '0:00',
              thumbnailUrl: req.body.thumbnailUrl || result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
              featured: req.body.featured === 'true'
            });

            await video.save();
            res.json({ success: true, data: video });
          } catch (dbErr) {
            next(dbErr);
          }
        }
      );
      
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } else {
      // Local fallback
      const filename = Date.now() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
      const uploadDir = path.join(__dirname, '../../uploads'); // Adjust path relative to controller
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      
      const video = new Video({
        cloudinaryId: 'local_' + filename,
        url: (process.env.BACKEND_URL || '') + '/uploads/' + filename,
        title: req.body.title,
        category: req.body.category,
        duration: req.body.duration || '0:00',
        thumbnailUrl: (process.env.BACKEND_URL || '') + '/uploads/' + filename,
        featured: req.body.featured === 'true'
      });

      await video.save();
      res.json({ success: true, data: video });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
    await video.deleteOne();
    
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    next(err);
  }
};
