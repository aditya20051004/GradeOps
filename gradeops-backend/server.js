// gradeops-backend/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve uploaded files as static files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch((err) => console.log('❌ MongoDB Error:', err.message));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/grade', require('./routes/grade'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'GradeOps Backend Running! 🚀',
    database: mongoose.connection.readyState === 1 
      ? 'Connected ✅' 
      : 'Disconnected ❌',
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/upload/exam',
      'POST /api/upload/pdf/:examId',
      'GET  /api/upload/exams',
      'POST /api/grade/:submissionId',
      'POST /api/grade/review/:submissionId',
      'GET  /api/grade/review/queue'
    ]
  });
});

// Start server
const PORT = process.env.PORT || 5001;
// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const Exam = require('./models/Exam');
    const Submission = require('./models/Submission');

    const totalExams = await Exam.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const pendingReview = await Submission.countDocuments({ 
      status: 'review' 
    });
    const completed = await Submission.countDocuments({ 
      status: 'completed' 
    });

    res.json({
      totalExams,
      totalSubmissions,
      pendingReview,
      completed
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all rubrics (from exams)
app.get('/api/rubrics', async (req, res) => {
  try {
    const Exam = require('./models/Exam');
    const exams = await Exam.find()
      .sort({ createdAt: -1 });
    
    const rubrics = exams.map(exam => ({
      id: exam._id,
      name: `${exam.name} Rubric`,
      courseCode: exam.courseCode,
      totalMarks: exam.totalMarks,
      rubricContent: exam.rubric,
      createdAt: exam.createdAt
    }));

    res.json(rubrics);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const Submission = require('./models/Submission');
    const Exam = require('./models/Exam');

    // Get all unique students from submissions
    const submissions = await Submission.find()
      .populate('exam')
      .sort({ createdAt: -1 });

    // Group by student
    const studentsMap = {};
    
    for (const sub of submissions) {
      const key = sub.studentRoll;
      
      if (!studentsMap[key]) {
        studentsMap[key] = {
          name: sub.studentName,
          roll: sub.studentRoll,
          email: `${sub.studentRoll.toLowerCase()}@university.edu`,
          exams: 0,
          totalScore: 0,
          completedExams: 0
        };
      }
      
      studentsMap[key].exams += 1;
      
      if (sub.finalGrade || sub.aiGrade) {
        studentsMap[key].totalScore += 
          sub.finalGrade || sub.aiGrade || 0;
        studentsMap[key].completedExams += 1;
      }
    }

    // Calculate averages
    const students = Object.values(studentsMap).map(s => ({
      ...s,
      avg: s.completedExams > 0 
        ? Math.round(s.totalScore / s.completedExams) 
        : 0
    }));

    res.json(students);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// AI Activity Feed
app.get('/api/dashboard/activity', async (req, res) => {
  try {
    const Submission = require('./models/Submission');
    const Exam = require('./models/Exam');

    // Get latest 10 submissions with activity
    const submissions = await Submission.find({
      status: { $in: ['completed', 'review', 'grading'] }
    })
    .populate('exam')
    .sort({ createdAt: -1 })
    .limit(10);

    const activities = submissions.map(sub => {
      let text = '';
      let icon = 'brain';
      let time = getTimeAgo(sub.createdAt);

      if (sub.status === 'completed') {
        text = `${sub.studentName} graded ${sub.finalGrade || sub.aiGrade || 0} marks — ${sub.exam?.name || 'Exam'}`;
        icon = 'check';
      } else if (sub.status === 'review') {
        text = `AI graded ${sub.studentName} — score ${sub.aiGrade || 0} pending TA review`;
        icon = 'brain';
      } else if (sub.status === 'grading') {
        text = `Grading in progress for ${sub.studentName}`;
        icon = 'brain';
      }

      return { text, icon, time };
    });

    res.json(activities);

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Helper function
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds/60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)} hr ago`;
  return `${Math.floor(seconds/86400)} days ago`;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});