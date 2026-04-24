import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../hooks/useAuth';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { pdfId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfName, setPdfName] = useState(location.state?.pdfName || 'Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdfInfo = async () => {
      try {
        const token = localStorage.getItem('token');

        // If we don't have pdfName from navigation state, fetch it
        if (!location.state?.pdfName) {
          const pdfsResponse = await axios.get('http://localhost:8000/user/pdfs', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (pdfsResponse.data.success) {
            const pdf = pdfsResponse.data.pdfs.find(p => p.pdfId === pdfId);
            if (pdf) {
              setPdfName(pdf.fileName);
            } else {
              setPdfName('Unknown PDF');
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          logout();
        }
        setLoading(false);
      }
    };

    fetchPdfInfo();
  }, [pdfId, location.state?.pdfName, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => navigate('/pdfs')}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-150"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">Home</span>
                </button>
              </li>
              {/* <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <button
                    onClick={() => navigate('/pdfs')}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-150"
                  >
                    My PDFs
                  </button>
                </div>
              </li> */}
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-700 truncate max-w-xs">
                    {pdfName}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Chat Interface */}
        <div className="h-[calc(100vh-200px)]">
          <ChatInterface pdfId={pdfId} pdfName={pdfName} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
