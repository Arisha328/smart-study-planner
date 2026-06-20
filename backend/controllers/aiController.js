// controllers/aiController.js
// AI Study Assistant - uses OpenAI API to:
//  1. Suggest a study schedule based on current workload
//  2. Predict how long pending tasks will take to complete
//  3. Recommend a personalized daily study plan

const { getOpenAIClient, AI_MODEL } = require('../config/openai');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const Schedule = require('../models/Schedule');

/**
 * Build a compact summary of the user's workload to send as context to the AI.
 */
const buildWorkloadContext = async (userId) => {
  const subjects = await Subject.find({ user: userId }).select('name priority credits progress');
  const pendingTasks = await Task.find({ user: userId, completed: false })
    .populate('subject', 'name')
    .sort({ dueDate: 1 })
    .limit(30);
  const upcomingSchedules = await Schedule.find({
    user: userId,
    startTime: { $gte: new Date() },
  })
    .populate('subject', 'name')
    .sort({ startTime: 1 })
    .limit(20);

  return {
    subjects: subjects.map((s) => ({
      name: s.name,
      priority: s.priority,
      credits: s.credits,
      progress: s.progress,
    })),
    pendingTasks: pendingTasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      subject: t.subject ? t.subject.name : 'General',
      dueDate: t.dueDate,
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes,
      notes: t.notes,
    })),
    upcomingSchedules: upcomingSchedules.map((s) => ({
      title: s.title,
      subject: s.subject ? s.subject.name : 'General',
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  };
};

/**
 * Call the OpenAI API expecting strict JSON response.
 */
const callOpenAIForJSON = async (systemPrompt, userPrompt) => {
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

// @desc    Generate AI-suggested study schedule
// @route   POST /api/ai/suggest-schedule
// @access  Private
const suggestSchedule = async (req, res, next) => {
  try {
    const { startDate, endDate, dailyAvailableHours } = req.body;
    const context = await buildWorkloadContext(req.user._id);

    if (context.pendingTasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: { message: 'No pending tasks found. Add some tasks to get a study schedule suggestion.', sessions: [] },
      });
    }

    const systemPrompt = `You are an expert academic study planner AI. Given a student's subjects, pending tasks, and upcoming schedule, generate a realistic, balanced study schedule. Always respond with valid JSON only, matching this exact shape:
{
  "summary": "short overall summary string",
  "sessions": [
    {
      "title": "string - short session title",
      "subject": "string - subject name",
      "relatedTaskId": "string or null",
      "date": "YYYY-MM-DD",
      "startTime": "HH:MM (24h)",
      "endTime": "HH:MM (24h)",
      "reason": "short string explaining why this session was scheduled"
    }
  ]
}
Do not include any text outside the JSON object.`;

    const userPrompt = `Plan a study schedule for the student.
Date range: ${startDate || 'starting today'} to ${endDate || '7 days from today'}.
Daily available study time: ${dailyAvailableHours || 3} hours.
Today's date: ${new Date().toISOString().split('T')[0]}.

Student data:
${JSON.stringify(context, null, 2)}

Prioritize tasks with high priority and nearer due dates. Avoid overlapping with the student's existing upcoming schedules. Distribute sessions evenly and balance across subjects.`;

    const aiResponse = await callOpenAIForJSON(systemPrompt, userPrompt);
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('AI suggestSchedule error:', error.message);
    next(error);
  }
};

// @desc    Predict completion time for pending tasks
// @route   POST /api/ai/predict-completion
// @access  Private
const predictCompletion = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const query = { user: req.user._id, completed: false };
    if (taskId) query._id = taskId;

    const tasks = await Task.find(query).populate('subject', 'name priority');

    if (tasks.length === 0) {
      return res.status(200).json({ success: true, data: { predictions: [] } });
    }

    const taskData = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      subject: t.subject ? t.subject.name : 'General',
      subjectPriority: t.subject ? t.subject.priority : 'Medium',
      priority: t.priority,
      dueDate: t.dueDate,
      currentEstimateMinutes: t.estimatedMinutes,
      notes: t.notes,
    }));

    const systemPrompt = `You are an AI that predicts realistic task completion times for a student. Always respond with valid JSON only:
{
  "predictions": [
    {
      "taskId": "string",
      "title": "string",
      "predictedMinutes": number,
      "confidence": "Low" | "Medium" | "High",
      "reasoning": "short string"
    }
  ]
}
Do not include any text outside the JSON object.`;

    const userPrompt = `Predict realistic completion times (in minutes) for these pending tasks. Consider complexity, subject priority, and due date urgency.

Tasks:
${JSON.stringify(taskData, null, 2)}`;

    const aiResponse = await callOpenAIForJSON(systemPrompt, userPrompt);
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('AI predictCompletion error:', error.message);
    next(error);
  }
};

// @desc    Recommend a personalized daily study plan
// @route   GET /api/ai/daily-plan
// @access  Private
const dailyPlan = async (req, res, next) => {
  try {
    const context = await buildWorkloadContext(req.user._id);

    if (context.pendingTasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'No pending tasks today. Great job staying on top of things! Consider reviewing notes or getting ahead on upcoming material.',
          plan: [],
        },
      });
    }

    const systemPrompt = `You are an AI study coach. Recommend a focused plan for TODAY only. Always respond with valid JSON only:
{
  "greetingMessage": "short motivational message string",
  "totalRecommendedMinutes": number,
  "plan": [
    {
      "taskId": "string or null",
      "title": "string",
      "subject": "string",
      "recommendedMinutes": number,
      "priority": "Low" | "Medium" | "High",
      "tip": "short actionable study tip"
    }
  ]
}
Do not include any text outside the JSON object.`;

    const userPrompt = `Today's date: ${new Date().toISOString().split('T')[0]}.
Recommend what to focus on today, ordered by urgency. Keep total time realistic (2-5 hrs). Limit to at most 5 plan items.

Student data:
${JSON.stringify(context, null, 2)}`;

    const aiResponse = await callOpenAIForJSON(systemPrompt, userPrompt);
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    console.error('AI dailyPlan error:', error.message);
    next(error);
  }
};

module.exports = { suggestSchedule, predictCompletion, dailyPlan };
