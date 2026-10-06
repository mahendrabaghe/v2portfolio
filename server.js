const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

// Load environment variables
dotenv.config();

// Import Models
const { User } = require('./models');

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (!existingAdmin) {
      await User.create({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD
      });
      console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
    } else {
      console.log(`Admin account confirmed: ${existingAdmin.email}`);
    }
  } catch (err) {
    console.error('Error verifying/creating admin account:', err.message);
  }
};

// Connect to MongoDB Atlas (with graceful local development fallback)
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB Connected to remote cluster');
      await ensureDefaultAdmin();
      return;
    } catch (err) {
      console.error('Remote MongoDB connection failed:', err.message);
      if (process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: In production, check MONGODB_URI and MongoDB Atlas Network Access (allow 0.0.0.0/0).');
      }
    }
  } else {
    console.warn('Warning: MONGODB_URI environment variable is not defined.');
  }

  // Fallback for development if remote connection failed
  if (process.env.NODE_ENV !== 'production') {
    try {
      let MongoMemoryServer;
      try {
        MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
      } catch (e) {
        MongoMemoryServer = require('./server/node_modules/mongodb-memory-server').MongoMemoryServer;
      }
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('MongoDB Connected to in-memory server');
      await ensureDefaultAdmin();
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr.message);
    }
  }
};

connectDB();

const app = express();

// ---------------------------------------------------------------
// CORS — open for local development
// When you deploy to GitHub Pages + Render, replace this block with
// the production allowedOrigins list that is commented below.
// ---------------------------------------------------------------
app.use(cors({
  origin: true,          // allow any origin while working locally
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/*
// --- PRODUCTION CORS (uncomment when deploying) ---
const allowedOrigins = [
  'https://mahendrabaghe.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

if (process.env.CLIENT_ORIGIN) {
  process.env.CLIENT_ORIGIN.split(',').forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.github.io');
    if (isAllowed) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
*/
app.use(express.json());

// Cache headers for static files
app.use((req, res, next) => {
  const isApi = req.path.startsWith('/api/');
  const isHtml = req.path === '/' || req.path.endsWith('.html');
  const isAsset = /\.(js|css|png|jpe?g|gif|svg|webp|pdf|json)$/i.test(req.path);

  if (isApi || isHtml) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else if (isAsset) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  }

  next();
});

const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, 'server', 'uploads'));
app.use('/uploads', express.static(uploadDirectory, { dotfiles: 'deny', index: false }));

// Serve static frontend files if hosted together locally
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false,
  lastModified: false
}));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio API is running'
  });
});

// API Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/profile', require('./server/routes/profile'));
app.use('/api/experiences', require('./server/routes/experiences'));
app.use('/api/projects', require('./server/routes/projects'));
app.use('/api/skills', require('./server/routes/skills'));
app.use('/api/education', require('./server/routes/education'));
app.use('/api/certifications', require('./server/routes/certifications'));
app.use('/api/messages', require('./server/routes/messages'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Server listener
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
