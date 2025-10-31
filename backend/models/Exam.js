const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  examCode: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date
  },
  durationMinutes: {
    type: Number
  },
  controllerNotes: {
    type: String
  },
  privateSeed: {
    type: String,
    required: true
  },
  publicCode: {
    type: String,
    required: true
  },
  idPageNumber: {
    type: Number,
    default: 1
  },
  doNotMarkPages: [{
    type: Number
  }],
  totalPagesPlanned: {
    type: Number
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'conducted', 'scanned', 'marking', 'complete'],
    default: 'draft'
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

ExamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);
