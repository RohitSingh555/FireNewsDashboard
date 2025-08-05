import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* 3D Techy Spinner */}
      <div className={`relative ${sizeClasses[size]} mb-4 loading-spinner-3d`}>
        {/* Outer Ring - Teal to Blue */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-teal-500 border-r-blue-500 border-b-teal-400 border-l-blue-400 animate-spin loading-ring`}
          style={{ animationDuration: '2s' }}
        ></div>
        
        {/* Middle Ring - Cool Gray to Slate */}
        <div 
          className={`absolute inset-2 ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} rounded-full border-3 border-transparent border-t-gray-500 border-r-slate-500 border-b-gray-400 border-l-slate-400 animate-spin loading-ring`} 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
        
        {/* Inner Ring - Teal Light to Teal Medium */}
        <div 
          className={`absolute inset-4 ${size === 'sm' ? 'w-0 h-0' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'} rounded-full border-2 border-transparent border-t-teal-300 border-r-teal-400 border-b-teal-200 border-l-teal-300 animate-spin loading-ring`} 
          style={{ animationDuration: '1s' }}
        ></div>
        
        {/* Center Core with 3D Effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full loading-core flex items-center justify-center animate-core-pulse`}>
          <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'} rounded-full bg-white animate-pulse shadow-lg`}></div>
        </div>
        
        {/* Glowing Effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-br from-teal-400/20 via-blue-500/20 to-teal-300/20 animate-pulse`}></div>
        
        {/* Particle Effects */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full loading-particle"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-50%)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
        
        {/* Additional 3D Glow Rings */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-glow-pulse`} style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(13,148,136,0.1) 100%)'
        }}></div>
      </div>
      
      {/* Loading Text */}
      {text && (
        <div className={`text-center ${textSizes[size]}`}>
          <div className="text-gray-600 dark:text-gray-300 font-medium">{text}</div>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <div className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Full Screen Loading Component
export function FullScreenLoader({ text = 'Loading FireNewsDashboard...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
        
        {/* Additional Techy Elements */}
        <div className="mt-8 space-y-4">
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 via-blue-500 to-teal-400 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Status Text */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span>Initializing dashboard...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Loading data...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Preparing interface...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Loading Component
export function InlineLoader({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <LoadingSpinner size={size} text="" />
    </div>
  );
}

// Button Loading Component
export function ButtonLoader({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <LoadingSpinner size={size} text="" />
    </div>
  );
} 