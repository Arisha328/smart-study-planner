// controllers/subjectController.js
const Subject = require('../models/Subject');

// @desc    Get all subjects for logged-in user (supports search via ?search=)
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const subjects = await Subject.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    const { name, instructor, credits, priority, colorTag } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Subject name is required' });
    }

    const subject = await Subject.create({
      user: req.user._id,
      name,
      instructor,
      credits,
      priority,
      colorTag,
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await subject.deleteOne();

    res.status(200).json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
