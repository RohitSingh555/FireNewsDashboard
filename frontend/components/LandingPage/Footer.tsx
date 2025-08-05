import React from 'react';
import { FiZap } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative z-10 px-6 py-12 bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FireNewsDashboard</span>
            </div>
            <p className="text-gray-300">
              Advanced fire news monitoring and verification platform for professionals worldwide.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Real-time Monitoring</li>
              <li>News Verification</li>
              <li>Risk Scoring</li>
              <li>Global Coverage</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Documentation</li>
              <li>API Reference</li>
              <li>Contact Support</li>
              <li>Status Page</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-300">
              <li>About Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Careers</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 FireNewsDashboard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 