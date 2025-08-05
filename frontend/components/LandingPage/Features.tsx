import React from 'react';
import { FiZap, FiShield, FiBarChart, FiGlobe } from 'react-icons/fi';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeaturesProps {
  activeFeature: number;
  onFeatureClick: (index: number) => void;
}

const features: Feature[] = [
  {
    icon: FiZap,
    title: "Real-time Fire News",
    description: "Stay updated with the latest fire-related news from across the globe with our advanced monitoring system."
  },
  {
    icon: FiShield,
    title: "Verified Information",
    description: "All news entries are verified by our expert team to ensure accuracy and reliability."
  },
  {
    icon: FiBarChart,
    title: "Fire Risk Scoring",
    description: "Advanced AI-powered scoring system to assess fire-related risks and prioritize critical information."
  },
  {
    icon: FiGlobe,
    title: "Global Coverage",
    description: "Comprehensive coverage of fire incidents worldwide with detailed location tracking."
  }
];

export default function Features({ activeFeature, onFeatureClick }: FeaturesProps) {
  return (
    <section className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to monitor, verify, and manage fire-related news effectively
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                  activeFeature === index
                    ? 'bg-gradient-to-br from-teal-100 to-blue-100 shadow-xl transform scale-105'
                    : 'bg-white/70 hover:bg-white/90 shadow-lg hover:shadow-xl'
                }`}
                onClick={() => onFeatureClick(index)}
              >
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white'
                    : 'bg-teal-100 text-teal-600'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 