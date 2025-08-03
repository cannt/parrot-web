import { useEffect, useState, useCallback } from 'react';

interface UseFullscreenReturn {
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
  enterFullscreen: () => Promise<void>;
  isSupported: boolean;
}

/**
 * Custom hook for managing full-screen mode using the Fullscreen API
 * Provides state management and event handling for full-screen functionality
 */
export const useFullscreen = (): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if Fullscreen API is supported
  const isSupported = !!(
    document.fullscreenEnabled ||
    (document as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
    (document as Document & { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled ||
    (document as Document & { msFullscreenEnabled?: boolean }).msFullscreenEnabled
  );

  // Update fullscreen state based on document state
  const updateFullscreenState = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
    );
    setIsFullscreen(isCurrentlyFullscreen);
  }, []);

  // Enter fullscreen mode
  const enterFullscreen = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Fullscreen API is not supported');
    }

    try {
      const element = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      throw error;
    }
  }, [isSupported]);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      throw new Error('Fullscreen API is not supported');
    }

    try {
      const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };
      
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      throw error;
    }
  }, [isSupported]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(async (): Promise<void> => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Handle keyboard events (Escape key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen().catch(console.error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  // Listen for fullscreen change events
  useEffect(() => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'msfullscreenchange'
    ];

    events.forEach(event => {
      document.addEventListener(event, updateFullscreenState);
    });

    // Initial state check
    updateFullscreenState();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateFullscreenState);
      });
    };
  }, [updateFullscreenState]);

  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
    enterFullscreen,
    isSupported
  };
};

export default useFullscreen;