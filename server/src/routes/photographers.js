const express = require('express');
const router = express.Router();
const photographersController = require('../controllers/photographers/photographersController');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.get('/', photographersController.getPhotographers);
router.post('/', auth, uploadMiddleware.single('image'), photographersController.createPhotographer);
router.put('/reorder', auth, photographersController.reorderPhotographers);
router.put('/:id', auth, uploadMiddleware.single('image'), photographersController.updatePhotographer);
router.delete('/:id', auth, photographersController.deletePhotographer);

module.exports = router;
