const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subject = require('../models/Subject');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Protected/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const teachers = await User.find({ role: 'marker' })
      .populate('assignedSubjects', 'code name')
      .select('-passwordHash')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/teachers
// @desc    Add a new teacher
// @access  Protected/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, assignedSubjects } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create teacher (marker role)
    const teacher = await User.create({
      name,
      email,
      passwordHash,
      role: 'marker',
      assignedSubjects: assignedSubjects || []
    });

    // Update subjects to reference this teacher
    if (assignedSubjects && assignedSubjects.length > 0) {
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { teacher: teacher._id }
      );
    }

    const teacherResponse = await User.findById(teacher._id)
      .populate('assignedSubjects', 'code name')
      .select('-passwordHash');

    res.status(201).json({
      success: true,
      data: teacherResponse
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher details
// @access  Protected/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, assignedSubjects } = req.body;

    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'marker') {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Update basic info
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    
    // Update assigned subjects
    if (assignedSubjects) {
      // Remove this teacher from old subjects
      await Subject.updateMany(
        { teacher: teacher._id },
        { $unset: { teacher: 1 } }
      );

      // Assign to new subjects
      teacher.assignedSubjects = assignedSubjects;
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { teacher: teacher._id }
      );
    }

    await teacher.save();

    const updatedTeacher = await User.findById(teacher._id)
      .populate('assignedSubjects', 'code name')
      .select('-passwordHash');

    res.json({
      success: true,
      data: updatedTeacher
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete a teacher
// @access  Protected/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'marker') {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Remove teacher reference from subjects
    await Subject.updateMany(
      { teacher: teacher._id },
      { $unset: { teacher: 1 } }
    );

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get single teacher
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id)
      .populate('assignedSubjects', 'code name department')
      .select('-passwordHash');

    if (!teacher || teacher.role !== 'marker') {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
