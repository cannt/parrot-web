import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import CameraSwitchControl from './CameraSwitchControl';
import { DroneTelemetry } from '../types/types';

describe('CameraSwitchControl', () => {
  const mockOnCommand = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering with different flight states', () => {
    it('should render with unknown state', () => {
      render(<CameraSwitchControl telemetry={null} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Camera Control')).toBeInTheDocument();
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Bottom/i })).toBeDisabled();
      expect(screen.getByText('Camera control available when drone is connected')).toBeInTheDocument();
    });

    it('should render with landed state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Bottom/i })).toBeEnabled();
      expect(screen.queryByText('Camera control available when drone is connected')).not.toBeInTheDocument();
    });

    it('should render with flying state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 50,
        flightState: 'flying',
        wifiSignalStrength: 32
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Bottom/i })).toBeEnabled();
    });

    it('should render with hovering state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 60,
        flightState: 'hovering',
        wifiSignalStrength: 40
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Bottom/i })).toBeEnabled();
    });

    it('should render with error state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 25,
        flightState: 'error',
        wifiSignalStrength: 10
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Bottom/i })).toBeDisabled();
      expect(screen.getByText('Camera control unavailable in error state')).toBeInTheDocument();
    });
  });

  describe('Camera switching functionality', () => {
    it('should send SWITCH_CAMERA command when button clicked', async () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'SWITCH_CAMERA',
        timestamp: expect.any(Number)
      });
    });

    it('should toggle camera state display after clicking switch button', async () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      // Initially shows front camera
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Switch to Bottom/i })).toBeInTheDocument();

      // Click to switch to bottom camera
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);

      // Should show loading state
      expect(screen.getByText('Switching...')).toBeInTheDocument();

      // Wait for loading to complete and camera state to update
      await waitFor(() => {
        expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('bottom')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Switch to Front/i })).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should show loading state during camera switch', async () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);

      // Should show loading spinner and text
      expect(screen.getByText('Switching...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      expect(switchButton).toBeDisabled();
    });

    it('should not call onCommand when button is disabled (unknown state)', () => {
      render(<CameraSwitchControl telemetry={null} onCommand={mockOnCommand} />);
      
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);

      expect(mockOnCommand).not.toHaveBeenCalled();
    });

    it('should not call onCommand when in error state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 25,
        flightState: 'error',
        wifiSignalStrength: 10
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);

      expect(mockOnCommand).not.toHaveBeenCalled();
    });
  });

  describe('Visual styling and indicators', () => {
    it('should display correct camera indicator colors', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      // Front camera should have blue indicator
      expect(document.querySelector('.bg-blue-500')).toBeInTheDocument();

      // Click to switch to bottom camera
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);

      // Bottom camera should eventually have green indicator
      waitFor(() => {
        expect(document.querySelector('.bg-green-500')).toBeInTheDocument();
      });
    });

    it('should show camera icon in button', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      // Should contain SVG camera icon
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply correct button styling', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      expect(switchButton).toHaveClass('bg-purple-600');
    });
  });

  describe('Custom className prop', () => {
    it('should apply custom className to the container', () => {
      const { container } = render(
        <CameraSwitchControl 
          telemetry={null} 
          onCommand={mockOnCommand} 
          className="custom-class"
        />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Command timestamp validation', () => {
    it('should include timestamp in command objects', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const startTime = Date.now();
      const switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);
      const endTime = Date.now();

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'SWITCH_CAMERA',
        timestamp: expect.any(Number)
      });

      const calledWith = mockOnCommand.mock.calls[0][0];
      expect(calledWith.timestamp).toBeGreaterThanOrEqual(startTime);
      expect(calledWith.timestamp).toBeLessThanOrEqual(endTime);
    });
  });

  describe('Multiple camera switches', () => {
    it('should toggle back and forth between cameras', async () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<CameraSwitchControl telemetry={telemetry} onCommand={mockOnCommand} />);
      
      // Start with front camera
      expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      
      // Switch to bottom camera
      let switchButton = screen.getByRole('button', { name: /Switch to Bottom/i });
      fireEvent.click(switchButton);
      
      // Wait for state to update
      await waitFor(() => {
        expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('bottom')).toBeInTheDocument();
      });
      
      // Switch back to front camera
      switchButton = screen.getByRole('button', { name: /Switch to Front/i });
      fireEvent.click(switchButton);
      
      // Wait for state to update back
      await waitFor(() => {
        expect(screen.getByText('Camera:')).toBeInTheDocument();
      expect(screen.getByText('front')).toBeInTheDocument();
      });

      // Should have called onCommand twice
      expect(mockOnCommand).toHaveBeenCalledTimes(2);
    });
  });
});