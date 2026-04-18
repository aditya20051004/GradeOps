// models/Submission.js
// This stores each student's exam submission

const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentRoll: {
    type: String,
    required: true
  },
  pdfPath: {
    type: String,
    required: true  // Path to uploaded PDF file
  },
  extractedText: {
    type: String,
    default: ''     // Text extracted from PDF by OCR
  },
  aiGrade: {
    type: Number,
    default: null   // Score given by AI
  },
  aiJustification: {
    type: String,
    default: ''     // AI explanation for the score
  },
  finalGrade: {
    type: Number,
    default: null   // Final grade after TA review
  },
  status: {
    type: String,
    enum: ['uploaded', 'extracting', 'grading', 'review', 'completed'],
    default: 'uploaded'
  },
  taDecision: {
    type: String,
    enum: ['pending', 'approved', 'overridden'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);