import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock hooks
vi.mock('../hooks/useDroneSocket', () => ({
  useDroneSocket: () => ({
    isConnected: true,
    isDroneConnected: true,
    latestTelemetry: {
      flightState: 'landed',
      batteryPercentage: 75,
      wifiSignalStrength: 'Strong'
    },
    latestVideoData: {
      sequenceNumber: 1,
      timestamp: Date.now() - 100,
      chunk: Buffer.from('test-video-data')
    },
    isVideoStreamActive: true,
    connectionError: null,
    sendCommand: vi.fn(),
    reconnectDrone: vi.fn()
  })
}));

vi.mock('../hooks/useKeyboardControls', () => ({
  useKeyboardControls: () => ({
    isActive: false
  })
}));

// Mock viewport dimensions for mobile testing
const mockViewport = (width: number, height: number) => {
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
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('App - Mobile Responsive Tests', () => {
  beforeEach(() => {
    // Start with mobile portrait dimensions
    mockViewport(375, 667);
  });

  describe('Mobile Portrait Layout', () => {
    it('should render mobile-optimized header', () => {
      render(<App />);
      
      // Check header has mobile-appropriate styling
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('p-2', 'sm:p-3');
      
      // Check title is responsive
      const title = screen.getByText(/AR Drone Controller v1.3/);
      expect(title).toHaveClass('text-sm', 'sm:text-lg', 'lg:text-xl');
    });

    it('should show mobile status indicators with abbreviations', () => {
      render(<App />);
      
      // Mobile should show abbreviated status labels
      expect(screen.getByText('BE')).toBeInTheDocument(); // Backend abbreviated
      expect(screen.getByText('DR')).toBeInTheDocument(); // Drone abbreviated  
      expect(screen.getByText('VD')).toBeInTheDocument(); // Video abbreviated
    });

    it('should render touch-optimized flight controls', () => {
      render(<App />);
      
      // Check takeoff/land button has minimum touch target size
      const takeoffButton = screen.getByText(/Takeoff/);
      expect(takeoffButton).toHaveClass('min-h-[44px]');
      
      // Check emergency stop button has minimum touch target size
      const emergencyButton = screen.getByText('🛑');
      expect(emergencyButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
      
      // Check camera switch button has minimum touch target size
      const cameraButton = screen.getByText('📷');
      expect(cameraButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });

    it('should show virtual joysticks on mobile', () => {
      render(<App />);
      
      // Virtual joysticks should be visible on mobile
      const joystickSection = screen.getByText('🕹️ Touch Controls');
      expect(joystickSection).toBeInTheDocument();
      
      // Check joysticks are present
      const joysticks = screen.getAllByTestId(/joystick/);
      expect(joysticks).toHaveLength(4); // 2 in touch controls + 2 at bottom
    });

    it('should render mobile-optimized telemetry display', () => {
      render(<App />);
      
      // Check battery display has mobile-appropriate sizing
      expect(screen.getByText('75%')).toHaveClass('text-base', 'sm:text-lg');
      
      // Check WiFi display
      expect(screen.getByText('Strong')).toHaveClass('text-base', 'sm:text-lg');
      
      // Check progress bar has mobile-appropriate height
      const progressBars = document.querySelectorAll('.h-2');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Landscape Layout', () => {
    beforeEach(() => {
      // Switch to mobile landscape
      mockViewport(667, 375);
    });

    it('should adapt layout for landscape mode', async () => {
      render(<App />);
      
      // Wait for viewport hook to update
      await waitFor(() => {
        // Main content should use row layout in landscape
        const main = document.querySelector('main');
        expect(main).toHaveClass('flex-row');
      });
    });

    it('should hide touch controls in landscape on mobile', async () => {
      render(<App />);
      
      await waitFor(() => {
        // Touch controls section should be hidden in mobile landscape
        const touchControls = screen.queryByText('🕹️ Touch Controls');
        expect(touchControls).not.toBeInTheDocument();
      });
    });

    it('should adjust sidebar width in landscape', async () => {
      render(<App />);
      
      await waitFor(() => {
        // Sidebar should have adjusted width for landscape
        const aside = document.querySelector('aside');
        expect(aside).toHaveClass('w-72');
      });
    });
  });

  describe('Touch Interaction Tests', () => {
    it('should handle touch events on flight controls', () => {
      const mockSendCommand = vi.fn();
      vi.mocked(require('../hooks/useDroneSocket').useDroneSocket).mockReturnValue({
        isConnected: true,
        isDroneConnected: true,
        latestTelemetry: { flightState: 'landed', batteryPercentage: 75, wifiSignalStrength: 'Strong' },
        latestVideoData: null,
        isVideoStreamActive: false,
        connectionError: null,
        sendCommand: mockSendCommand,
        reconnectDrone: vi.fn()
      });

      render(<App />);
      
      const takeoffButton = screen.getByText(/Takeoff/);
      
      // Simulate touch events
      fireEvent.touchStart(takeoffButton);
      fireEvent.touchEnd(takeoffButton);
      fireEvent.click(takeoffButton);
      
      expect(mockSendCommand).toHaveBeenCalledWith({
        type: 'TAKE_OFF',
        timestamp: expect.any(Number)
      });
    });

    it('should have touch-manipulation class on interactive elements', () => {
      render(<App />);
      
      // Flight control buttons should have touch-manipulation
      const takeoffButton = screen.getByText(/Takeoff/);
      expect(takeoffButton).toHaveClass('touch-manipulation');
      
      // Emergency button should have touch-manipulation
      const emergencyButton = screen.getByText('🛑');
      expect(emergencyButton).toHaveClass('touch-manipulation');
    });
  });

  describe('Responsive Breakpoint Tests', () => {
    it('should handle tablet viewport (768px)', () => {
      mockViewport(768, 1024);
      render(<App />);
      
      // Should show full status labels on tablet
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('Drone')).toBeInTheDocument();
      expect(screen.getByText('Video')).toBeInTheDocument();
    });

    it('should handle small mobile viewport (320px)', () => {
      mockViewport(320, 568);
      render(<App />);
      
      // Should still render and be functional at small sizes
      expect(screen.getByText(/AR Drone Controller/)).toBeInTheDocument();
      expect(screen.getByText(/Takeoff/)).toBeInTheDocument();
    });

    it('should handle large mobile viewport (414px)', () => {
      mockViewport(414, 896);
      render(<App />);
      
      // Should render mobile layout but with more space
      expect(screen.getByText('BE')).toBeInTheDocument(); // Still abbreviated
      expect(screen.getByText('🕹️ Touch Controls')).toBeInTheDocument();
    });
  });

  describe('Orientation Change Tests', () => {
    it('should handle orientation change events', async () => {
      render(<App />);
      
      // Start in portrait
      expect(screen.getByText('🕹️ Touch Controls')).toBeInTheDocument();
      
      // Rotate to landscape
      mockViewport(667, 375);
      fireEvent(window, new Event('orientationchange'));
      
      // Wait for timeout in orientation handler
      await waitFor(() => {
        expect(screen.queryByText('🕹️ Touch Controls')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('should maintain functionality across orientation changes', async () => {
      const mockSendCommand = vi.fn();
      vi.mocked(require('../hooks/useDroneSocket').useDroneSocket).mockReturnValue({
        isConnected: true,
        isDroneConnected: true,
        latestTelemetry: { flightState: 'landed', batteryPercentage: 75, wifiSignalStrength: 'Strong' },
        latestVideoData: null,
        isVideoStreamActive: false,
        connectionError: null,
        sendCommand: mockSendCommand,
        reconnectDrone: vi.fn()
      });

      render(<App />);
      
      // Function should work in portrait
      fireEvent.click(screen.getByText(/Takeoff/));
      expect(mockSendCommand).toHaveBeenCalledTimes(1);
      
      // Rotate to landscape
      mockViewport(667, 375);
      fireEvent(window, new Event('orientationchange'));
      
      await waitFor(() => {
        // Function should still work in landscape
        fireEvent.click(screen.getByText(/Takeoff/));
        expect(mockSendCommand).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Mobile Video Player Tests', () => {
    it('should render mobile-optimized video overlays', () => {
      render(<App />);
      
      // Status overlay should have mobile positioning
      const statusOverlay = document.querySelector('.absolute.top-2.left-2');
      expect(statusOverlay).toBeInTheDocument();
      
      // Video info should be compact on mobile
      const videoInfo = document.querySelector('.absolute.bottom-2.right-2');
      expect(videoInfo).toBeInTheDocument();
    });

    it('should handle touch events on video area', () => {
      render(<App />);
      
      const videoImg = screen.getByAltText('Drone video stream');
      expect(videoImg).toHaveClass('touch-manipulation');
      
      // Should handle touch without interfering with video display
      fireEvent.touchStart(videoImg);
      fireEvent.touchEnd(videoImg);
      
      // Video should remain functional
      expect(videoImg).toBeInTheDocument();
    });
  });

  describe('Mobile FullScreen Control Tests', () => {
    it('should render mobile-sized fullscreen button', () => {
      render(<App />);
      
      // FullScreen button should have minimum touch target size
      const fullscreenButtons = document.querySelectorAll('.min-w-\\[44px\\].min-h-\\[44px\\]');
      expect(fullscreenButtons.length).toBeGreaterThan(0);
    });

    it('should have mobile-appropriate icon sizes', () => {
      render(<App />);
      
      // Icons should be mobile-responsive (w-4 h-4 sm:w-5 sm:h-5)
      const icons = document.querySelectorAll('svg.w-4.h-4.sm\\:w-5.sm\\:h-5');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});