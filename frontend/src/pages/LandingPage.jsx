import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                C
              </div>
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                Chat<span className="text-indigo-600">PDF</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/aashutosh585/chatpdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                title="GitHub Repository"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 mb-6">
              <span>✨ Powered by Gemini 2.5 & Pinecone Vector DB</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Chat with Your <br className="hidden sm:inline" />
              <span className="text-indigo-600">PDF Documents</span> Instantly
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your documents and extract accurate, grounded answers in seconds with conversational AI and semantic vector search.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-indigo-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md transition"
                >
                  Open Dashboard Workspace →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md transition"
                >
                  Start Chatting for Free →
                </Link>
              )}
              <a
                href="https://github.com/aashutosh585/chatpdf"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-300 bg-white text-gray-700 px-7 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-xs transition flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Platform Features</h2>
            <p className="text-base text-gray-600">Built for precision, speed, and privacy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart PDF Chunking</h3>
              <p className="text-sm text-gray-600">Recursive character chunking with intelligent token overlaps for maximum contextual retention.</p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gemini Generative Chat</h3>
              <p className="text-sm text-gray-600">Powered by Google Gemini 2.5 Flash for rapid, accurate, multi-turn conversational responses.</p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">1024-Dim Vector Search</h3>
              <p className="text-sm text-gray-600">Pinecone Inference cosine similarity search to retrieve the most relevant passages in milliseconds.</p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Tenant Isolation</h3>
              <p className="text-sm text-gray-600">Strict dynamic Pinecone namespaces per document and user to prevent cross-user data exposure.</p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Batch Vectorization</h3>
              <p className="text-sm text-gray-600">Parallel embeddings ingestion so 100+ page documents are processed in single-digit seconds.</p>
            </div>

            <div className="bg-gray-50/70 p-6 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Source Grounding</h3>
              <p className="text-sm text-gray-600">Answers include page references and citation snippets for easy fact verification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Query Your Documents?</h2>
          <p className="text-base text-indigo-100 mb-8 max-w-xl mx-auto">
            Upload research papers, manuals, textbooks, or reports and get instant answers.
          </p>
          <div className="flex justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-lg transition"
              >
                Go to Workspace Dashboard →
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 shadow-lg transition"
              >
                Get Started Now →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold">ChatPDF</h3>
            <p className="text-xs text-gray-400">AI-Powered Document Intelligence Platform</p>
          </div>
          <p className="text-xs text-gray-500">&copy; 2026 ChatPDF. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;