require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- CRITICAL IMPORT
const studyRoutes = require('./routes/studyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. ALLOW CORS (The Fix)
// This tells the server: "Accept requests from anywhere"
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middleware
app.use(express.json());

// 3. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// 4. Routes
app.use('/api', studyRoutes);

// 5. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});