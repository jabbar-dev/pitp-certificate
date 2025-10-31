const express = require('express');
const router = express.Router();
const MarkRecord = require('../models/MarkRecord');
const PageImage = require('../models/PageImage');
const { protect } = require('../middleware/auth');

// @route   GET /api/marking/tasks
// @desc    Get marking tasks for current user
// @access  Protected
router.get('/tasks', protect, async (req, res) => {
  try {
    // Get all mark records assigned to this marker or unassigned pages
    const tasks = await MarkRecord.find({ marker: req.user.id })
      .populate('exam', 'examCode title')
      .populate('student', 'studentId fullName')
      .populate('pageImage');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/marking/submit
// @desc    Submit marking for a question
// @access  Protected
router.post('/submit', protect, async (req, res) => {
  try {
    const { exam, student, questionLabel, comments, provisionalScore, finalized } = req.body;

    // Create or update mark record
    const markRecord = await MarkRecord.findOneAndUpdate(
      { exam, student, questionLabel, marker: req.user.id },
      {
        exam,
        student,
        questionLabel,
        marker: req.user.id,
        comments,
        provisionalScore,
        finalized: finalized || false
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: markRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/marking/exam/:examId/student/:studentId
// @desc    Get all marks for a student in an exam
// @access  Protected
router.get('/exam/:examId/student/:studentId', protect, async (req, res) => {
  try {
    const marks = await MarkRecord.find({
      exam: req.params.examId,
      student: req.params.studentId
    })
      .populate('marker', 'name')
      .populate('rubricItem');

    res.json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
