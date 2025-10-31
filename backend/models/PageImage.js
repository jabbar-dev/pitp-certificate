const mongoose = require('mongoose');

const PageImageSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  generatedPaper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedPaper'
  },
  pageNo: {
    type: Number
  },
  questionTag: {
    type: String
  },
  qrDecodedData: {
    type: mongoose.Schema.Types.Mixed
  },
  imageFileRef: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['identified', 'unidentified', 'flagged'],
    default: 'unidentified'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

PageImageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PageImage', PageImageSchema);
