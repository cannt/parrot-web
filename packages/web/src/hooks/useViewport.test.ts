import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useViewport } from './useViewport';

// Mock window dimensions
const mockWindowDimensions = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

// Mock resize event
const mockResizeEvent = (width: number, height: number) => {
  mockWindowDimensions(width, height);
  window.dispatchEvent(new Event('resize'));
};

// Mock orientation change event
const mockOrientationChange = (width: number, height: number) => {
  mockWindowDimensions(width, height);
  window.dispatchEvent(new Event('orientationchange'));
};

describe('useViewport', () => {
  beforeEach(() => {
    // Reset to default desktop size
    mockWindowDimensions(1024, 768);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial viewport detection', () => {
    it('should detect desktop viewport correctly', () => {
      mockWindowDimensions(1024, 768);
      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });

    it('should detect mobile viewport correctly', () => {
      mockWindowDimensions(375, 667);
      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect tablet viewport correctly', () => {
      mockWindowDimensions(768, 1024);
      const { result } = renderHook(() => useViewport());

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });
  });

  describe('responsive breakpoints', () => {
    it('should correctly identify mobile breakpoint (< 768px)', () => {
      mockWindowDimensions(320, 568);
      const { result } = renderHook(() => useViewport());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should correctly identify tablet breakpoint (768px - 1023px)', () => {
      mockWindowDimensions(768, 1024);
      const { result } = renderHook(() => useViewport());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should correctly identify desktop breakpoint (>= 1024px)', () => {
      mockWindowDimensions(1440, 900);
      const { result } = renderHook(() => useViewport());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });
  });

  describe('orientation detection', () => {
    it('should detect portrait orientation correctly', () => {
      mockWindowDimensions(375, 667); // Mobile portrait
      const { result } = renderHook(() => useViewport());

      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    it('should detect landscape orientation correctly', () => {
      mockWindowDimensions(667, 375); // Mobile landscape
      const { result } = renderHook(() => useViewport());

      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });
  });

  describe('window resize handling', () => {
    it('should update viewport on window resize', () => {
      const { result } = renderHook(() => useViewport());

      // Initial desktop
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);

      // Resize to mobile
      act(() => {
        mockResizeEvent(375, 667);
      });

      expect(result.current.width).toBe(375);
      expect(result.current.height).toBe(667);
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isPortrait).toBe(true);
    });

    it('should update breakpoints on resize', () => {
      const { result } = renderHook(() => useViewport());

      // Start mobile
      act(() => {
        mockResizeEvent(375, 667);
      });
      expect(result.current.isMobile).toBe(true);

      // Resize to tablet
      act(() => {
        mockResizeEvent(768, 1024);
      });
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);

      // Resize to desktop
      act(() => {
        mockResizeEvent(1200, 800);
      });
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isTablet).toBe(false);
    });
  });

  describe('orientation change handling', () => {
    it('should handle orientation change from portrait to landscape', () => {
      const { result } = renderHook(() => useViewport());

      // Start in portrait
      act(() => {
        mockResizeEvent(375, 667);
      });
      expect(result.current.isPortrait).toBe(true);

      // Rotate to landscape
      act(() => {
        mockOrientationChange(667, 375);
        // Wait for the setTimeout in orientationchange handler
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });

    it('should maintain device type during orientation change', () => {
      const { result } = renderHook(() => useViewport());

      // Start mobile portrait
      act(() => {
        mockResizeEvent(375, 667);
      });
      expect(result.current.isMobile).toBe(true);

      // Rotate to landscape - should still be mobile
      act(() => {
        mockOrientationChange(667, 375);
        vi.advanceTimersByTime(100);
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isLandscape).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle square viewport correctly', () => {
      mockWindowDimensions(500, 500);
      const { result } = renderHook(() => useViewport());

      // Square should be considered landscape (width >= height)
      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
    });

    it('should handle very small viewport', () => {
      mockWindowDimensions(320, 480);
      const { result } = renderHook(() => useViewport());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.width).toBe(320);
      expect(result.current.height).toBe(480);
    });

    it('should handle very large viewport', () => {
      mockWindowDimensions(2560, 1440);
      const { result } = renderHook(() => useViewport());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.width).toBe(2560);
      expect(result.current.height).toBe(1440);
    });
  });
});