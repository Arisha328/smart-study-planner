// server.js
// Entry point for the Smart Study Planner backend API

const express = require('express');
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

// ===== Global Middleware =====
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '5mb' })); // parse JSON bodies (allow base64 images for profile pics)
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // request logging in dev
}

// ===== Routes =====
app.get('/', (req, res) => {
  res.json({ message: 'Smart Study Planner API is running 🚀' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ai', require('./routes/aiRoutes')); // AI Study Assistant routes

// ===== Error Handling =====
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
