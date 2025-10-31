const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/exams
// @desc    Get all exams
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const { status, subject } = req.query;
    const query = {};

    if (status) query.status = status;
    if (subject) query.subject = subject;

    const exams = await Exam.find(query).populate('subject');
    res.json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Protected/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Generate privateSeed and publicCode if not provided
    const privateSeed = req.body.privateSeed || crypto.randomBytes(32).toString('hex');
    const publicCode = req.body.publicCode || `EXAM-${Date.now()}`;

    const exam = await Exam.create({
      ...req.body,
      privateSeed,
      publicCode
    });

    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('subject');
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Protected/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Protected/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
