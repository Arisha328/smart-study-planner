// controllers/scheduleController.js
const Schedule = require('../models/Schedule');

// @desc    Get all schedules for logged-in user (supports date range via ?from=&to=)
// @route   GET /api/schedules
// @access  Private
const getSchedules = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = { user: req.user._id };

    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to) query.startTime.$lte = new Date(to);
    }

    const schedules = await Schedule.find(query).populate('subject', 'name colorTag').sort({ startTime: 1 });

    res.status(200).json({ success: true, count: schedules.length, data: schedules });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single schedule by ID
// @route   GET /api/schedules/:id
// @access  Private
const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id }).populate('subject', 'name colorTag');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new study session/schedule
// @route   POST /api/schedules
// @access  Private
const createSchedule = async (req, res, next) => {
  try {
    const { title, subject, startTime, endTime, notes, aiGenerated } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Title, startTime and endTime are required' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ success: false, message: 'startTime must be before endTime' });
    }

    const schedule = await Schedule.create({
      user: req.user._id,
      title,
      subject,
      startTime,
      endTime,
      notes,
      aiGenerated: !!aiGenerated,
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
// @access  Private
const updateSchedule = async (req, res, next) => {
  try {
    let schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name colorTag');

    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
// @access  Private
const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, user: req.user._id });

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await schedule.deleteOne();

    res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
