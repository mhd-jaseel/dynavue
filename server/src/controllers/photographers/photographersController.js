const Photographer = require('../../models/Photographer');
const cloudinary = require('../../config/cloudinary');

exports.getPhotographers = async (req, res, next) => {
  try {
    const filter = req.query.active === 'true' ? { active: true } : {};
    const photographers = await Photographer.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: photographers });
  } catch (err) {
    next(err);
  }
};

exports.createPhotographer = async (req, res, next) => {
  try {
    let imageUrl = null;
    let cloudinaryId = null;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

      try {
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'dynavue_team' });
        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (cloudinaryErr) {
        console.warn('Cloudinary upload failed, falling back to data URI. Error:', cloudinaryErr.message);
        imageUrl = dataURI;
        cloudinaryId = null;
      }
    }

    const newPhotographer = new Photographer({
      name: req.body.name,
      role: req.body.role,
      bio: req.body.bio,
      experience: req.body.experience,
      instagram: req.body.instagram,
      facebook: req.body.facebook,
      website: req.body.website,
      image: imageUrl,
      cloudinaryId: cloudinaryId,
      active: req.body.active !== 'false',
      order: req.body.order || 0
    });

    await newPhotographer.save();
    res.json({ success: true, data: newPhotographer });
  } catch (err) {
    next(err);
  }
};

exports.reorderPhotographers = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index }
      }
    }));

    if (bulkOps.length > 0) {
      await Photographer.bulkWrite(bulkOps);
    }
    
    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    next(err);
  }
};

exports.updatePhotographer = async (req, res, next) => {
  try {
    const photographer = await Photographer.findById(req.params.id);
    if (!photographer) return res.status(404).json({ success: false, message: 'Photographer not found' });

    let imageUrl = photographer.image;
    let cloudinaryId = photographer.cloudinaryId;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      
      try {
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'dynavue_team' });
        
        // Delete old image if it exists
        if (cloudinaryId) {
          await cloudinary.uploader.destroy(cloudinaryId).catch(e => console.warn('Failed to delete old image from Cloudinary:', e.message));
        }

        imageUrl = result.secure_url;
        cloudinaryId = result.public_id;
      } catch (cloudinaryErr) {
        console.warn('Cloudinary upload failed, falling back to data URI. Error:', cloudinaryErr.message);
        imageUrl = dataURI;
        cloudinaryId = null;
      }
    }

    photographer.name = req.body.name || photographer.name;
    photographer.role = req.body.role || photographer.role;
    photographer.bio = req.body.bio !== undefined ? req.body.bio : photographer.bio;
    photographer.experience = req.body.experience !== undefined ? req.body.experience : photographer.experience;
    photographer.instagram = req.body.instagram !== undefined ? req.body.instagram : photographer.instagram;
    photographer.facebook = req.body.facebook !== undefined ? req.body.facebook : photographer.facebook;
    photographer.website = req.body.website !== undefined ? req.body.website : photographer.website;
    photographer.active = req.body.active !== undefined ? req.body.active === 'true' || req.body.active === true : photographer.active;
    photographer.order = req.body.order !== undefined ? parseInt(req.body.order, 10) : photographer.order;
    photographer.image = imageUrl;
    photographer.cloudinaryId = cloudinaryId;

    await photographer.save();
    res.json({ success: true, data: photographer });
  } catch (err) {
    next(err);
  }
};

exports.deletePhotographer = async (req, res, next) => {
  try {
    const photographer = await Photographer.findById(req.params.id);
    if (!photographer) return res.status(404).json({ success: false, message: 'Photographer not found' });

    if (photographer.cloudinaryId) {
      await cloudinary.uploader.destroy(photographer.cloudinaryId);
    }
    await photographer.deleteOne();
    
    res.json({ success: true, message: 'Photographer deleted' });
  } catch (err) {
    next(err);
  }
};
