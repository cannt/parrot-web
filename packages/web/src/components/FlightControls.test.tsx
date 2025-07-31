import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlightControls from './FlightControls';
import { DroneTelemetry } from '../types/types';

describe('FlightControls', () => {
  const mockOnCommand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering with different flight states', () => {
    it('should render with unknown state', () => {
      render(<FlightControls telemetry={null} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Flight Controls')).toBeInTheDocument();
      expect(screen.getByText('Status: Unknown')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Takeoff' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Emergency Stop' })).toBeDisabled();
      expect(screen.getByText('Waiting for drone connection...')).toBeInTheDocument();
    });

    it('should render with landed state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Status: Landed')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Takeoff' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Emergency Stop' })).toBeEnabled();
      expect(screen.getByText('Battery: 75%')).toBeInTheDocument();
    });

    it('should render with flying state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 50,
        flightState: 'flying',
        wifiSignalStrength: 32
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Status: Flying')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Land' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Emergency Stop' })).toBeEnabled();
      expect(screen.getByText('Battery: 50%')).toBeInTheDocument();
    });

    it('should render with hovering state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 60,
        flightState: 'hovering',
        wifiSignalStrength: 40
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Status: Hovering')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Land' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Emergency Stop' })).toBeEnabled();
    });

    it('should render with error state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 25,
        flightState: 'error',
        wifiSignalStrength: 10
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      expect(screen.getByText('Status: Error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Takeoff' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Emergency Stop' })).toBeEnabled();
      expect(screen.getByText('Drone is in error state. Use Emergency Stop to reset.')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should send TAKE_OFF command when takeoff button clicked (landed state)', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const takeoffButton = screen.getByRole('button', { name: 'Takeoff' });
      fireEvent.click(takeoffButton);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'TAKE_OFF',
        timestamp: expect.any(Number)
      });
    });

    it('should send LAND command when land button clicked (flying state)', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 50,
        flightState: 'flying',
        wifiSignalStrength: 32
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const landButton = screen.getByRole('button', { name: 'Land' });
      fireEvent.click(landButton);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'LAND',
        timestamp: expect.any(Number)
      });
    });

    it('should send LAND command when land button clicked (hovering state)', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 60,
        flightState: 'hovering',
        wifiSignalStrength: 40
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const landButton = screen.getByRole('button', { name: 'Land' });
      fireEvent.click(landButton);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'LAND',
        timestamp: expect.any(Number)
      });
    });

    it('should send EMERGENCY_STOP command when emergency button clicked', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'flying',
        wifiSignalStrength: 54
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const emergencyButton = screen.getByRole('button', { name: 'Emergency Stop' });
      fireEvent.click(emergencyButton);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'EMERGENCY_STOP',
        timestamp: expect.any(Number)
      });
    });

    it('should not call onCommand when buttons are disabled (unknown state)', () => {
      render(<FlightControls telemetry={null} onCommand={mockOnCommand} />);
      
      const takeoffButton = screen.getByRole('button', { name: 'Takeoff' });
      const emergencyButton = screen.getByRole('button', { name: 'Emergency Stop' });

      fireEvent.click(takeoffButton);
      fireEvent.click(emergencyButton);

      expect(mockOnCommand).not.toHaveBeenCalled();
    });

    it('should not call onCommand for takeoff/land when in error state', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 25,
        flightState: 'error',
        wifiSignalStrength: 10
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const takeoffButton = screen.getByRole('button', { name: 'Takeoff' });
      fireEvent.click(takeoffButton);

      expect(mockOnCommand).not.toHaveBeenCalled();
    });
  });

  describe('Visual styling and status indicators', () => {
    it('should display correct status indicator colors', () => {
      const { rerender } = render(<FlightControls telemetry={null} onCommand={mockOnCommand} />);
      
      // Unknown state - gray indicator
      expect(document.querySelector('.bg-gray-500')).toBeInTheDocument();

      // Flying state - green indicator
      const flyingTelemetry: DroneTelemetry = {
        batteryPercentage: 50,
        flightState: 'flying',
        wifiSignalStrength: 32
      };
      rerender(<FlightControls telemetry={flyingTelemetry} onCommand={mockOnCommand} />);
      expect(document.querySelector('.bg-green-500')).toBeInTheDocument();

      // Landed state - blue indicator
      const landedTelemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };
      rerender(<FlightControls telemetry={landedTelemetry} onCommand={mockOnCommand} />);
      expect(document.querySelector('.bg-blue-500')).toBeInTheDocument();

      // Error state - red indicator
      const errorTelemetry: DroneTelemetry = {
        batteryPercentage: 25,
        flightState: 'error',
        wifiSignalStrength: 10
      };
      rerender(<FlightControls telemetry={errorTelemetry} onCommand={mockOnCommand} />);
      expect(document.querySelector('.bg-red-500')).toBeInTheDocument();
    });

    it('should apply correct button styling based on flight state', () => {
      const landedTelemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      const { rerender } = render(<FlightControls telemetry={landedTelemetry} onCommand={mockOnCommand} />);
      
      // Takeoff button should have blue styling
      const takeoffButton = screen.getByRole('button', { name: 'Takeoff' });
      expect(takeoffButton).toHaveClass('bg-blue-600');

      // Flying state should show land button with green styling
      const flyingTelemetry: DroneTelemetry = {
        batteryPercentage: 50,
        flightState: 'flying',
        wifiSignalStrength: 32
      };
      rerender(<FlightControls telemetry={flyingTelemetry} onCommand={mockOnCommand} />);
      
      const landButton = screen.getByRole('button', { name: 'Land' });
      expect(landButton).toHaveClass('bg-green-600');
    });

    it('should always style emergency button as red', () => {
      const telemetry: DroneTelemetry = {
        batteryPercentage: 75,
        flightState: 'landed',
        wifiSignalStrength: 54
      };

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const emergencyButton = screen.getByRole('button', { name: 'Emergency Stop' });
      expect(emergencyButton).toHaveClass('bg-red-600');
    });
  });

  describe('Custom className prop', () => {
    it('should apply custom className to the container', () => {
      const { container } = render(
        <FlightControls 
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

      render(<FlightControls telemetry={telemetry} onCommand={mockOnCommand} />);
      
      const startTime = Date.now();
      const takeoffButton = screen.getByRole('button', { name: 'Takeoff' });
      fireEvent.click(takeoffButton);
      const endTime = Date.now();

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'TAKE_OFF',
        timestamp: expect.any(Number)
      });

      const calledWith = mockOnCommand.mock.calls[0][0];
      expect(calledWith.timestamp).toBeGreaterThanOrEqual(startTime);
      expect(calledWith.timestamp).toBeLessThanOrEqual(endTime);
    });
  });
});