const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages/messagesController');
const auth = require('../middleware/auth');

router.get('/:otherUserId?', auth, messagesController.getMessages);
router.post('/', auth, messagesController.sendMessage);
router.get('/conversations/all', auth, messagesController.getAllConversations);

module.exports = router;
