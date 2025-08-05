import React from 'react';
import { FiZap, FiArrowRight, FiPlay } from 'react-icons/fi';

interface HeroProps {
  onSignupClick: () => void;
  isVisible: boolean;
}

export default function Hero({ onSignupClick, isVisible }: HeroProps) {
  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
              Fire News
            </span>
            <br />
            <span className="text-gray-800">Intelligence Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced monitoring and verification system for fire-related news worldwide. 
            Stay informed with real-time updates and verified information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onSignupClick}
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Start Free Trial</span>
              <FiArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 border-2 border-teal-500 text-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-300 flex items-center space-x-2 text-lg font-semibold">
              <FiPlay className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 