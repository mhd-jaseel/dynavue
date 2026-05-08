# DYNAVUE Backend

Professional backend for the DYNAVUE photography platform.

## Architecture

The backend follows a clean, modular architecture:

```
server/
│
├── src/
│   ├── config/         # Database and third-party service configurations
│   ├── controllers/    # Business logic for each feature
│   ├── middleware/     # Express middleware (auth, error handling, etc.)
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── services/       # Helper services (optional/future use)
│   ├── sockets/        # Socket.io event handlers (optional/future use)
│   ├── utils/          # Utility functions (optional/future use)
│   ├── validations/    # Request validation schemas (optional/future use)
│   ├── app.js          # Express application setup
│   └── server.js       # Server startup and socket initialization
│
├── scripts/            # Database seeding and maintenance scripts
├── tests/              # Test files
├── uploads/            # Local uploads directory (fallback)
├── .env                # Environment variables
├── package.json
└── README.md
```

## Setup

1. Install dependencies: `npm install`
2. Configure `.env` file with MongoDB URI, Cloudinary keys, and Firebase keys.
3. Run development server: `npm run dev`

## Scripts

- `npm start`: Run production server
- `npm run dev`: Run development server with nodemon
