import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '../api/apiClient';

const SUGGESTED_QUESTIONS = [
  '📋 Summarize the main topics in this document',
  '💡 What are the key concepts and definitions?',
  '🔍 Explain the core principles with examples',
  '❓ What are the most important takeaways?',
];

const ChatInterface = ({ pdfId, pdfName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Reset and initialize welcome message
    setMessages([
      {
        type: 'system',
        content: `👋 **Welcome!** I have read and indexed **${pdfName}**.\n\nAsk me any question, request summaries, or click one of the suggested prompts below to get started!`,
      },
    ]);
  }, [pdfName, pdfId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (!query || !query.trim() || loading || !pdfId) return;

    const userMessage = query.trim();
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message to chat
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.type === 'user' || m.type === 'assistant')
        .map((m) => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          text: m.content,
        }));

      const response = await apiClient.post('/user/chat', {
        question: userMessage,
        pdfId: pdfId,
        history: historyPayload,
      });

      if (response.data && response.data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content: response.data.answer,
            sources: response.data.sources || [],
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errMsg =
        error.response?.data?.answer ||
        error.response?.data?.message ||
        'Sorry, I encountered an issue processing your request. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          content: errMsg,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setInputMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation messages?')) {
      setMessages([
        {
          type: 'system',
          content: `👋 Chat cleared. Ready to answer questions about **${pdfName}**.`,
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-gray-200/80 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-6 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3 truncate">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm sm:text-base font-bold truncate leading-tight">{pdfName}</h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-xs text-indigo-200">AI-Powered Grounded Q&A</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="text-xs font-medium text-indigo-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition border border-white/10 flex items-center space-x-1"
          title="Clear Conversation"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex items-start space-x-2.5 max-w-[92%] sm:max-w-[82%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar Icon */}
              {message.type === 'user' ? (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  U
                </div>
              ) : message.type === 'assistant' ? (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              ) : null}

              {/* Message Content Bubble */}
              <div
                className={`rounded-2xl px-5 py-4 shadow-sm text-sm ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : message.type === 'system'
                    ? 'bg-white border border-indigo-100 text-gray-800 rounded-2xl w-full'
                    : message.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                    : 'bg-white border border-gray-200/90 text-gray-800 rounded-tl-none'
                }`}
              >
                {/* Header for Assistant Message */}
                {message.type === 'assistant' && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-indigo-700">
                      <span>Gemini Assistant</span>
                    </div>
                    <button
                      onClick={() => handleCopyMessage(message.content, index)}
                      className="text-gray-400 hover:text-indigo-600 p-1 rounded transition"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center">
                          ✓ Copied
                        </span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {/* Markdown Rendering */}
                {message.type === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-indigo text-gray-800 leading-relaxed space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-gray-900 mt-3 mb-1" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-sm font-bold text-gray-800 mt-2 mb-1" {...props} />,
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code className="bg-gray-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs font-semibold" {...props} />
                          ) : (
                            <code className="block bg-gray-900 text-gray-100 p-3 rounded-xl font-mono text-xs overflow-x-auto my-2" {...props} />
                          ),
                        strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-indigo-400 pl-3 my-2 text-gray-600 italic bg-indigo-50/40 py-1 rounded-r" {...props} />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Source Citations with Modal Preview */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      📄 Document Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {message.sources.map((source, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedSource(source)}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200/60 shadow-2xs"
                        >
                          Page {source.page}
                          <span className="ml-1 text-[10px] text-indigo-400">↗</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Suggested Prompts on First Load */}
        {messages.length === 1 && !loading && (
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Suggested Questions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((promptText, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(promptText)}
                  className="text-left px-3.5 py-2.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl text-xs font-medium text-gray-700 hover:text-indigo-700 transition shadow-2xs group flex items-center justify-between"
                >
                  <span>{promptText}</span>
                  <span className="text-gray-400 group-hover:text-indigo-600 ml-2">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="bg-white border border-gray-200/90 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-indigo-600">Retrieving context & generating answer</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Source Excerpt Modal Preview */}
      {selectedSource && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg mr-2 text-xs">📄</span>
                Context from Page {selectedSource.page}
              </h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-gray-400 hover:text-gray-600 text-sm p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 p-4 rounded-xl font-mono leading-relaxed max-h-60 overflow-y-auto">
              "{selectedSource.snippet}"
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedSource(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-gray-200/90">
        <div className="relative flex items-end bg-gray-50 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl p-2 transition">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question, request summary, or clarify a concept..."
            className="w-full bg-transparent border-0 px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none max-h-36 min-h-[40px] leading-relaxed"
            rows={1}
            disabled={loading}
          />
          <div className="flex items-center space-x-2 shrink-0 pb-1 pr-1">
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition shadow-sm"
              title="Send message (Enter)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1.5 px-2 text-[11px] text-gray-400">
          <span>Press <strong>Enter ↵</strong> to send, <strong>Shift + Enter</strong> for new line</span>
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
