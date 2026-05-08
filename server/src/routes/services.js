const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const servicesController = require('../controllers/services/servicesController');

router.get('/', servicesController.getServices);
router.post('/', auth, uploadMiddleware.single('image'), servicesController.createService);
router.put('/:id', auth, uploadMiddleware.single('image'), servicesController.updateService);
router.delete('/:id', auth, servicesController.deleteService);

module.exports = router;
