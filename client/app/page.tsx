// c:\Users\HP\Desktop\STUDY WEBSITE\client\app\page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <h1 className="text-5xl font-bold mb-8 text-indigo-600">StudyGenie</h1>
      <p className="text-xl text-gray-600 mb-8">AI-Powered Study Assistant</p>
      <Link 
        href="/dashboard" 
        className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors"
      >
        Go to Dashboard
      </Link>
    </main>
  );
}
