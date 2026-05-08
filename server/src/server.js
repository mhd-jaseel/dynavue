require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./config/socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`\n  ➜  Backend: http://localhost:${PORT}/`);
    console.log(`  ➜  Frontend: http://localhost:5173/ (Dev)`);
  });

  const io = initSocket(server);
  app.set('io', io);
};

startServer();
