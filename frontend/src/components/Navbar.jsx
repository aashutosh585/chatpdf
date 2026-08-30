import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        {/* Logo routes to /dashboard if logged in, otherwise / */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="flex items-center space-x-2.5 group"
          title={user ? "Go to Dashboard" : "Home"}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 flex items-center justify-center text-white font-black text-base shadow-sm transition">
            C
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Chat<span className="text-indigo-600">PDF</span>
          </span>
        </Link>

        {user ? (
          <div className="flex items-center space-x-3 sm:space-x-5">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-semibold px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/pdfs')}
                className="text-xs font-semibold px-3 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/60 transition"
              >
                My Documents
              </button>
            </nav>

            <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">{user.name || 'User'}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{user.email}</p>
              </div>

              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
