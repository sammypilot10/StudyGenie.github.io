'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, Clock, ArrowRight, Trash2, Loader2 } from 'lucide-react';
// IMPORT THE CONFIG URL
import { API_BASE_URL } from '../../utils/config';

export default function Dashboard() {
  const router = useRouter();
  
  // State for Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({ count: 10, difficulty: 'Medium' });

  // State for History
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // 1. FETCH HISTORY ON LOAD
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // UPDATED: Use API_BASE_URL instead of localhost
      const res = await fetch(`${API_BASE_URL}/api/documents`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 2. HANDLE UPLOAD
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // UPDATED: Use API_BASE_URL instead of localhost
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      // Redirect to Study Hub with settings
      router.push(`/study/${data.documentId}?count=${settings.count}&difficulty=${settings.difficulty}`);
    } catch (err) {
      alert("Upload failed. Please ensure the backend is running.");
    } finally {
      setUploading(false);
    }
  };

  // 3. NAVIGATE TO OLD CHAT
  const openHistory = (docId: string) => {
    router.push(`/study/${docId}?count=${settings.count}&difficulty=${settings.difficulty}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-4 pt-4 md:pt-0">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            StudyGenie <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-lg max-w-md mx-auto">
            Upload a PDF to generate summaries, flashcards, and quizzes instantly.
          </p>
        </div>

        {/* SECTION 1: UPLOAD AREA */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 transform transition-all hover:shadow-2xl">
          <div className="border-2 border-dashed border-indigo-100 rounded-2xl p-6 md:p-10 text-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors">
            <UploadCloud className="mx-auto h-12 w-12 md:h-16 md:w-16 text-indigo-500 mb-4" />
            
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 mx-auto max-w-xs mb-4"
            />
            
            {/* Settings Row - Stacks on mobile */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
              <select 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto"
                value={settings.difficulty}
                onChange={(e) => setSettings({...settings, difficulty: e.target.value})}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              
              <select 
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-auto"
                value={settings.count}
                onChange={(e) => setSettings({...settings, count: Number(e.target.value)})}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="20">20 Questions</option>
              </select>
            </div>

            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mx-auto w-full md:w-auto"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={20} />}
              {uploading ? "Processing..." : "Generate Study Material"}
            </button>
          </div>
        </div>

        {/* SECTION 2: YOUR LIBRARY (HISTORY) */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-indigo-500" /> Your Library
          </h2>

          {loadingHistory ? (
            <div className="text-center py-10 text-gray-400">Loading your history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500">No documents uploaded yet.</p>
            </div>
          ) : (
            // Mobile: 1 column, Tablet: 2 columns, PC: 3 columns
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((doc: any) => (
                <div 
                  key={doc._id} 
                  onClick={() => openHistory(doc._id)}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between h-40"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 leading-snug">
                      {doc.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-indigo-600 text-sm font-bold mt-4 group-hover:translate-x-1 transition-transform">
                    Continue Studying <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}