'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
// Make sure this path matches where you saved your timer hook
import { useExamTimer } from '../../../hook/useExamLogic'; 
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
// IMPORT THE CONFIG URL
import { API_BASE_URL } from '../../../utils/config';

type Question = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
};

export default function ExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const documentId = params.id as string;

  // 1. GET SETTINGS FROM URL (Defaults: 10 questions, Medium, 10 mins)
  const numQuestions = Number(searchParams.get('count')) || 10;
  const difficulty = searchParams.get('difficulty') || "Medium";
  const duration = Number(searchParams.get('time')) || 10;

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // 2. INITIALIZE TIMER
  // Automatically submits when time runs out
  const { formatTime, timeLeft } = useExamTimer(duration, () => handleSubmit());

  // 3. FETCH QUESTIONS ON LOAD
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // UPDATED: Use API_BASE_URL instead of localhost
        const res = await fetch(`${API_BASE_URL}/api/generate-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            documentId,
            numQuestions,
            difficulty
          }),
        });

        if (!res.ok) throw new Error("Failed to generate test");
        
        const data = await res.json();
        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
        setError('Failed to generate questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (documentId) fetchQuestions();
  }, [documentId, numQuestions, difficulty]);

  // Handle Option Click
  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  // Submit Exam Logic
  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    
    let calculatedScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        calculatedScore++;
      }
    });
    
    setScore(calculatedScore);
    setIsSubmitted(true);
  }, [isSubmitted, questions, selectedAnswers]);

  // --- RENDERING ---

  // Loading View
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">Generating your {difficulty} Exam...</h2>
      <p className="text-gray-500">Preparing {numQuestions} questions.</p>
    </div>
  );

  // Error View
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-red-600">
      <AlertCircle className="w-12 h-12 mb-4" />
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 hover:underline">Try Again</button>
    </div>
  );

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col font-sans">
      
      {/* HEADER: Title & Timer */}
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6 max-w-4xl mx-auto w-full sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-800">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {isSubmitted ? "Exam Results" : `${difficulty} Mode`}
            </h1>
            {!isSubmitted && <p className="text-xs text-gray-500">Question {currentIndex + 1} of {questions.length}</p>}
          </div>
        </div>

        {!isSubmitted && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold transition-colors
            ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
            <Clock size={18} />
            {formatTime()}
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-4xl mx-auto w-full">
        {isSubmitted ? (
          // ================= RESULTS VIEW =================
          <div className="space-y-8 pb-12">
            
            {/* Score Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Completed!</h2>
              <div className="text-5xl font-black text-indigo-600 mb-2">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <p className="text-gray-600 mb-6">You scored {score} out of {questions.length}</p>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => router.push(`/study/${documentId}`)} // Back to Hub
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Back to Study Hub
                </button>
                <button 
                  onClick={() => window.location.reload()} // Retry
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Retake Exam
                </button>
              </div>
            </div>

            {/* Detailed Explanations */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Detailed Review</h3>
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswerIndex;
                const userAnswer = selectedAnswers[idx];
                
                return (
                  <div key={idx} className={`p-6 rounded-2xl border-2 transition-all ${isCorrect ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-white'}`}>
                    <div className="flex gap-4">
                      <span className={`font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                        {idx + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-lg mb-4">{q.questionText}</p>
                        
                        {/* Options */}
                        <div className="space-y-2 mb-4">
                          {q.options.map((opt, optIdx) => {
                            let styles = "p-3 rounded-lg border text-sm flex justify-between items-center ";
                            
                            if (optIdx === q.correctAnswerIndex) {
                              styles += "bg-green-100 border-green-300 text-green-900 font-semibold"; // Correct Answer
                            } else if (optIdx === userAnswer && !isCorrect) {
                              styles += "bg-red-100 border-red-300 text-red-900"; // Wrong Choice
                            } else {
                              styles += "bg-white border-gray-200 text-gray-500 opacity-70"; // Other Options
                            }

                            return (
                              <div key={optIdx} className={styles}>
                                <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                {optIdx === q.correctAnswerIndex && <CheckCircle size={18} className="text-green-600"/>}
                                {optIdx === userAnswer && !isCorrect && <XCircle size={18} className="text-red-600"/>}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        <div className="mt-4 p-4 bg-yellow-50 text-yellow-900 rounded-xl border border-yellow-100 text-sm">
                          <div className="flex items-center gap-2 mb-1 font-bold text-yellow-700">
                            <span className="text-lg">💡</span> Explanation
                          </div>
                          {q.explanation || "No explanation provided for this question."}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // ================= ACTIVE QUIZ VIEW =================
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
            <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3 flex-1">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center group
                    ${selectedAnswers[currentIndex] === idx 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                      : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg mr-4 text-sm font-bold transition-colors
                    ${selectedAnswers[currentIndex] === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2 text-gray-500 disabled:opacity-30 hover:bg-gray-50 rounded-lg transition font-medium"
              >
                Previous
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit()}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md shadow-green-200 transition font-medium"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition font-medium"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}