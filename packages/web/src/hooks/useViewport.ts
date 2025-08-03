import { useState, useEffect } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook to track viewport dimensions and orientation
 * Provides responsive breakpoint information for mobile-first design
 */
export const useViewport = (): ViewportInfo => {
  const [viewport, setViewport] = useState<ViewportInfo>(() => {
    // Initial values (SSR-safe)
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    return {
      width,
      height,
      isPortrait: height > width,
      isLandscape: width >= height,
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024
    };
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({
        width,
        height,
        isPortrait: height > width,
        isLandscape: width >= height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    // Set initial values
    updateViewport();

    // Listen for resize events (covers orientation changes)
    window.addEventListener('resize', updateViewport);
    
    // Listen for orientation change events specifically
    window.addEventListener('orientationchange', () => {
      // Small delay to allow browser to update dimensions
      setTimeout(updateViewport, 100);
    });

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return viewport;
};