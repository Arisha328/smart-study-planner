// server.js
// Entry point for the Smart Study Planner backend API

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Global Middleware =====
const clientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : ['*'];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server or curl requests
    if (clientUrls.includes('*') || clientUrls.includes(origin)) {
      return callback(null, true);
    }
    // Allow common localhost origins even if CLIENT_URL is set
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostPattern.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' })); // parse JSON bodies (allow base64 images for profile pics)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // request logging in dev
}

// ===== Routes =====
app.get('/api', (req, res) => {
  res.json({ message: 'Smart Study Planner API is running 🚀' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes')); // AI Study Assistant routes

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ===== Error Handling =====
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
