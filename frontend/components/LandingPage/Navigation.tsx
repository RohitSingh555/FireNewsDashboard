import React from 'react';
import { FiZap } from 'react-icons/fi';

interface NavigationProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function Navigation({ onLoginClick, onSignupClick }: NavigationProps) {
  return (
    <nav className="relative z-10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiZap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            FireNewsDashboard
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onLoginClick}
            className="px-6 py-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Login
          </button>
          <button
            onClick={onSignupClick}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
} 