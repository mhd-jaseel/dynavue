const express = require('express');
const router = express.Router();
const galleriesController = require('../controllers/galleries/galleriesController');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.get('/', galleriesController.getGalleries);
router.post('/', auth, uploadMiddleware.array('media', 50), galleriesController.createGallery);
router.delete('/:id', auth, galleriesController.deleteGallery);
router.put('/:id', auth, galleriesController.updateGallery);

module.exports = router;
