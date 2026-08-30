import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Navbar from '../components/Navbar';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../hooks/useAuth';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { pdfId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfName, setPdfName] = useState(location.state?.pdfName || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfInfo = async () => {
      try {
        if (!location.state?.pdfName) {
          const res = await apiClient.get('/user/pdfs');

          if (res.data.success && Array.isArray(res.data.pdfs)) {
            const foundPdf = res.data.pdfs.find(
              (p) => p.pdfId === pdfId || p.pdf_id === pdfId || p._id === pdfId
            );
            if (foundPdf) {
              setPdfName(foundPdf.fileName || foundPdf.file_name || 'Document');
            } else {
              setPdfName('PDF Document');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching PDF details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfInfo();
  }, [pdfId, location.state?.pdfName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500 font-medium">Loading chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => navigate('/pdfs')}
              className="hover:text-indigo-600 transition flex items-center space-x-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Documents</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
              {pdfName || 'Document Chat'}
            </span>
          </nav>

          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
          >
            + Upload Another PDF
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 min-h-[500px] h-[calc(100vh-175px)]">
          <ChatInterface pdfId={pdfId} pdfName={pdfName || 'Document'} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
