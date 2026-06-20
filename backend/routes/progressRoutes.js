// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProgress } = require('../controllers/progressController');

router.use(protect);

// GET /api/progress
router.get('/', getProgress);

module.exports = router;
