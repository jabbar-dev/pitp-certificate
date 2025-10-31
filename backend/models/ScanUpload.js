const mongoose = require('mongoose');

const ScanUploadSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourceFileRef: {
    type: String,
    required: true
  },
  originalName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  processed: {
    type: Boolean,
    default: false
  },
  processingResult: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScanUpload', ScanUploadSchema);
