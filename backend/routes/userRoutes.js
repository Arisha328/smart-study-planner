// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  changePassword,
  updateSettings,
} = require('../controllers/userController');

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.put('/change-password', changePassword);
router.put('/settings', updateSettings);

module.exports = router;
