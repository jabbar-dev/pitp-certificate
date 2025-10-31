const express = require('express');
const router = express.Router();
const RubricItem = require('../models/RubricItem');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/rubrics/:examId
// @desc    Get rubrics for an exam
// @access  Protected
router.get('/:examId', protect, async (req, res) => {
  try {
    const rubrics = await RubricItem.find({ exam: req.params.examId })
      .populate('createdBy', 'name');
    res.json({ success: true, count: rubrics.length, data: rubrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/rubrics
// @desc    Create new rubric item
// @access  Protected (Admin/Marker)
router.post('/', protect, async (req, res) => {
  try {
    const rubric = await RubricItem.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: rubric });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/rubrics/:id
// @desc    Delete rubric item
// @access  Protected (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const rubric = await RubricItem.findByIdAndDelete(req.params.id);
    if (!rubric) {
      return res.status(404).json({ error: 'Rubric not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
