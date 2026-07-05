// config/db.js
// Handles MongoDB connection using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/smart_study_planner';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Continuing without a database connection so the app can still boot on Railway.');
      return;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
