import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UploadPdf from '../components/UploadPdf';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activePdf, setActivePdf] = useState(null); // { pdfId, fileName }
  const navigate = useNavigate();

  const handleUploadSuccess = (data) => {
    const pdfId = data.pdfId || data.pdf_id;
    const fileName = data.fileName || data.file_name || 'Uploaded Document';
    setActivePdf({ pdfId, fileName });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Document Workspace
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload a document to extract information and chat with AI
            </p>
          </div>

          <button
            onClick={() => navigate('/pdfs')}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 shadow-sm transition"
          >
            <svg className="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Documents
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upload Widget */}
          <div className="lg:col-span-4 space-y-6">
            <UploadPdf onUploadSuccess={handleUploadSuccess} />

            {/* Quick Tips */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tips for Best Results
              </h3>
              <ul className="text-xs text-indigo-800/90 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Text-based PDFs yield the most accurate responses.</li>
                <li>Ask specific questions like <em>"Summarize Section 3"</em>.</li>
                <li>Vectors are securely scoped to your account.</li>
              </ul>
            </div>
          </div>

          {/* Chat Workspace */}
          <div className="lg:col-span-8 h-[600px]">
            {activePdf ? (
              <ChatInterface pdfId={activePdf.pdfId} pdfName={activePdf.fileName} />
            ) : (
              <div className="h-full bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Document Selected</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm">
                  Upload a PDF using the form on the left or select an existing document from your library to start chatting.
                </p>
                <button
                  onClick={() => navigate('/pdfs')}
                  className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition"
                >
                  Browse Document Library →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
