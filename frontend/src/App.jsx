import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/loginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PdfListPage from './pages/PdfListPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pdfs"
          element={
            <ProtectedRoute>
              <PdfListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:pdfId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
