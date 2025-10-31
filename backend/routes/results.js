const express = require('express');
const router = express.Router();
const FinalResult = require('../models/FinalResult');
const MarkRecord = require('../models/MarkRecord');
const { protect, authorize } = require('../middleware/auth');
const { Parser } = require('json2csv');

// @route   GET /api/results/:examId
// @desc    Get all results for an exam
// @access  Protected
router.get('/:examId', protect, async (req, res) => {
  try {
    const results = await FinalResult.find({ exam: req.params.examId })
      .populate('student', 'studentId fullName program batch section')
      .populate('exam', 'examCode title');

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/results/finalize/:examId
// @desc    Finalize results for an exam (aggregate marks)
// @access  Protected/Admin
router.post('/finalize/:examId', protect, authorize('admin'), async (req, res) => {
  try {
    // Get all mark records for this exam
    const markRecords = await MarkRecord.find({ exam: req.params.examId, finalized: true });

    // Group by student
    const studentMarks = {};
    for (const record of markRecords) {
      const studentId = record.student.toString();
      if (!studentMarks[studentId]) {
        studentMarks[studentId] = {
          perQuestion: [],
          totalScore: 0
        };
      }

      studentMarks[studentId].perQuestion.push({
        questionLabel: record.questionLabel,
        score: record.provisionalScore || 0
      });
      studentMarks[studentId].totalScore += record.provisionalScore || 0;
    }

    // Create or update final results
    const results = [];
    for (const [studentId, marks] of Object.entries(studentMarks)) {
      const result = await FinalResult.findOneAndUpdate(
        { exam: req.params.examId, student: studentId },
        {
          exam: req.params.examId,
          student: studentId,
          perQuestion: marks.perQuestion,
          totalScore: marks.totalScore,
          status: 'finalized'
        },
        { upsert: true, new: true }
      );
      results.push(result);
    }

    res.json({
      success: true,
      message: 'Results finalized',
      count: results.length,
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/results/export/:examId/csv
// @desc    Export results as CSV
// @access  Protected/Admin
router.get('/export/:examId/csv', protect, authorize('admin'), async (req, res) => {
  try {
    const results = await FinalResult.find({ exam: req.params.examId })
      .populate('student', 'studentId fullName')
      .populate('exam', 'examCode title');

    // Prepare data for CSV
    const csvData = results.map(result => {
      const row = {
        studentId: result.student.studentId,
        studentName: result.student.fullName,
        examCode: result.exam.examCode,
        totalScore: result.totalScore
      };

      // Add per-question scores
      result.perQuestion.forEach(q => {
        row[q.questionLabel] = q.score;
      });

      return row;
    });

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results-${req.params.examId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
