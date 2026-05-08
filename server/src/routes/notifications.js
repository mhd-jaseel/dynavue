const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications/notificationsController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationsController.getNotifications);
router.put('/:id/read', auth, notificationsController.markAsRead);
router.put('/read-all', auth, notificationsController.markAllAsRead);
router.delete('/delete-all', auth, notificationsController.deleteAllNotifications);
router.delete('/:id', auth, notificationsController.deleteNotification);

module.exports = router;
