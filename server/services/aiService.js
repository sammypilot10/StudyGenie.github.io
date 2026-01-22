const Groq = require("groq-sdk");

// Initialize Groq Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// CONFIG: Use a faster, lighter model to avoid Rate Limit (429) errors
const AI_MODEL = "llama-3.1-8b-instant"; 
const MAX_CHARS = 15000; // Limit text size to save tokens

// ==========================================
// 1. GENERATE CBT QUIZ
// ==========================================
const generateCBTQuestions = async (textContext, numQuestions, difficulty) => {
  const prompt = `
    You are an expert examiner. 
    
    CRITICAL INSTRUCTION:
    You MUST generate EXACTLY ${numQuestions} multiple-choice questions. 
    Difficulty level: ${difficulty}.

    CONTEXT TEXT:
    "${textContext.substring(0, MAX_CHARS)}..." 

    OUTPUT FORMAT:
    You must output ONLY a valid JSON array. Do not include markdown.
    Structure:
    [
      {
        "questionText": "Question string here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswerIndex": 0, 
        "explanation": "Brief explanation."
      }
    ]
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a JSON-only API. Never output conversational text." },
        { role: "user", content: prompt },
      ],
      model: AI_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "";
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    // Handle wrapped data or direct array
    return Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);

  } catch (error) {
    console.error("Groq CBT Generation Error:", error);
    return []; // Return empty array so app doesn't crash
  }
};

// ==========================================
// 2. GENERATE SUMMARY (First Class Mode)
// ==========================================
const generateSummary = async (textContext) => {
  const prompt = `
    # ROLE: Strict University Professor.
    # TASK: Summarize this text for a "First Class" student.
    
    1. **ELI5 Concept:** Explain the core logic simply.
    2. **Examinable Gems:** Highlight what usually appears in exams (traps, exceptions).
    3. **Key Facts:** List must-memorize definitions/dates.

    TEXT: "${textContext.substring(0, MAX_CHARS)}..."
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Use Markdown formatting (## Headers, **Bold**)." },
        { role: "user", content: prompt }
      ],
      model: AI_MODEL, 
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "Failed to generate summary.";
  } catch (error) {
    console.error("Summary Generation Error:", error);
    return "Error generating summary.";
  }
};

// ==========================================
// 3. GENERATE FLASHCARDS (Advanced Mode)
// ==========================================
const generateFlashcards = async (textContext) => {
  const prompt = `
    Create 15 flashcards from the text below. Mix these styles:
    1. Concept Check
    2. Cause & Effect
    3. True/False

    OUTPUT JSON ONLY: 
    [ { "front": "Question", "back": "Answer" } ]
    
    TEXT: "${textContext.substring(0, MAX_CHARS)}..."
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Output valid JSON array only." },
        { role: "user", content: prompt }
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content || "[]";
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    let rawData = Array.isArray(parsed) ? parsed : (parsed.flashcards || parsed.data || []);

    return rawData.map(card => ({
      front: card.front || card.question || "Question missing",
      back: card.back || card.answer || "Answer missing"
    }));

  } catch (error) {
    console.error("Flashcard Generation Error:", error);
    return [];
  }
};

// ==========================================
// 4. GENERATE THEORY QUESTIONS (Strict JSON)
// ==========================================
const generateTheoryQuestions = async (textContext) => {
  const prompt = `
    Generate 5 essay-style questions with detailed model answers.
    
    OUTPUT JSON FORMAT ONLY:
    [
      { 
        "question": "Question text...", 
        "answer": "Model answer..." 
      }
    ]
    
    TEXT: "${textContext.substring(0, MAX_CHARS)}..."
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Output valid JSON array only." },
        { role: "user", content: prompt }
      ],
      model: AI_MODEL,
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content || "[]";
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    let rawData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);

    return rawData.map(item => ({
      question: item.question || item.questionText || "Question missing",
      answer: item.answer || item.modelAnswer || "Answer missing"
    }));

  } catch (error) {
    console.error("Theory Generation Error:", error);
    return [];
  }
};

module.exports = { 
  generateCBTQuestions, 
  generateSummary, 
  generateFlashcards, 
  generateTheoryQuestions 
};