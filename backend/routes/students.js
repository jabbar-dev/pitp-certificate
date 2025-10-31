const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/csv/' });

// @route   GET /api/students
// @desc    Get all students with filtering
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const { program, batch, section, search } = req.query;
    const query = {};

    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (section) query.section = section;
    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).sort({ studentId: 1 });
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Protected/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /api/students/bulk-import
// @desc    Bulk import students from CSV
// @access  Protected/Admin
router.post('/bulk-import', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          try {
            await Student.create({
              studentId: row.studentId || row.rollNo || row.regNo,
              fullName: row.fullName || row.name,
              program: row.program,
              batch: row.batch,
              section: row.section
            });
          } catch (error) {
            errors.push({ row, error: error.message });
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          imported: results.length - errors.length,
          errors: errors.length,
          errorDetails: errors
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Protected/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Protected/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
