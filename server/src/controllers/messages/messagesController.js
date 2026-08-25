const Message = require('../../models/Message');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const admin = require('../../config/firebase');

exports.getMessages = async (req, res) => {
  try {
    let otherUserId = req.params.otherUserId;
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const adminObjectIds = adminUsers.map(a => a._id);

    let query;
    if (req.user.role === 'admin') {
      if (!otherUserId) {
        return res.json({ success: true, data: [], otherUserId: null });
      }
      query = {
        $or: [
          { sender: otherUserId, receiver: { $in: adminObjectIds } },
          { sender: { $in: adminObjectIds }, receiver: otherUserId }
        ]
      };
    } else {
      let targetAdminId = otherUserId;
      if (!targetAdminId) {
        targetAdminId = adminObjectIds[0];
      }
      query = {
        $or: [
          { sender: req.user.id, receiver: { $in: adminObjectIds } },
          { sender: { $in: adminObjectIds }, receiver: req.user.id }
        ]
      };
      otherUserId = targetAdminId;
    }

    const messages = await Message.find(query).sort({ createdAt: -1 }).limit(50);

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
      if (req.user.role !== 'admin') {
        // Broadcast real-time message to all active admin rooms
        const adminUsers = await User.find({ role: 'admin' }).select('_id');
        adminUsers.forEach(adm => {
          io.to(adm._id.toString()).emit('receiveMessage', message);
          io.to(adm._id.toString()).emit('receiveNotification', notification);
        });
      } else {
        // Admin sending directly to customer
        io.to(receiver.toString()).emit('receiveMessage', message);
        io.to(receiver.toString()).emit('receiveNotification', notification);
      }
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
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const adminObjectIds = adminUsers.map(a => a._id);
    const adminIdStrings = adminUsers.map(a => a._id.toString());

    let query;
    if (req.user.role === 'admin') {
      query = {
        $or: [
          { receiver: { $in: adminObjectIds } },
          { sender: { $in: adminObjectIds } },
          { sender: req.user.id },
          { receiver: req.user.id }
        ]
      };
    } else {
      query = {
        $or: [{ sender: req.user.id }, { receiver: req.user.id }]
      };
    }

    const messages = await Message.find(query).sort({ createdAt: -1 });

    const conversations = [];
    const seenUsers = new Set();

    for (const msg of messages) {
      let otherUser;
      if (req.user.role === 'admin') {
        otherUser = adminIdStrings.includes(msg.sender.toString()) ? msg.receiver : msg.sender;
      } else {
        otherUser = msg.sender.toString() === req.user.id ? msg.receiver : msg.sender;
      }

      if (otherUser && !seenUsers.has(otherUser.toString())) {
        seenUsers.add(otherUser.toString());
        
        // Fetch user details
        const userDetails = await User.findById(otherUser).select('name email');
        if (userDetails) {
          conversations.push({
            userId: otherUser,
            userName: userDetails.name || 'Unknown User',
            lastMessage: msg.text || (msg.image ? 'Image' : ''),
            timestamp: msg.createdAt,
            isRead: msg.isRead
          });
        }
      }
    }

    res.json({ success: true, data: conversations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
