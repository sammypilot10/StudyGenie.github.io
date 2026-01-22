'use client';
import { useState, useRef } from 'react';
import { UploadCloud, Loader2, FileWarning } from 'lucide-react';

interface UploadResponse {
  documentId: string;
  // Add other expected fields from your API here
}

export default function FileUpload({ onUploadComplete }: { onUploadComplete: (data: UploadResponse) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Centralized File Validation & Upload Logic
  const handleFile = async (file: File) => {
    // Validate File Type
    if (file.type !== 'application/pdf') {
      alert("Please upload a valid PDF file.");
      return;
    }

    // Validate File Size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    setUploading(true);

    try {
      // Best Practice: Use environment variable instead of hardcoded URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      onUploadComplete(data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  // 2. Event Handlers for Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // 3. Drag & Drop Event Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Trigger file input click manually when div is clicked
  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors cursor-pointer
          ${dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Uploading your document...</p>
            </>
          ) : (
            <>
              <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? "text-indigo-600" : "text-gray-400"}`} />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">PDF up to 10MB</p>
            </>
          )}
        </div>

        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="application/pdf" 
          onChange={handleChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}