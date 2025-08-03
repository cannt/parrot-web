import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import FullScreenControl from './FullScreenControl';

// Mock the useFullscreen hook
const mockToggleFullscreen = vi.fn();
const mockUseFullscreen = {
  isFullscreen: false,
  toggleFullscreen: mockToggleFullscreen,
  exitFullscreen: vi.fn(),
  enterFullscreen: vi.fn(),
  isSupported: true
};

vi.mock('../hooks/useFullscreen', () => ({
  useFullscreen: () => mockUseFullscreen
}));

describe('FullScreenControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToggleFullscreen.mockResolvedValue(undefined);
    mockUseFullscreen.isFullscreen = false;
    mockUseFullscreen.isSupported = true;
  });

  describe('Rendering', () => {
    it('should render fullscreen button when supported', () => {
      render(<FullScreenControl />);

      const button = screen.getByRole('button', { name: /enter full screen mode/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Enter Full Screen');
    });

    it('should not render when fullscreen is not supported', () => {
      mockUseFullscreen.isSupported = false;

      const { container } = render(<FullScreenControl />);
      expect(container.firstChild).toBeNull();
    });

    it('should apply custom className', () => {
      const { container } = render(<FullScreenControl className="custom-class" />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Visual state changes', () => {
    it('should show enter fullscreen icon when not in fullscreen mode', () => {
      mockUseFullscreen.isFullscreen = false;

      render(<FullScreenControl />);

      const button = screen.getByRole('button', { name: /enter full screen mode/i });
      expect(button).toHaveAttribute('title', 'Enter Full Screen');
      expect(button).toHaveClass('bg-gray-600');
    });

    it('should show exit fullscreen icon when in fullscreen mode', () => {
      mockUseFullscreen.isFullscreen = true;

      render(<FullScreenControl />);

      const button = screen.getByRole('button', { name: /exit full screen mode/i });
      expect(button).toHaveAttribute('title', 'Exit Full Screen (Esc)');
      expect(button).toHaveClass('bg-orange-600');
    });

    it('should show loading spinner when toggling', async () => {
      // Make toggleFullscreen take some time
      mockToggleFullscreen.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      
      fireEvent.click(button);

      // Check for loading state immediately after click
      expect(button).toBeDisabled();
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(button).toBeEnabled();
      }, { timeout: 500 });
    });
  });

  describe('Click handling', () => {
    it('should call toggleFullscreen when clicked', async () => {
      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockToggleFullscreen).toHaveBeenCalledOnce();
    });

    it('should handle toggleFullscreen errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Fullscreen failed');
      mockToggleFullscreen.mockRejectedValue(error);

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to toggle fullscreen:', error);
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not call toggleFullscreen when not supported', () => {
      mockUseFullscreen.isSupported = false;

      const { container } = render(<FullScreenControl />);
      expect(container.firstChild).toBeNull();
      expect(mockToggleFullscreen).not.toHaveBeenCalled();
    });

    it('should disable button during loading and re-enable after completion', async () => {
      let resolveToggle: () => void;
      mockToggleFullscreen.mockImplementation(() => 
        new Promise<void>(resolve => {
          resolveToggle = resolve;
        })
      );

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      expect(button).toBeEnabled();

      fireEvent.click(button);

      // Button should be disabled during the operation
      expect(button).toBeDisabled();

      // Resolve the promise
      resolveToggle!();

      // Wait for the button to be re-enabled
      await waitFor(() => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for enter fullscreen', () => {
      mockUseFullscreen.isFullscreen = false;

      render(<FullScreenControl />);

      const button = screen.getByRole('button', { name: /enter full screen mode/i });
      expect(button).toHaveAttribute('aria-label', 'Enter full screen mode');
    });

    it('should have proper ARIA labels for exit fullscreen', () => {
      mockUseFullscreen.isFullscreen = true;

      render(<FullScreenControl />);

      const button = screen.getByRole('button', { name: /exit full screen mode/i });
      expect(button).toHaveAttribute('aria-label', 'Exit full screen mode');
    });

    it('should have proper title attributes for enter fullscreen', () => {
      mockUseFullscreen.isFullscreen = false;

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Enter Full Screen');
    });

    it('should have proper title attributes for exit fullscreen', () => {
      mockUseFullscreen.isFullscreen = true;

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Exit Full Screen (Esc)');
    });
  });

  describe('Icon rendering', () => {
    it('should render expand icon when not in fullscreen', () => {
      mockUseFullscreen.isFullscreen = false;

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('should render compress icon when in fullscreen', () => {
      mockUseFullscreen.isFullscreen = true;

      render(<FullScreenControl />);

      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-5', 'h-5');
    });
  });
});