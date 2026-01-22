'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Layers, PenTool, BrainCircuit, Loader2, ArrowLeft } from 'lucide-react';
// IMPORT THE CONFIG URL
import { API_BASE_URL } from '../../../utils/config';

export default function StudyHub() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = params.id as string;

  // 1. Capture Settings (Passed from Dashboard -> Hub -> Exam)
  const count = searchParams.get('count') || '10';
  const difficulty = searchParams.get('difficulty') || 'Medium';

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'theory'>('summary');
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    summary: '',
    flashcards: [],
    theory: []
  });

  // Fetch Data Function
  const fetchData = async (type: 'summary' | 'flashcards' | 'theory') => {
    // If we already have the data, don't re-fetch
    if (type === 'summary' && data.summary) return;
    if (type === 'flashcards' && data.flashcards.length > 0) return;
    if (type === 'theory' && data.theory.length > 0) return;

    setLoading(true);
    try {
      // UPDATED: Use API_BASE_URL instead of localhost
      const res = await fetch(`${API_BASE_URL}/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (!res.ok) throw new Error(`Failed to fetch ${type}`);

      const result = await res.json();

      setData(prev => ({
        ...prev,
        [type]: result[type] // Dynamic key update
      }));
    } catch (err) {
      console.error(err);
      // alert(`Failed to load ${type}. Please try again.`); 
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch: Get Summary when page loads
  useEffect(() => {
    if (documentId) {
      fetchData('summary');
    }
  }, [documentId]);

  // Handle Tab Switching
  const handleTabChange = (tab: 'summary' | 'flashcards' | 'theory') => {
    setActiveTab(tab);
    fetchData(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-full md:w-24 bg-white border-r border-gray-200 flex md:flex-col items-center py-4 md:py-8 space-x-4 md:space-x-0 md:space-y-8 sticky top-0 z-10 shadow-sm md:shadow-none justify-center md:justify-start h-auto md:h-screen">
        
        {/* Back Button */}
        <button onClick={() => router.push('/dashboard')} className="p-3 text-gray-400 hover:text-gray-800 mb-4 hidden md:block" title="Back to Dashboard">
          <ArrowLeft size={24} />
        </button>

        {/* Tab Icons */}
        <NavIcon 
          icon={<BookOpen size={24} />} 
          label="Summary" 
          active={activeTab === 'summary'} 
          onClick={() => handleTabChange('summary')} 
        />
        <NavIcon 
          icon={<Layers size={24} />} 
          label="Flashcards" 
          active={activeTab === 'flashcards'} 
          onClick={() => handleTabChange('flashcards')} 
        />
        <NavIcon 
          icon={<PenTool size={24} />} 
          label="Theory" 
          active={activeTab === 'theory'} 
          onClick={() => handleTabChange('theory')} 
        />

        <div className="w-px h-8 md:w-10 md:h-px bg-gray-200 my-2"></div>

        {/* Exam Link */}
        <NavIcon 
          icon={<BrainCircuit size={24} />} 
          label="Take Quiz" 
          active={false}
          // Pass the settings along to the Exam page
          onClick={() => router.push(`/exam/${documentId}?count=${count}&difficulty=${difficulty}`)} 
          color="text-indigo-600 hover:bg-indigo-50"
        />
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize flex items-center gap-3">
            {activeTab} Mode
            {loading && <Loader2 className="animate-spin text-indigo-600" />}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {activeTab === 'summary' && "Key concepts and quick notes generated from your PDF."}
            {activeTab === 'flashcards' && "Test your memory. Click a card to flip it."}
            {activeTab === 'theory' && "Practice essay questions with model answers."}
          </p>
        </header>

        {/* CONTENT CONTAINER */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          
          {loading && !data[activeTab] ? (
            <div className="h-96 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
              <p>Analyzing document with AI...</p>
            </div>
          ) : (
            <>
              {/* 1. SUMMARY VIEW */}
              {activeTab === 'summary' && (
                <div className="prose prose-indigo max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-base md:text-lg">
                    {data.summary || "No summary available."}
                  </div>
                </div>
              )}

              {/* 2. FLASHCARDS VIEW */}
              {activeTab === 'flashcards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.flashcards.length > 0 ? (
                    data.flashcards.map((card: any, idx: number) => (
                      <FlipCard key={idx} front={card.front} back={card.back} />
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500">No flashcards generated.</p>
                  )}
                </div>
              )}

              {/* 3. THEORY VIEW */}
              {activeTab === 'theory' && (
                <div className="space-y-8">
                  {data.theory.length > 0 ? (
                    data.theory.map((item: any, idx: number) => (
                      <div key={idx} className="border-b border-gray-100 pb-8 last:border-0">
                        <div className="flex flex-col md:flex-row gap-4">
                          <span className="font-bold text-2xl text-indigo-200">Q{idx + 1}</span>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{item.question}</h3>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                              <span className="font-bold text-xs uppercase tracking-wide text-indigo-500 mb-2 block">
                                Model Answer
                              </span>
                              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">No theory questions available.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* CSS for Flip Animation */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

// ================= SUB-COMPONENTS =================

// 1. Navigation Icon Button
function NavIcon({ icon, label, active, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`group flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200
        ${active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
          : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-600'}
        ${color || ''}
      `}
      title={label}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
    </button>
  );
}

// 2. Animated Flip Card
function FlipCard({ front, back }: { front: string, back: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div 
      className="h-64 cursor-pointer perspective-1000 group"
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Side */}
        <div className="absolute w-full h-full bg-white border-2 border-indigo-50 rounded-xl flex flex-col items-center justify-center p-6 backface-hidden shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Term</span>
          <p className="text-lg font-bold text-center text-gray-800 line-clamp-4">{front}</p>
          <span className="absolute bottom-4 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to flip
          </span>
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full bg-indigo-600 text-white rounded-xl flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180 shadow-lg">
          <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Definition</span>
          <p className="text-md text-center font-medium leading-relaxed overflow-y-auto max-h-40 scrollbar-hide">
            {back}
          </p>
        </div>

      </div>
    </div>
  );
}