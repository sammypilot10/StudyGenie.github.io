const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-extraction'); 
const { Document, QuestionBank } = require('../models/schemas');

// Import AI Services
const { 
  generateCBTQuestions, 
  generateSummary, 
  generateFlashcards, 
  generateTheoryQuestions 
} = require('../services/aiService');

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
// 1. UPLOAD ROUTE
// ==========================================
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = req.file.buffer;
    const pdfData = await pdf(dataBuffer);
    const extractedText = pdfData.text;

    const newDoc = new Document({
      title: req.file.originalname,
      originalText: extractedText,
    });
    
    await newDoc.save();

    res.status(201).json({ documentId: newDoc._id, message: "File processed successfully" });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to process document" });
  }
});

// ==========================================
// 2. GENERATE TEST ROUTE
// ==========================================
router.post('/generate-test', async (req, res) => {
  const { documentId, numQuestions = 10, difficulty = "Medium" } = req.body;

  try {
    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const questions = await generateCBTQuestions(doc.originalText, numQuestions, difficulty);

    const questionBank = new QuestionBank({
      documentId: doc._id,
      questions: questions
    });
    await questionBank.save();

    res.json({ testId: questionBank._id, questions: questions });
  } catch (error) {
    console.error("Generation Error:", error);
    res.status(500).json({ error: "Failed to generate test" });
  }
});

// GET Specific Test
router.get('/test/:id', async (req, res) => {
  try {
    const test = await QuestionBank.findById(req.params.id);
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("Fetch Test Error:", error);
    res.status(500).json({ error: "Failed to retrieve test" });
  }
});

// ==========================================
// 3. STUDY TOOLS (Summary, Flashcards, Theory)
// ==========================================

// POST /api/summary
router.post('/summary', async (req, res) => {
  try {
    const doc = await Document.findById(req.body.documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    
    const summary = await generateSummary(doc.originalText);
    res.json({ summary });
  } catch (error) {
    console.error("Summary Error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// POST /api/flashcards
router.post('/flashcards', async (req, res) => {
  try {
    const doc = await Document.findById(req.body.documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const flashcards = await generateFlashcards(doc.originalText);
    res.json({ flashcards });
  } catch (error) {
    console.error("Flashcards Error:", error);
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
});

// POST /api/theory
router.post('/theory', async (req, res) => {
  try {
    const doc = await Document.findById(req.body.documentId);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const theory = await generateTheoryQuestions(doc.originalText);
    res.json({ theory });
  } catch (error) {
    console.error("Theory Error:", error);
    res.status(500).json({ error: "Failed to generate theory" });
  }
});

// ==========================================
// 4. HISTORY ROUTE (Get All Documents)
// ==========================================
router.get('/documents', async (req, res) => {
  try {
    // Fetch all documents, sorted by newest first.
    // We only select 'title' and 'createdAt' to keep the response fast.
    const docs = await Document.find().sort({ createdAt: -1 }).select('title createdAt');
    res.json(docs);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

module.exports = router;