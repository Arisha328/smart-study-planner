// controllers/progressController.js
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Schedule = require('../models/Schedule');

// @desc    Get progress analytics & dynamic statistics for logged-in user
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({ user: userId }).populate('subject', 'name colorTag');
    const subjects = await Subject.find({ user: userId });
    const schedules = await Schedule.find({ user: userId });

    const completedTasks = tasks.filter((t) => t.completed);
    const pendingTasks = tasks.filter((t) => !t.completed);

    // Total study hours = sum of actualMinutes across tasks + schedule durations
    const taskMinutes = tasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
    const scheduleMinutes = schedules.reduce((sum, s) => {
      const duration = (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60);
      return sum + Math.max(duration, 0);
    }, 0);
    const totalStudyHours = ((taskMinutes + scheduleMinutes) / 60).toFixed(1);

    // Completion percentage
    const completionPercentage =
      tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

    // Subject-wise progress (based on subject.progress field, and task completion ratio)
    const subjectProgress = subjects.map((subj) => {
      const subjTasks = tasks.filter((t) => t.subject && t.subject._id.toString() === subj._id.toString());
      const subjCompleted = subjTasks.filter((t) => t.completed).length;
      const taskBasedProgress = subjTasks.length > 0 ? Math.round((subjCompleted / subjTasks.length) * 100) : 0;

      return {
        subjectId: subj._id,
        name: subj.name,
        colorTag: subj.colorTag,
        manualProgress: subj.progress,
        taskBasedProgress,
        totalTasks: subjTasks.length,
        completedTasks: subjCompleted,
      };
    });

    // Weekly study hours (last 7 days) - based on schedules
    const today = new Date();
    const weeklyHours = Array(7).fill(0);
    const dayLabels = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    schedules.forEach((s) => {
      const sDate = new Date(s.startTime);
      const diffDays = Math.floor((today - sDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        const index = 6 - diffDays;
        const durationHours = (new Date(s.endTime) - new Date(s.startTime)) / (1000 * 60 * 60);
        weeklyHours[index] += durationHours;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        completionPercentage,
        totalStudyHours: Number(totalStudyHours),
        totalSubjects: subjects.length,
        subjectProgress,
        weeklyStudyHours: {
          labels: dayLabels,
          data: weeklyHours.map((h) => Number(h.toFixed(1))),
        },
        taskPriorityBreakdown: {
          High: tasks.filter((t) => t.priority === 'High').length,
          Medium: tasks.filter((t) => t.priority === 'Medium').length,
          Low: tasks.filter((t) => t.priority === 'Low').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress };
