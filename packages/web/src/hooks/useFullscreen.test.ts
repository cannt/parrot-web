import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useFullscreen } from './useFullscreen';

// Mock the Fullscreen API
const mockRequestFullscreen = vi.fn();
const mockExitFullscreen = vi.fn();

// Setup fullscreen API mocks
Object.defineProperty(document, 'fullscreenEnabled', {
  writable: true,
  value: true
});

Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null
});

Object.defineProperty(document.documentElement, 'requestFullscreen', {
  writable: true,
  value: mockRequestFullscreen
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: mockExitFullscreen
});

// Mock event listeners
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(document, 'addEventListener', {
  writable: true,
  value: mockAddEventListener
});
Object.defineProperty(document, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener
});

describe('useFullscreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestFullscreen.mockResolvedValue(undefined);
    mockExitFullscreen.mockResolvedValue(undefined);
    
    // Reset fullscreen state
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null
    });
    
    // Reset fullscreen enabled
    Object.defineProperty(document, 'fullscreenEnabled', {
      writable: true,
      value: true
    });
  });

  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useFullscreen());

      expect(result.current.isFullscreen).toBe(false);
      expect(result.current.isSupported).toBe(true);
      expect(typeof result.current.toggleFullscreen).toBe('function');
      expect(typeof result.current.enterFullscreen).toBe('function');
      expect(typeof result.current.exitFullscreen).toBe('function');
    });

    it('should detect unsupported browsers', () => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        writable: true,
        value: false
      });

      const { result } = renderHook(() => useFullscreen());
      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('Event listeners', () => {
    it('should set up fullscreen change event listeners', () => {
      renderHook(() => useFullscreen());

      const expectedEvents = [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'msfullscreenchange'
      ];

      expectedEvents.forEach(event => {
        expect(mockAddEventListener).toHaveBeenCalledWith(
          event,
          expect.any(Function)
        );
      });
    });

    it('should set up keyboard event listener', () => {
      renderHook(() => useFullscreen());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useFullscreen());

      unmount();

      const expectedEvents = [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'msfullscreenchange'
      ];

      expectedEvents.forEach(event => {
        expect(mockRemoveEventListener).toHaveBeenCalledWith(
          event,
          expect.any(Function)
        );
      });

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });
  });

  describe('Enter fullscreen', () => {
    it('should enter fullscreen mode successfully', async () => {
      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.enterFullscreen();
      });

      expect(mockRequestFullscreen).toHaveBeenCalledOnce();
    });

    it('should throw error when fullscreen is not supported', async () => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        writable: true,
        value: false
      });

      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await expect(result.current.enterFullscreen()).rejects.toThrow(
          'Fullscreen API is not supported'
        );
      });
    });

    it('should handle requestFullscreen errors', async () => {
      const error = new Error('Fullscreen request failed');
      mockRequestFullscreen.mockRejectedValue(error);

      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await expect(result.current.enterFullscreen()).rejects.toThrow(
          'Fullscreen request failed'
        );
      });
    });
  });

  describe('Exit fullscreen', () => {
    it('should exit fullscreen mode successfully', async () => {
      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.exitFullscreen();
      });

      expect(mockExitFullscreen).toHaveBeenCalledOnce();
    });

    it('should throw error when fullscreen is not supported', async () => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        writable: true,
        value: false
      });

      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await expect(result.current.exitFullscreen()).rejects.toThrow(
          'Fullscreen API is not supported'
        );
      });
    });

    it('should handle exitFullscreen errors', async () => {
      const error = new Error('Exit fullscreen failed');
      mockExitFullscreen.mockRejectedValue(error);

      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await expect(result.current.exitFullscreen()).rejects.toThrow(
          'Exit fullscreen failed'
        );
      });
    });
  });

  describe('Toggle fullscreen', () => {
    it('should enter fullscreen when not in fullscreen mode', async () => {
      const { result } = renderHook(() => useFullscreen());

      await act(async () => {
        await result.current.toggleFullscreen();
      });

      expect(mockRequestFullscreen).toHaveBeenCalledOnce();
      expect(mockExitFullscreen).not.toHaveBeenCalled();
    });

    it('should exit fullscreen when in fullscreen mode', async () => {
      // Mock being in fullscreen mode
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement
      });

      const { result } = renderHook(() => useFullscreen());

      // Trigger the fullscreen change event to update the hook's state
      await act(async () => {
        const fullscreenChangeHandler = mockAddEventListener.mock.calls.find(
          call => call[0] === 'fullscreenchange'
        )?.[1];
        
        if (fullscreenChangeHandler) {
          fullscreenChangeHandler();
        }
      });

      // Verify we're in fullscreen mode
      expect(result.current.isFullscreen).toBe(true);

      await act(async () => {
        await result.current.toggleFullscreen();
      });

      expect(mockExitFullscreen).toHaveBeenCalledOnce();
      expect(mockRequestFullscreen).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard events', () => {
    it('should exit fullscreen on Escape key when in fullscreen mode', async () => {
      // Set up fullscreen state before rendering the hook
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: document.documentElement
      });

      const { result } = renderHook(() => useFullscreen());

      // Wait for the hook to initialize and recognize the fullscreen state
      await act(async () => {
        // Trigger the fullscreen change event to update the state
        const fullscreenChangeHandler = mockAddEventListener.mock.calls.find(
          call => call[0] === 'fullscreenchange'
        )?.[1];
        
        if (fullscreenChangeHandler) {
          fullscreenChangeHandler();
        }
      });

      // Verify we're in fullscreen mode
      expect(result.current.isFullscreen).toBe(true);

      // Get the latest keyboard event handler that was registered (after fullscreen state change)
      const keydownCalls = mockAddEventListener.mock.calls.filter(
        call => call[0] === 'keydown'
      );
      const keydownHandler = keydownCalls[keydownCalls.length - 1]?.[1];

      expect(keydownHandler).toBeDefined();

      // Simulate Escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      
      await act(async () => {
        keydownHandler(escapeEvent);
      });

      expect(mockExitFullscreen).toHaveBeenCalledOnce();
    });

    it('should not exit fullscreen on other keys', async () => {
      renderHook(() => useFullscreen());

      // Get the keyboard event handler
      const keydownHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'keydown'
      )?.[1];

      // Simulate other key press
      const otherKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      await act(async () => {
        keydownHandler(otherKeyEvent);
      });

      expect(mockExitFullscreen).not.toHaveBeenCalled();
    });
  });
});