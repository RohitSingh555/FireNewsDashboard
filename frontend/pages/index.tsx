import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import Navigation from '../components/LandingPage/Navigation';
import Hero from '../components/LandingPage/Hero';
import Features from '../components/LandingPage/Features';
import Stats from '../components/LandingPage/Stats';
import Testimonials from '../components/LandingPage/Testimonials';
import CTA from '../components/LandingPage/CTA';
import Footer from '../components/LandingPage/Footer';
import LoginModal from '../components/LandingPage/LoginModal';
import SignupModal from '../components/LandingPage/SignupModal';
import { FullScreenLoader } from '../components/LoadingSpinner';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true);
      // Add a small delay to show the loading animation
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);
    }
  }, [user, loading, router]);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Emergency Response Coordinator",
      content: "FireNewsDashboard has revolutionized how we monitor fire incidents. The real-time updates and verification system have been invaluable for our emergency response team.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Fire Safety Inspector",
      content: "The fire risk scoring feature helps us prioritize our inspections and allocate resources more effectively. It's a game-changer for fire safety management.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Research Director",
      content: "As a researcher studying fire patterns, the comprehensive data and global coverage provided by FireNewsDashboard have been essential for our analysis.",
      rating: 5
    }
  ];

  const handleLoginClick = () => setShowLoginModal(true);
  const handleSignupClick = () => setShowSignupModal(true);
  const handleFeatureClick = (index: number) => setActiveFeature(index);

  // Show loading screen while redirecting
  if (isRedirecting) {
    return <FullScreenLoader text="Redirecting to Dashboard..." />;
  }

  // Show loading screen while auth is loading
  if (loading) {
    return <FullScreenLoader text="Loading FireNewsDashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <Navigation onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />

      {/* Hero Section */}
      <Hero onSignupClick={handleSignupClick} isVisible={isVisible} />

      {/* Features Section */}
      <Features activeFeature={activeFeature} onFeatureClick={handleFeatureClick} />

      {/* Stats Section */}
      <Stats />

      {/* Testimonials Section */}
      <Testimonials testimonials={testimonials} />

      {/* CTA Section */}
      <CTA onSignupClick={handleSignupClick} onLoginClick={handleLoginClick} />

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }} 
        />
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal 
          onClose={() => setShowSignupModal(false)} 
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }} 
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 