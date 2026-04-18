// models/Exam.js
// This stores exam information in database

const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  courseCode: {
    type: String,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  rubric: {
    type: String,
    required: true  // JSON string of rubric questions
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'grading', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exam', ExamSchema);