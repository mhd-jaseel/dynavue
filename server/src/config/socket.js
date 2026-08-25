const socketIO = require('socket.io');

const initSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://dynavue.vercel.app',
    'https://dynavue.in',
    'https://www.dynavue.in',
    process.env.CLIENT_URL
  ].filter(Boolean);

  const io = socketIO(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join', (userId) => {
      if (userId) {
        const roomId = userId.toString();
        socket.join(roomId);
        console.log(`User socket ${socket.id} joined room ${roomId}`);
      }
    });
    
    socket.on('sendMessage', (data) => {
      socket.to(data.receiver).emit('receiveMessage', data);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initSocket;
