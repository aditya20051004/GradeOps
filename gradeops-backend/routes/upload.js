// // routes/upload.js
// // Handles PDF file uploads

// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const Exam = require('../models/Exam');
// const Submission = require('../models/Submission');

// const router = express.Router();

// // Auto trigger AI grading
// const triggerAIGrading = async (submissionId) => {
//   try {
//     console.log(`🤖 Auto-grading submission: ${submissionId}`);
    
//     // Call our own grade API
//     const response = await fetch(
//       `http://localhost:5001/api/grade/${submissionId}`,
//       { method: 'POST' }
//     );
//     const result = await response.json();
//     console.log(`✅ Auto-grading complete for: ${submissionId}`);
//   } catch (error) {
//     console.log(`❌ Auto-grading failed: ${error.message}`);
//   }
// };

// // Configure where to save uploaded files
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     // Create uploads folder if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     // Save file with unique name to avoid conflicts
//     const uniqueName = `${Date.now()}-${file.originalname}`;
//     cb(null, uniqueName);
//   }
// });

// // Only allow PDF files
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'application/pdf') {
//     cb(null, true);   // Accept file
//   } else {
//     cb(new Error('Only PDF files allowed!'), false); // Reject file
//   }
// };

// // Setup multer with our config
// const upload = multer({ 
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 } // Max 10MB per file
// });

// // ─────────────────────────────────────────
// // CREATE EXAM
// // POST /api/upload/exam
// // ─────────────────────────────────────────
// router.post('/exam', async (req, res) => {
//   try {
//     const { name, courseCode, totalMarks, rubric } = req.body;

//     // Validate fields
//     if (!name || !courseCode || !totalMarks || !rubric) {
//       return res.status(400).json({ 
//         message: 'Please provide all exam details' 
//       });
//     }

//     // Save exam to database
//     // BACKEND: Add req.user.id when auth middleware is connected
//     const exam = await Exam.create({
//       name,
//       courseCode,
//       totalMarks: Number(totalMarks),
//       rubric,
//       createdBy: '000000000000000000000001' // Temporary placeholder
//     });

//     res.status(201).json({
//       message: 'Exam created successfully!',
//       exam
//     });

//   } catch (error) {
//     console.log('Create exam error:', error.message);
//     res.status(500).json({ 
//       message: 'Server error', 
//       error: error.message 
//     });
//   }
// });

// // ─────────────────────────────────────────
// // UPLOAD PDF
// // POST /api/upload/pdf/:examId
// // ─────────────────────────────────────────
// router.post('/pdf/:examId', upload.single('pdf'), async (req, res) => {
//   try {
//     const { examId } = req.params;
//     const { studentName, studentRoll } = req.body;

//     // Check if file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ 
//         message: 'Please upload a PDF file' 
//       });
//     }

//     // Check student details
//     if (!studentName || !studentRoll) {
//       return res.status(400).json({ 
//         message: 'Please provide student name and roll number' 
//       });
//     }

//     // Save submission to database
//     // Save submission to database
// const submission = await Submission.create({
//   exam: examId,
//   studentName,
//   studentRoll,
//   pdfPath: req.file.path,
//   status: 'uploaded'
// });

// // Auto trigger AI grading in background
// // Don't wait for it - let it run async
// triggerAIGrading(submission._id);

// res.status(201).json({
//   message: 'PDF uploaded! AI grading started! 🤖',
//   submission,
//   filePath: req.file.path
// });

//   } catch (error) {
//     console.log('Upload error:', error.message);
//     res.status(500).json({ 
//       message: 'Server error', 
//       error: error.message 
//     });
//   }
// });

// // ─────────────────────────────────────────
// // GET ALL EXAMS
// // GET /api/upload/exams
// // ─────────────────────────────────────────
// router.get('/exams', async (req, res) => {
//   try {
//     const exams = await Exam.find().sort({ createdAt: -1 });
//     res.json(exams);
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Server error', 
//       error: error.message 
//     });
//   }
// });

