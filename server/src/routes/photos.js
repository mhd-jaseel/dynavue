const express = require('express');
const router = express.Router();
const photosController = require('../controllers/photos/photosController');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.get('/', photosController.getPhotos);
router.post('/', auth, uploadMiddleware.single('image'), photosController.createPhoto);
router.delete('/:id', auth, photosController.deletePhoto);

module.exports = router;
