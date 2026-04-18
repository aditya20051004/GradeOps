// routes/grade.js
// This connects Node.js to Python ML service

const express = require('express');
const Submission = require('../models/Submission');
const Exam = require('../models/Exam');

const router = express.Router();

// Python ML service URL
const ML_SERVICE = 'http://localhost:8000';

// ─────────────────────────────────────────
// HELPER: Call Python ML service
// ─────────────────────────────────────────
const callMLService = async (endpoint, data) => {
  try {
    const response = await fetch(`${ML_SERVICE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.log('ML Service error:', error.message);
    throw new Error('ML Service unavailable');
  }
};

// ─────────────────────────────────────────
// GRADE A SUBMISSION
// POST /api/grade/:submissionId
// ─────────────────────────────────────────
router.post('/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    // Find exam for rubric
    const exam = await Exam.findById(submission.exam);
    if (!exam) {
      return res.status(404).json({ 
        message: 'Exam not found' 
      });
    }

    // Update status
    submission.status = 'grading';
    await submission.save();

    console.log('🤖 Calling Python ML service...');

    // Call Python ML service for AI grading
    // Step 1: Extract text from PDF using Python OCR
// Step 1: Extract text from PDF
// Step 1: Extract text from PDF
let extractedText = submission.extractedText;

if (!extractedText || extractedText.length < 50) {
  console.log('📄 Extracting text from PDF...');
  
  try {
    // First try pdf-parse for digital PDFs
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(submission.pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    
    if (pdfData.text && pdfData.text.trim().length > 50) {
      // Digital PDF - text extracted directly
      extractedText = pdfData.text;
      console.log('✅ Digital PDF text extracted!');
    } else {
      // Scanned/handwritten PDF - need OCR
      console.log('🖼️ Scanned PDF detected, using OCR...');
      
      // Call Python OCR service with file path
      const ocrResponse = await fetch(
        'http://localhost:8000/ocr/extract-from-path',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            file_path: submission.pdfPath 
          })
        }
      );
      
      if (ocrResponse.ok) {
        const ocrResult = await ocrResponse.json();
        extractedText = ocrResult.extracted_text;
        console.log('✅ OCR extracted:', extractedText.length, 'chars');
      }
    }

    // Save extracted text
    if (extractedText && extractedText.trim().length > 10) {
      submission.extractedText = extractedText;
      await submission.save();
    }

  } catch (err) {
    console.log('Extraction error:', err.message);
    extractedText = 'Could not extract text from PDF';
  }
}

// Step 2: Call Python ML service for AI grading
// Make sure total_marks is a number
const aiResult = await callMLService('/grade/answer', {
  student_answer: extractedText || 'No answer provided',
  rubric: exam.rubric || 'Grade based on content',
  total_marks: parseInt(exam.totalMarks) || 50,
  student_name: submission.studentName || 'Unknown',
  student_roll: submission.studentRoll || 'Unknown'
});

    // Save results to database
    submission.aiGrade = aiResult.final_score;
    submission.aiJustification = aiResult.justification;
    submission.status = 'review';
    await submission.save();

    console.log('✅ Grading complete!');

    res.json({
      message: 'AI Grading complete! 🎯',
      submission: {
        id: submission._id,
        studentName: submission.studentName,
        studentRoll: submission.studentRoll,
        aiGrade: submission.aiGrade,
        aiJustification: submission.aiJustification,
        status: submission.status
      },
      aiResult
    });

  } catch (error) {
    console.log('Grading error:', error.message);
    res.status(500).json({ 
      message: 'Grading failed', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// CHECK PLAGIARISM FOR AN EXAM
// POST /api/grade/plagiarism/:examId
// ─────────────────────────────────────────
router.post('/plagiarism/:examId', async (req, res) => {
  try {
    const { examId } = req.params;

    // Get all submissions for this exam
    const submissions = await Submission.find({
      exam: req.params.examId,
      status: { $in: ['completed', 'review'] }
    });

    if (submissions.length < 2) {
      return res.json({
        message: 'Need at least 2 submissions',
        flags: []
      });
    }

    // Call Python plagiarism service
    const result = await callMLService('/plagiarism/check', {
      submissions: submissions.map(s => ({
        student_name: s.studentName,
        student_roll: s.studentRoll,
        answer: s.extractedText || ''
      }))
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ 
      message: 'Plagiarism check failed', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// TA REVIEW - Approve or Override
// POST /api/grade/review/:submissionId
// ─────────────────────────────────────────
router.post('/review/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { decision, finalGrade } = req.body;

    console.log('Review decision:', decision, 'for:', submissionId);

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ 
        message: 'Submission not found' 
      });
    }

    console.log('Current aiGrade:', submission.aiGrade);

    if (decision === 'approve') {
      submission.finalGrade = submission.aiGrade || 0;
      submission.taDecision = 'approved';
    } else if (decision === 'override') {
      submission.finalGrade = Number(finalGrade) || 0;
      submission.taDecision = 'overridden';
    }

    submission.status = 'completed';
    await submission.save();

    console.log('Saved finalGrade:', submission.finalGrade);

    res.json({
      message: `Grade ${decision}d! ✅`,
      finalGrade: submission.finalGrade,
      submission
    });

  } catch (error) {
    console.log('Review error:', error.message);
    res.status(500).json({ 
      message: 'Review failed', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// GET REVIEW QUEUE
// GET /api/grade/review/queue
// ─────────────────────────────────────────
router.get('/review/queue', async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      status: 'review' 
    }).populate('exam');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// ─────────────────────────────────────────
// GET RESULTS FOR AN EXAM
// GET /api/grade/results/:examId
// ─────────────────────────────────────────
router.get('/results/:examId', async (req, res) => {
  try {
    // Show both completed AND review status
    const submissions = await Submission.find({
      exam: req.params.examId,
      status: { $in: ['completed', 'review'] }
    });

    const scores = submissions
      .map(s => s.finalGrade || s.aiGrade)
      .filter(s => s !== null && s !== undefined);

    const stats = {
      total: submissions.length,
      average: scores.length > 0 
        ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) 
        : 0,
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0
    };

    res.json({ submissions, stats });

  } catch (error) {
    console.log('Results error:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;