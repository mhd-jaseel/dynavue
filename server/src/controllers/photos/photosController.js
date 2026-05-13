const Photo = require('../../models/Photo');
const cloudinary = require('../../config/cloudinary');
const stream = require('stream');
const fs = require('fs');
const path = require('path');

exports.getPhotos = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category: category.toLowerCase() } : {};
    const photos = await Photo.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: photos });
  } catch (err) {
    next(err);
  }
};

exports.createPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

    if (hasCloudinary) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'dynavue' },
        async (error, result) => {
          if (error) return next(error);

          try {
            const photo = new Photo({
              cloudinaryId: result.public_id,
              url: result.secure_url,
              title: req.body.title,
              description: req.body.description,
              category: req.body.category,
              width: result.width,
              height: result.height,
              featured: req.body.featured === 'true'
            });

            await photo.save();
            res.json({ success: true, data: photo });
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
      
      const photo = new Photo({
        cloudinaryId: 'local_' + filename,
        url: (process.env.BACKEND_URL || '') + '/uploads/' + filename,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        width: 800,
        height: 600,
        featured: req.body.featured === 'true'
      });

      await photo.save();
      res.json({ success: true, data: photo });
    }
  } catch (err) {
    next(err);
  }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    await cloudinary.uploader.destroy(photo.cloudinaryId);
    await photo.deleteOne();
    
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
};
