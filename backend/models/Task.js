// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: false,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    notes: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // Estimated time (in minutes) to complete the task - used by AI assistant
    estimatedMinutes: {
      type: Number,
      default: 60,
      min: 0,
    },
    // Actual time spent (in minutes) - optional, helps AI learn patterns
    actualMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
