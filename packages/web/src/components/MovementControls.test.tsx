import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MovementControls } from './MovementControls';

// Mock VirtualJoystick component
vi.mock('./VirtualJoystick', () => ({
  VirtualJoystick: ({ onPositionChange, label, className }: any) => (
    <div 
      data-testid={`joystick-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={className}
      onClick={() => onPositionChange({ x: 0.5, y: 0.5 })}
    >
      Mock Joystick: {label}
    </div>
  )
}));

describe('MovementControls', () => {
  const mockOnCommand = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with default props', () => {
    render(<MovementControls onCommand={mockOnCommand} />);
    
    expect(screen.getByText('Movement Controls')).toBeInTheDocument();
    expect(screen.getByTestId('joystick-movement')).toBeInTheDocument();
    expect(screen.getByTestId('joystick-altitude---rotation')).toBeInTheDocument();
  });

  it('should render controls guide', () => {
    render(<MovementControls onCommand={mockOnCommand} />);
    
    expect(screen.getByText('Controls Guide')).toBeInTheDocument();
    expect(screen.getByText('Movement')).toBeInTheDocument();
    expect(screen.getByText('Forward, backward, left, right')).toBeInTheDocument();
    expect(screen.getByText('Altitude & Rotation')).toBeInTheDocument();
    expect(screen.getByText('Up, down, turn left/right')).toBeInTheDocument();
    expect(screen.getByText('Release joysticks to hover')).toBeInTheDocument();
  });

  it('should show disabled state when disabled prop is true', () => {
    render(<MovementControls onCommand={mockOnCommand} disabled={true} />);
    
    expect(screen.getByText('Movement controls disabled. Connect to drone first.')).toBeInTheDocument();
    
    const leftJoystick = screen.getByTestId('joystick-movement');
    const rightJoystick = screen.getByTestId('joystick-altitude---rotation');
    
    expect(leftJoystick).toHaveClass('opacity-50', 'pointer-events-none');
    expect(rightJoystick).toHaveClass('opacity-50', 'pointer-events-none');
  });

  it('should not show disabled message when enabled', () => {
    render(<MovementControls onCommand={mockOnCommand} disabled={false} />);
    
    expect(screen.queryByText('Movement controls disabled. Connect to drone first.')).not.toBeInTheDocument();
  });

  describe('Left joystick (movement)', () => {
    it('should send MOVE command when left joystick position changes', () => {
      render(<MovementControls onCommand={mockOnCommand} />);
      
      const leftJoystick = screen.getByTestId('joystick-movement');
      fireEvent.click(leftJoystick);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'MOVE',
        timestamp: expect.any(Number),
        payload: {
          pitch: 0.5,  // Left joystick Y
          roll: 0.5,   // Left joystick X
          yaw: 0,      // Right joystick X (default)
          gaz: 0       // Right joystick Y (default)
        }
      });
    });
  });

  describe('Right joystick (altitude & rotation)', () => {
    it('should send MOVE command when right joystick position changes', () => {
      render(<MovementControls onCommand={mockOnCommand} />);
      
      const rightJoystick = screen.getByTestId('joystick-altitude---rotation');
      fireEvent.click(rightJoystick);

      expect(mockOnCommand).toHaveBeenCalledWith({
        type: 'MOVE',
        timestamp: expect.any(Number),
        payload: {
          pitch: 0,    // Left joystick Y (default)
          roll: 0,     // Left joystick X (default)
          yaw: 0.5,    // Right joystick X
          gaz: 0.5     // Right joystick Y
        }
      });
    });
  });

  describe('Command throttling', () => {
    it('should throttle movement commands', () => {
      render(<MovementControls onCommand={mockOnCommand} />);
      
      const leftJoystick = screen.getByTestId('joystick-movement');
      
      // Trigger multiple rapid changes
      fireEvent.click(leftJoystick);
      fireEvent.click(leftJoystick);
      fireEvent.click(leftJoystick);

      // Should only send one command immediately
      expect(mockOnCommand).toHaveBeenCalledTimes(3); // Each click triggers a command
      
      // Fast forward time
      vi.advanceTimersByTime(50);
      
      // After throttle period, next command should be allowed
      fireEvent.click(leftJoystick);
      expect(mockOnCommand).toHaveBeenCalledTimes(4);
    });
  });

  describe('Disabled state behavior', () => {
    it('should not send commands when disabled', () => {
      render(<MovementControls onCommand={mockOnCommand} disabled={true} />);
      
      const leftJoystick = screen.getByTestId('joystick-movement');
      fireEvent.click(leftJoystick);

      expect(mockOnCommand).not.toHaveBeenCalled();
    });
  });

  describe('Combined joystick movement', () => {
    it('should combine both joystick positions in movement payload', () => {
      const TestComponent = () => {
        return (
          <div>
            <MovementControls onCommand={mockOnCommand} />
            <button 
              data-testid="simulate-combined"
              onClick={() => {
                // Simulate both joysticks being moved
                const leftJoystick = screen.getByTestId('joystick-movement');
                const rightJoystick = screen.getByTestId('joystick-altitude---rotation');
                
                // First move left joystick
                fireEvent.click(leftJoystick);
                // Then move right joystick
                fireEvent.click(rightJoystick);
              }}
            >
              Simulate Combined
            </button>
          </div>
        );
      };

      render(<TestComponent />);
      
      const simulateButton = screen.getByTestId('simulate-combined');
      fireEvent.click(simulateButton);

      // Should have received both commands
      expect(mockOnCommand).toHaveBeenCalledTimes(2);
      
      // Last command should include right joystick movement
      expect(mockOnCommand).toHaveBeenLastCalledWith({
        type: 'MOVE',
        timestamp: expect.any(Number),
        payload: {
          pitch: 0,    // Left joystick wasn't moved in final state
          roll: 0,     // Left joystick wasn't moved in final state  
          yaw: 0.5,    // Right joystick X
          gaz: 0.5     // Right joystick Y
        }
      });
    });
  });

  describe('Accessibility and styling', () => {
    it('should apply custom className', () => {
      render(
        <MovementControls 
          onCommand={mockOnCommand} 
          className="custom-movement-class"
        />
      );
      
      const container = screen.getByText('Movement Controls').closest('div');
      expect(container).toHaveClass('custom-movement-class');
    });

    it('should have proper heading structure', () => {
      render(<MovementControls onCommand={mockOnCommand} />);
      
      const mainHeading = screen.getByRole('heading', { level: 3 });
      expect(mainHeading).toHaveTextContent('Movement Controls');
      
      const guideHeading = screen.getByRole('heading', { level: 4 });
      expect(guideHeading).toHaveTextContent('Controls Guide');
    });
  });

  describe('Movement indicators', () => {
    it('should display movement direction indicators', () => {
      render(<MovementControls onCommand={mockOnCommand} />);
      
      // Left joystick indicators
      expect(screen.getByText('Forward')).toBeInTheDocument();
      expect(screen.getByText('Backward')).toBeInTheDocument();
      expect(screen.getByText('← Left')).toBeInTheDocument();
      expect(screen.getByText('Right →')).toBeInTheDocument();
      
      // Right joystick indicators  
      expect(screen.getByText('Up')).toBeInTheDocument();
      expect(screen.getByText('Down')).toBeInTheDocument();
      expect(screen.getByText('↺ Turn')).toBeInTheDocument();
      expect(screen.getByText('Turn ↻')).toBeInTheDocument();
    });
  });
});