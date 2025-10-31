const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const GeneratedPaper = require('../models/GeneratedPaper');
const { protect, authorize } = require('../middleware/auth');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// @route   POST /api/answer-sheets/generate
// @desc    Generate answer sheet booklets for students
// @access  Protected/Admin
router.post('/generate', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      examId,
      studentIds,
      numAnswerPages,
      includeGraphPaper,
      examTitle,
      subjectName,
      subjectCode,
      teacherName,
      department,
      session,
      totalMarks,
      passingMarks,
      duration
    } = req.body;

    // Get exam details
    const exam = await Exam.findById(examId).populate('subject');
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Get students
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length === 0) {
      return res.status(400).json({ error: 'No students found' });
    }

    // Prepare data for Python service
    const booklets = [];
    for (const student of students) {
      const qrBundleId = crypto.randomBytes(16).toString('hex');
      const paperNumber = `${exam.examCode}-${student.studentId}`;

      // Generate QR data for each page
      const pages = [];
      for (let pageNo = 1; pageNo <= numAnswerPages + 1; pageNo++) {
        const qrData = {
          examId: exam._id.toString(),
          studentId: student._id.toString(),
          qrBundleId,
          pageNo,
          signature: crypto.createHmac('sha256', exam.privateSeed)
            .update(`${exam._id}:${student._id}:${qrBundleId}:${pageNo}`)
            .digest('hex')
        };
        pages.push({
          pageNo,
          qrCodeData: JSON.stringify(qrData)
        });
      }

      booklets.push({
        student: {
          id: student._id.toString(),
          studentId: student.studentId,
          fullName: student.fullName
        },
        exam: {
          title: examTitle || exam.title,
          code: exam.examCode,
          subject: subjectName || exam.subject.name,
          subjectCode: subjectCode || exam.subject.code,
          teacher: teacherName || '',
          department: department || exam.subject.department,
          session: session || '',
          totalMarks: totalMarks || '',
          passingMarks: passingMarks || '',
          duration: duration || exam.durationMinutes
        },
        paperNumber,
        qrBundleId,
        numAnswerPages,
        includeGraphPaper: includeGraphPaper || false,
        pages
      });

      // Save to database
      await GeneratedPaper.create({
        exam: exam._id,
        student: student._id,
        paperNumber,
        qrBundleId,
        paperType: 'answer_booklet',
        pages
      });
    }

    // Call Python service to generate PDFs
    try {
      const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/generate-answer-sheets`, {
        booklets
      }, {
        timeout: 120000 // 2 minutes timeout
      });

      res.json({
        success: true,
        message: 'Answer sheets generated successfully',
        count: booklets.length,
        downloadUrl: pythonResponse.data.zipUrl,
        files: pythonResponse.data.files
      });
    } catch (pythonError) {
      console.error('Python service error:', pythonError.message);
      res.status(503).json({
        error: 'PDF generation service unavailable',
        message: 'Answer sheet metadata created but PDF generation failed. Please check Python service.',
        booklets: booklets.length
      });
    }
  } catch (error) {
    console.error('Answer sheet generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/answer-sheets/:examId
// @desc    Get generated answer sheets for an exam
// @access  Protected
router.get('/:examId', protect, async (req, res) => {
  try {
    const papers = await GeneratedPaper.find({
      exam: req.params.examId,
      paperType: 'answer_booklet'
    })
      .populate('student', 'studentId fullName')
      .populate('exam', 'examCode title');

    res.json({ success: true, count: papers.length, data: papers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
