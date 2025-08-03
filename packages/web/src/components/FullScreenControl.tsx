import React, { useState } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';

interface FullScreenControlProps {
  className?: string;
}

/**
 * FullScreenControl component for toggling full-screen mode
 * Displays a full-screen button with visual feedback for current mode
 */
export const FullScreenControl: React.FC<FullScreenControlProps> = ({
  className = ''
}) => {
  const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFullscreen = async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    
    try {
      await toggleFullscreen();
    } catch (error) {
      console.error('Failed to toggle fullscreen:', error);
    } finally {
      // Reset loading state after a brief delay
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const getFullscreenIcon = () => {
    if (isFullscreen) {
      // Exit fullscreen icon (minimize/compress)
      return (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0 0l5.5 5.5" 
          />
        </svg>
      );
    } else {
      // Enter fullscreen icon (expand)
      return (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" 
          />
        </svg>
      );
    }
  };

  // Don't render if fullscreen is not supported
  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={handleToggleFullscreen}
      disabled={isLoading}
      className={`flex items-center justify-center p-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFullscreen 
          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
          : 'bg-gray-600 hover:bg-gray-700 text-white'
      } ${className}`}
      title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
      aria-label={isFullscreen ? 'Exit full screen mode' : 'Enter full screen mode'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        getFullscreenIcon()
      )}
    </button>
  );
};

export default FullScreenControl;