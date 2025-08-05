import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface CTAProps {
  onSignupClick: () => void;
  onLoginClick: () => void;
}

export default function CTA({ onSignupClick, onLoginClick }: CTAProps) {
  return (
    <section className="relative z-10 px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust FireNewsDashboard for their fire-related news monitoring needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignupClick}
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2 text-lg font-semibold"
            >
              <span>Start Free Trial</span>
              <FiArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onLoginClick}
              className="px-8 py-4 border-2 border-teal-500 text-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-300 text-lg font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 