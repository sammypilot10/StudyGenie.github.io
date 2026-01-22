// server/server.js
const express = require('express');
const cors = require('cors'); // Make sure you have this: npm install cors
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// 1. ENABLE CORS (The Fix)
app.use(cors({
  origin: "http://localhost:3000", // Allow your frontend
  methods: ["GET", "POST"], // Allow these methods
  allowedHeaders: ["Content-Type"]
}));

// 2. Middleware
app.use(express.json());

// 3. Connect DB
connectDB();

// 4. Routes
app.use('/api', require('./routes/studyRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));