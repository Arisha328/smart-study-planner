// models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    instructor: {
      type: String,
      default: '',
      trim: true,
    },
    credits: {
      type: Number,
      default: 3,
      min: 0,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    colorTag: {
      type: String,
      default: '#6366F1', // primary color default
    },
    // Progress percentage for this subject (0-100), used for analytics
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);
