const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const requiredEnvironmentVariables = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
  requiredEnvironmentVariables.push('MONGODB_URI');
}
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(name => !process.env[name]);
if (missingEnvironmentVariables.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`);
}

// Import Models
const { User, mongoose } = require('./models');

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ensureDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN_EMAIL });
    if (!existingAdmin) {
      await User.create({
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD
      });
      console.log('Default admin created.');
    } else {
      console.log('Admin account confirmed.');
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
      console.log('Falling back to in-memory DB for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
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

// Allowed CORS origins (GitHub Pages production + local dev environments)
const allowedOrigins = [
  'https://v2portfolio-pdnu.onrender.com',
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
    // Allow server-to-server requests, curl, mobile apps, or health checks with no origin header
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.github.io');
    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'));
app.use('/uploads', express.static(uploadDirectory, { dotfiles: 'deny', index: false }));

// Health Check Endpoint (Required by requirement 7)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio API is running'
  });
});

// Root API information endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio API is running. Health check at /api/health'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/education', require('./routes/education'));
app.use('/api/certifications', require('./routes/certifications'));
app.use('/api/messages', require('./routes/messages'));

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

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

// Server listener (Required: process.env.PORT || 5000 and 0.0.0.0 host)
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
