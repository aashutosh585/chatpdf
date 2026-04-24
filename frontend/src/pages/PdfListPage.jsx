import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PdfTable from '../components/PdfTable';
import { useAuth } from '../hooks/useAuth';

const PdfListPage = () => {
  const { user, logout } = useAuth();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const token = localStorage.getItem('token');
        // Fetch PDFs
        const pdfsResponse = await axios.get('http://localhost:8000/user/pdfs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (pdfsResponse.data.success) {
          setPdfs(pdfsResponse.data.pdfs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My PDF Documents</h1>
              <p className="mt-2 text-gray-600">
                Click on any PDF to start chatting with AI about it
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-150 flex items-center space-x-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Upload New PDF</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {!loading && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="shrink-0 bg-blue-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm font-medium">Total PDFs</p>
                  <p className="text-2xl font-semibold text-gray-900">{pdfs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="shrink-0 bg-green-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm font-medium">Ready to Chat</p>
                  <p className="text-2xl font-semibold text-gray-900">{pdfs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="shrink-0 bg-purple-500 rounded-md p-3">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5">
                  <p className="text-gray-500 text-sm font-medium">Last Upload</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {pdfs.length > 0
                      ? new Date(pdfs[0].createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Table */}
        <div className="bg-white rounded-lg shadow">
          <PdfTable pdfs={pdfs} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default PdfListPage;
