const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher', 'name email');
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Protected/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get single subject
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('teacher');
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Protected/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Protected/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
