const Message = require('../../models/Message');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const admin = require('../../config/firebase');

exports.getMessages = async (req, res) => {
  try {
    let otherUserId = req.params.otherUserId;
    
    if (!otherUserId) {
      // Find admin user
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) return res.status(404).json({ success: false, message: 'Admin not found' });
      otherUserId = adminUser._id;
    }
    
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: -1 }).limit(20);
    
    // Reverse to show in chronological order for chat UI
    messages.reverse();
    
    res.json({ success: true, data: messages, otherUserId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  let responseSent = false;
  try {
    let { receiver, text, image } = req.body;
    
    if (!receiver) {
      // Find admin user
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        responseSent = true;
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      receiver = adminUser._id;
    }
    
    const message = new Message({
      sender: req.user.id,
      receiver,
      text,
      image
    });
    await message.save();

    // Create notification for receiver
    const senderDetails = await User.findById(req.user.id).select('name');
    const notification = new Notification({
      receiver,
      sender: req.user.id,
      type: 'message',
      title: `New message from ${senderDetails?.name || 'User'}`,
      message: text || 'Sent an image',
      relatedId: message._id
    });
    await notification.save();

    const io = req.app.get('io');
    if (io) {
      io.to(receiver.toString()).emit('receiveMessage', message);
      io.to(receiver.toString()).emit('receiveNotification', notification);
    }

    res.json({ success: true, data: message, notification });
    responseSent = true;

    // Send push notification via FCM
    const receiverDetails = await User.findById(receiver).select('fcmToken');
    
    if (receiverDetails?.fcmToken && admin.apps.length > 0) {
      const payload = {
        notification: {
          title: `New message from ${senderDetails?.name || 'User'}`,
          body: text || 'Sent an image'
        },
        token: receiverDetails.fcmToken
      };
      
      try {
        await admin.messaging().send(payload);
        console.log('Push notification sent successfully');
      } catch (err) {
        console.error('Failed to send push notification', err);
      }
    }
  } catch (err) {
    if (!responseSent && !res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      console.error('Error after response sent:', err);
    }
  }
};

exports.getAllConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).sort({ createdAt: -1 });

    const conversations = [];
    const seenUsers = new Set();

    for (const msg of messages) {
      const otherUser = msg.sender.toString() === req.user.id ? msg.receiver : msg.sender;
      if (!seenUsers.has(otherUser.toString())) {
        seenUsers.add(otherUser.toString());
        
        // Fetch user details
        const userDetails = await User.findById(otherUser).select('name email');
        
        conversations.push({
          userId: otherUser,
          userName: userDetails?.name || 'Unknown User',
          lastMessage: msg.text || 'Image',
          timestamp: msg.createdAt,
          isRead: msg.isRead
        });
      }
    }

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
