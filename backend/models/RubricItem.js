const mongoose = require('mongoose');

const RubricItemSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  questionLabel: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  deltaMarks: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RubricItem', RubricItemSchema);
