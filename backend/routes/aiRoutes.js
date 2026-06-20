// routes/aiRoutes.js
// Routes for the AI Study Assistant (powered by OpenAI API)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { suggestSchedule, predictCompletion, dailyPlan } = require('../controllers/aiController');

router.use(protect);

// POST /api/ai/suggest-schedule - generate AI study schedule suggestions
router.post('/suggest-schedule', suggestSchedule);

// POST /api/ai/predict-completion - predict task completion times
router.post('/predict-completion', predictCompletion);

// GET /api/ai/daily-plan - recommend today's study plan
router.get('/daily-plan', dailyPlan);

module.exports = router;
