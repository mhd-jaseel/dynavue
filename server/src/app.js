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
  'https://dynavue.vercel.app',
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
app.use((req, res, next) => {
  // Essential headers for OAuth and SEO
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Security Headers to fix the report issues
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy - Optimized for Dynavue production
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://accounts.google.com ws: wss:",
    "frame-src 'self' https://accounts.google.com",
    "media-src 'self' https://res.cloudinary.com",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ');
  // res.setHeader('Content-Security-Policy', csp);

  next();
});
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
  app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/public/robots.txt'));
  });

  app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/public/sitemap.xml'));
  });

  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.use(errorHandler);

module.exports = app;
