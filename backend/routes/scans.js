const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const ScanUpload = require('../models/ScanUpload');
const { protect, authorize } = require('../middleware/auth');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/scans/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'scan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @route   POST /api/scans/upload
// @desc    Upload scanned answer sheets
// @access  Protected/Admin
router.post('/upload', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { examId } = req.body;
    if (!examId) {
      return res.status(400).json({ error: 'Exam ID is required' });
    }

    // Create scan upload record
    const scanUpload = await ScanUpload.create({
      exam: examId,
      uploadedBy: req.user.id,
      sourceFileRef: req.file.path,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      processed: false
    });

    // Send to Python service for processing
    try {
      const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/process-scan`, {
        scanId: scanUpload._id.toString(),
        filePath: req.file.path,
        examId: examId
      }, {
        timeout: 300000 // 5 minutes timeout for processing
      });

      // Update scan record with processing results
      scanUpload.processed = true;
      scanUpload.processingResult = pythonResponse.data;
      await scanUpload.save();

      res.json({
        success: true,
        message: 'Scan uploaded and processing started',
        scanId: scanUpload._id,
        processingResult: pythonResponse.data
      });
    } catch (pythonError) {
      console.error('Python service error:', pythonError.message);
      res.json({
        success: true,
        message: 'Scan uploaded but processing failed. Will retry automatically.',
        scanId: scanUpload._id,
        warning: 'Python service unavailable'
      });
    }
  } catch (error) {
    console.error('Scan upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/scans/:examId
// @desc    Get all scans for an exam
// @access  Protected
router.get('/:examId', protect, async (req, res) => {
  try {
    const scans = await ScanUpload.find({ exam: req.params.examId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/scans/status/:scanId
// @desc    Get processing status of a scan
// @access  Protected
router.get('/status/:scanId', protect, async (req, res) => {
  try {
    const scan = await ScanUpload.findById(req.params.scanId)
      .populate('uploadedBy', 'name');

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      success: true,
      data: scan
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
