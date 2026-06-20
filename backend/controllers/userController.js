// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, university, department, profilePicture } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (university !== undefined) user.university = university;
    if (department !== undefined) user.department = department;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword; // will be hashed by pre-save hook
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings (dark mode, notifications)
// @route   PUT /api/users/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const { darkMode, emailNotifications, reminderNotifications } = req.body;

    const user = await User.findById(req.user._id);

    if (darkMode !== undefined) user.settings.darkMode = darkMode;
    if (emailNotifications !== undefined) user.settings.emailNotifications = emailNotifications;
    if (reminderNotifications !== undefined) user.settings.reminderNotifications = reminderNotifications;

    await user.save();

    res.status(200).json({ success: true, data: user.settings });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword, updateSettings };
