import React from 'react';
import { useNavigate } from 'react-router-dom';

const PdfTable = ({ pdfs, loading, onDeletePdf }) => {
  const navigate = useNavigate();

  const handlePdfClick = (pdf) => {
    navigate(`/chat/${pdf.pdfId}`, { state: { pdfName: pdf.fileName } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!pdfs || pdfs.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">No PDFs uploaded yet</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
          Upload your first PDF document to start querying it with AI.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Document Name
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date Added
            </th>
            <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {pdfs.map((pdf, index) => (
            <tr
              key={pdf.id || pdf.pdfId || index}
              className="hover:bg-indigo-50/30 transition-colors duration-150 cursor-pointer"
              onClick={() => handlePdfClick(pdf)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-400">
                {index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="shrink-0 h-9 w-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mr-3 font-bold text-xs">
                    PDF
                  </div>
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                    {pdf.fileName}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {pdf.createdAt
                  ? new Date(pdf.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePdfClick(pdf);
                    }}
                    className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition"
                  >
                    Chat
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePdf?.(pdf.pdfId);
                    }}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete PDF"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PdfTable;
