import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Navbar from '../components/Navbar';
import PdfTable from '../components/PdfTable';
import { useAuth } from '../hooks/useAuth';

const PdfListPage = () => {
  const { user, logout } = useAuth();
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/user/pdfs');

      if (response.data.success && Array.isArray(response.data.pdfs)) {
        setPdfs(
          response.data.pdfs.map((pdf) => ({
            id: pdf._id || pdf.id,
            fileName: pdf.fileName || pdf.file_name || 'Untitled Document',
            pdfId: pdf.pdfId || pdf.pdf_id,
            namespace: pdf.namespace,
            createdAt: pdf.createdAt || pdf.created_at,
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this PDF and its vector index? This cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      setDeleteError('');
      const response = await apiClient.delete(`/user/pdfs/${pdfId}`);

      if (response.data.success) {
        setPdfs((prev) => prev.filter((pdf) => pdf.pdfId !== pdfId));
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      setDeleteError(
        error.response?.data?.message || 'Failed to delete PDF. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} onLogout={logout} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              My PDF Documents
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Select any document to start querying it with AI
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 shadow-sm transition"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload New PDF
          </button>
        </div>

        {deleteError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {deleteError}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Uploads</p>
                <p className="text-2xl font-extrabold text-gray-900">{pdfs.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Vectorized & Ready</p>
                <p className="text-2xl font-extrabold text-gray-900">{pdfs.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recent Upload</p>
                <p className="text-sm font-bold text-gray-900">
                  {pdfs.length > 0 && pdfs[0].createdAt
                    ? new Date(pdfs[0].createdAt).toLocaleDateString()
                    : 'None yet'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <PdfTable pdfs={pdfs} loading={loading} onDeletePdf={handleDeletePdf} />
        </div>
      </div>
    </div>
  );
};

export default PdfListPage;