// // ─────────────────────────────────────────
// // GET SUBMISSIONS FOR AN EXAM
// // GET /api/upload/submissions/:examId
// // ─────────────────────────────────────────
// router.get('/exams', async (req, res) => {
//   try {
//     const exams = await Exam.find().sort({ createdAt: -1 });
    
//     // Get submission counts for each exam
//     const examsWithStats = await Promise.all(
//       exams.map(async (exam) => {
//         const total = await Submission.countDocuments({ 
//           exam: exam._id 
//         });
//         const completed = await Submission.countDocuments({ 
//           exam: exam._id, 
//           status: 'completed'
//         });
//         const pending = await Submission.countDocuments({ 
//           exam: exam._id, 
//           status: { $in: ['uploaded', 'review', 'grading'] }
//         });

//         return {
//           ...exam.toObject(),
//           totalStudents: total,
//           graded: completed,
//           pending: pending
//         };
//       })
//     );

//     res.json(examsWithStats);

//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Server error', 
//       error: error.message 
//     });
//   }
// });

// module.exports = router;
// routes/upload.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

const router = express.Router();

// Auto trigger AI grading
const triggerAIGrading = async (submissionId) => {
  try {
    console.log(`🤖 Auto-grading: ${submissionId}`);
    const response = await fetch(
      `http://localhost:5001/api/grade/${submissionId}`,
      { method: 'POST' }
    );
    const result = await response.json();
    console.log(`✅ Auto-grading complete`);
  } catch (error) {
    console.log(`❌ Auto-grading failed: ${error.message}`);
  }
};

// Configure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Accept PDF and txt files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'text/plain' ||
      file.originalname.endsWith('.pdf') ||
      file.originalname.endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ─────────────────────────────────────────
// CREATE EXAM
// POST /api/upload/exam
// ─────────────────────────────────────────
router.post('/exam', async (req, res) => {
  try {
    const { name, courseCode, totalMarks, rubric } = req.body;

    if (!name || !courseCode || !totalMarks || !rubric) {
      return res.status(400).json({ 
        message: 'Please provide all exam details' 
      });
    }

    const exam = await Exam.create({
      name,
      courseCode,
      totalMarks: Number(totalMarks),
      rubric,
      createdBy: '000000000000000000000001'
    });

    res.status(201).json({
      message: 'Exam created successfully!',
      exam
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// UPLOAD PDF
// POST /api/upload/pdf/:examId
// ─────────────────────────────────────────
router.post('/pdf/:examId', upload.single('pdf'), async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentName, studentRoll } = req.body;

    if (!req.file) {
      return res.status(400).json({ 
        message: 'Please upload a PDF file' 
      });
    }

    const submission = await Submission.create({
      exam: examId,
      studentName: studentName || req.file.originalname,
      studentRoll: studentRoll || `ROLL${Math.floor(Math.random() * 1000)}`,
      pdfPath: req.file.path,
      status: 'uploaded'
    });

    // Auto trigger grading
    triggerAIGrading(submission._id);

    res.status(201).json({
      message: 'PDF uploaded! AI grading started! 🤖',
      submission
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// GET ALL EXAMS WITH STATS
// GET /api/upload/exams
// ─────────────────────────────────────────
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    
    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const total = await Submission.countDocuments({ 
          exam: exam._id 
        });
        const completed = await Submission.countDocuments({ 
          exam: exam._id, 
          status: 'completed'
        });
        const pending = await Submission.countDocuments({ 
          exam: exam._id, 
          status: { $in: ['uploaded', 'review', 'grading'] }
        });

        return {
          ...exam.toObject(),
          totalStudents: total,
          graded: completed,
          pending: pending
        };
      })
    );

    res.json(examsWithStats);

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// GET SUBMISSIONS FOR EXAM
// GET /api/upload/submissions/:examId
// ─────────────────────────────────────────
router.get('/submissions/:examId', async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      exam: req.params.examId 
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;