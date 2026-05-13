const Service = require('../../models/Service');
const cloudinary = require('../../config/cloudinary');
const stream = require('stream');
const fs = require('fs');
const path = require('path');

// Helper function to upload buffer to cloudinary via stream
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'dynavue_services' },
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

exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    let imageUrl = '';
    let cloudinaryId = '';
    
    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
      if (hasCloudinary) {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } else {
        const uploadDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = Date.now() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        imageUrl = (process.env.BACKEND_URL || '') + '/uploads/' + filename;
        cloudinaryId = 'local_' + filename;
      }
    }

    const { title, subtitle, description, features, price, order, featuredOnHome, visibility } = req.body;

    const service = new Service({
      title,
      subtitle,
      description,
      features: features ? JSON.parse(features) : [],
      price,
      image: { url: imageUrl, cloudinaryId },
      order: order || 0,
      featuredOnHome: featuredOnHome === 'true',
      visibility: visibility !== 'false',
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    });

    await service.save();
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    if (req.file) {
      const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
      if (hasCloudinary) {
        const result = await uploadToCloudinary(req.file.buffer);
        service.image.url = result.secure_url;
        service.image.cloudinaryId = result.public_id;
      } else {
        const uploadDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = Date.now() + '-' + req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
        service.image.url = (process.env.BACKEND_URL || '') + '/uploads/' + filename;
        service.image.cloudinaryId = 'local_' + filename;
      }
    }

    const { title, subtitle, description, features, price, order, featuredOnHome, visibility } = req.body;

    if (title !== undefined) {
      service.title = title;
      service.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (subtitle !== undefined) service.subtitle = subtitle;
    if (description !== undefined) service.description = description;
    if (features !== undefined) service.features = JSON.parse(features);
    if (price !== undefined) service.price = price;
    if (order !== undefined) service.order = order;
    if (featuredOnHome !== undefined) service.featuredOnHome = featuredOnHome === 'true';
    if (visibility !== undefined) service.visibility = visibility === 'true';

    await service.save();
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    
    await service.deleteOne();
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};
