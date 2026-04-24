import React from 'react';

const Navbar = ({ user, onLogout }) => {
  console.log("Navbar user:", user);
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">ChatPDF</h1>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name || 'User'}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
