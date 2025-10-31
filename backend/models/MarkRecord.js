const mongoose = require('mongoose');

const MarkRecordSchema = new mongoose.Schema({
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
  questionLabel: {
    type: String,
    required: true
  },
  pageImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PageImage'
  },
  marker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [{
    text: String,
    x: Number,
    y: Number,
    w: Number,
    h: Number,
    rubricItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RubricItem'
    },
    deltaMarks: Number
  }],
  provisionalScore: {
    type: Number
  },
  finalized: {
    type: Boolean,
    default: false
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

MarkRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MarkRecord', MarkRecordSchema);
