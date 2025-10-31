const mongoose = require('mongoose');

const FinalResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  perQuestion: [{
    questionLabel: String,
    score: Number
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'finalized', 'released'],
    default: 'in-progress'
  },
  pdfAnnotatedBundleRef: {
    type: String
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

FinalResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FinalResult', FinalResultSchema);
