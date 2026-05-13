const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const serviceRoutes = require('./routes/services');
const enquiryRoutes = require('./routes/enquiries');
const adminRoutes = require('./routes/admin');
const photographerRoutes = require('./routes/photographers');
const videoRoutes = require('./routes/videos');
const categoryRoutes = require('./routes/categories');
const galleryRoutes = require('./routes/galleries');
const homeHighlightRoutes = require('./routes/homeHighlights');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const bookingRequestRoutes = require('./routes/bookingRequests');
const aboutRoutes = require('./routes/about');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://dynavue.in',
  'https://www.dynavue.in',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/photographers', photographerRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/home-highlights', homeHighlightRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/booking-requests', bookingRequestRoutes);
app.use('/api/about', aboutRoutes);

// Test route for connectivity
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected successfully!', timestamp: new Date() });
});

app.use(errorHandler);

// Unified UI Strategy:
if (process.env.NODE_ENV !== 'production') {
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
    filter: (pathname) => !pathname.startsWith('/api')
  }));
} else {
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, '../../client/dist/sitemap.xml'));
  });
  
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.sendFile(path.join(__dirname, '../../client/dist/robots.txt'));
  });

  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

module.exports = app;
