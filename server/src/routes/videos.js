const express = require('express');
const router = express.Router();
const videosController = require('../controllers/videos/videosController');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');

router.get('/', videosController.getVideos);
router.post('/', auth, uploadMiddleware.single('video'), videosController.createVideo);
router.delete('/:id', auth, videosController.deleteVideo);

module.exports = router;
