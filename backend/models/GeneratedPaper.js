const mongoose = require('mongoose');

const GeneratedPaperSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  paperNumber: {
    type: String,
    required: true
  },
  qrBundleId: {
    type: String,
    required: true
  },
  paperType: {
    type: String,
    enum: ['question_paper', 'answer_booklet'],
    default: 'answer_booklet'
  },
  pages: [{
    pageNo: Number,
    qrCodeData: String,
    pdfPageRef: String
  }],
  pdfFileRef: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GeneratedPaper', GeneratedPaperSchema);
