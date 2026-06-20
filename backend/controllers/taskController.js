// controllers/taskController.js
const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user (supports search, filter, sort)
// @route   GET /api/tasks
// @access  Private
// Query params:
//   search    - search by task title (regex, case-insensitive)
//   priority  - filter by priority (Low | Medium | High)
//   completed - filter by completion status (true | false)
//   subject   - filter by subject ID
//   sort      - sort field e.g. "dueDate", "-dueDate", "priority"
const getTasks = async (req, res, next) => {
  try {
    const { search, priority, completed, subject, sort } = req.query;
    const query = { user: req.user._id };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (priority) query.priority = priority;
    if (completed !== undefined) query.completed = completed === 'true';
    if (subject) query.subject = subject;

    let sortOption = { dueDate: 1 }; // default: nearest due date first
    if (sort) {
      const direction = sort.startsWith('-') ? -1 : 1;
      const field = sort.replace('-', '');
      sortOption = { [field]: direction };
    }

    const tasks = await Task.find(query).populate('subject', 'name colorTag').sort(sortOption);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).populate('subject', 'name colorTag');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, subject, dueDate, priority, notes, estimatedMinutes } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Task title and due date are required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      subject,
      dueDate,
      priority,
      notes,
      estimatedMinutes,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task (also used to mark complete/incomplete)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('subject', 'name colorTag');

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
