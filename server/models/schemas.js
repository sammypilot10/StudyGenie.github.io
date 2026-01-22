// server/models/Schema.js
const mongoose = require('mongoose');

// 1. User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  createdAt: { type: Date, default: Date.now }
});

// 2. Document Schema (The uploaded study material)
const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  originalText: String, // Extracted text from PDF
  summary: String,      // AI Generated Summary
  createdAt: { type: Date, default: Date.now }
});

// 3. Question Bank Schema (Generated Questions)
const QuestionBankSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  questions: [{
    questionText: String,
    options: [String], // Array of 4 strings
    correctAnswerIndex: Number, // 0-3
    explanation: String
  }],
  type: { type: String, default: 'multiple-choice' }
});

// 4. Test Result Schema (Student Performance)
const TestResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  score: Number,
  totalQuestions: Number,
  timeTakenSeconds: Number,
  dateTaken: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Document: mongoose.model('Document', DocumentSchema),
  QuestionBank: mongoose.model('QuestionBank', QuestionBankSchema),
  TestResult: mongoose.model('TestResult', TestResultSchema)
};
