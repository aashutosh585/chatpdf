import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const UploadPdf = ({ onUploadSuccess }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('File size exceeds 15MB limit.');
        return;
      }
      setPdfFile(file);
    } else {
      setErrorMessage('Please select a valid PDF file (.pdf)');
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setErrorMessage('Please select a PDF file first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('pdf', pdfFile);

    try {
      const response = await apiClient.post('/user/uploadpdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success || response.status === 200) {
        const uploadedData = response.data;
        setPdfFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(uploadedData);
        }
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload PDF. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Document</h2>

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-6 text-center transition-colors duration-150 cursor-pointer bg-gray-50 hover:bg-indigo-50/20">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="w-12 h-12 text-indigo-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              {pdfFile ? pdfFile.name : 'Click to select or drag PDF here'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Max file size: 15MB
            </span>
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!pdfFile || loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing & Vectorizing...
            </span>
          ) : (
            'Upload & Start Chatting'
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadPdf;
