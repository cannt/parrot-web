import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VirtualJoystick } from './VirtualJoystick';

describe('VirtualJoystick', () => {
  const mockOnPositionChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getBoundingClientRect for consistent testing
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      x: 0,
      y: 0,
      width: 120,
      height: 120,
      top: 100,
      left: 100,
      bottom: 220,
      right: 220,
      toJSON: vi.fn()
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render with default props', () => {
    render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
    
    const container = screen.getByRole('button', { name: /virtual joystick/i });
    expect(container).toBeInTheDocument();
  });

  it('should render with custom label', () => {
    render(
      <VirtualJoystick 
        onPositionChange={mockOnPositionChange} 
        label="Movement Control"
      />
    );
    
    expect(screen.getByText('Movement Control')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(
      <VirtualJoystick 
        onPositionChange={mockOnPositionChange} 
        size={200}
        knobSize={60}
      />
    );
    
    const joystickArea = screen.getByRole('button', { name: /joystick/i });
    expect(joystickArea).toHaveStyle({ width: '200px', height: '200px' });
  });

  describe('Mouse interactions', () => {
    it('should handle mouse down and calculate position', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Mouse down at center (160, 160) relative to container at (100, 100)
      fireEvent.mouseDown(joystickArea, {
        clientX: 160,
        clientY: 160
      });

      // Should be called with center position (0, 0)
      expect(mockOnPositionChange).toHaveBeenCalledWith({ x: 0, y: 0 });
    });

    it('should calculate normalized position for mouse movement', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Start dragging
      fireEvent.mouseDown(joystickArea, {
        clientX: 160,
        clientY: 160
      });

      // Move mouse to the right and up
      fireEvent.mouseMove(document, {
        clientX: 180, // 20px right of center
        clientY: 140  // 20px up from center
      });

      // With max distance of 40px ((120-40)/2), 20px = 0.5 normalized
      // Y is inverted, so up movement should be positive
      expect(mockOnPositionChange).toHaveBeenLastCalledWith({ 
        x: 0.5,  // 20/40 = 0.5
        y: 0.5   // -(-20)/40 = 0.5 (inverted)
      });
    });

    it('should limit movement to circular boundary', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Start dragging
      fireEvent.mouseDown(joystickArea, {
        clientX: 160,
        clientY: 160
      });

      // Move mouse far beyond boundary
      fireEvent.mouseMove(document, {
        clientX: 300, // 140px right (beyond max distance of 40px)
        clientY: 100  // 60px up
      });

      // Should be clamped to boundary (normalized to 1.0)
      expect(mockOnPositionChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          x: expect.closeTo(0.92, 1), // cos of angle
          y: expect.closeTo(0.38, 1)  // sin of angle (inverted)
        })
      );
    });

    it('should return to center on mouse up', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Start dragging
      fireEvent.mouseDown(joystickArea, {
        clientX: 180,
        clientY: 140
      });

      // Release mouse
      fireEvent.mouseUp(document);

      // Should return to center
      expect(mockOnPositionChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    });
  });

  describe('Touch interactions', () => {
    it('should handle touch start and calculate position', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Touch at center
      fireEvent.touchStart(joystickArea, {
        touches: [{ clientX: 160, clientY: 160 }]
      });

      expect(mockOnPositionChange).toHaveBeenCalledWith({ x: 0, y: 0 });
    });

    it('should handle touch move', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Start touch
      fireEvent.touchStart(joystickArea, {
        touches: [{ clientX: 160, clientY: 160 }]
      });

      // Move touch
      fireEvent.touchMove(document, {
        touches: [{ clientX: 170, clientY: 150 }]
      });

      // Should calculate position for touch movement
      expect(mockOnPositionChange).toHaveBeenLastCalledWith({ 
        x: 0.25,  // 10/40 = 0.25
        y: 0.25   // -(-10)/40 = 0.25
      });
    });

    it('should return to center on touch end', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Start touch
      fireEvent.touchStart(joystickArea, {
        touches: [{ clientX: 170, clientY: 150 }]
      });

      // End touch
      fireEvent.touchEnd(document);

      // Should return to center
      expect(mockOnPositionChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    });
  });

  describe('Position calculation', () => {
    it('should correctly calculate position in all quadrants', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      const testCases = [
        // [clientX, clientY, expectedX, expectedY, description]
        [180, 140, 0.5, 0.5, 'top-right quadrant'],
        [140, 140, -0.5, 0.5, 'top-left quadrant'],
        [140, 180, -0.5, -0.5, 'bottom-left quadrant'],
        [180, 180, 0.5, -0.5, 'bottom-right quadrant']
      ];

      testCases.forEach(([clientX, clientY, expectedX, expectedY]) => {
        mockOnPositionChange.mockClear();
        
        fireEvent.mouseDown(joystickArea, { clientX, clientY });
        
        expect(mockOnPositionChange).toHaveBeenCalledWith({ 
          x: expectedX, 
          y: expectedY 
        });
      });
    });
  });

  describe('Development mode debug display', () => {
    it('should show debug position in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      // Should show debug coordinates
      expect(screen.getByText(/x: 0\.00, y: 0\.00/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show debug position in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      // Should not show debug coordinates
      expect(screen.queryByText(/x: 0\.00, y: 0\.00/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Accessibility and styling', () => {
    it('should apply custom className', () => {
      render(
        <VirtualJoystick 
          onPositionChange={mockOnPositionChange} 
          className="custom-class"
          label="Movement Control"
        />
      );
      
      const container = screen.getByText('Movement Control').closest('div');
      expect(container).toHaveClass('custom-class');
    });

    it('should have proper cursor styles', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      expect(joystickArea).toHaveClass('cursor-grab');
    });

    it('should prevent text selection', () => {
      render(<VirtualJoystick onPositionChange={mockOnPositionChange} />);
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      expect(joystickArea).toHaveClass('select-none');
    });
  });

  describe('Event cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(
        <VirtualJoystick onPositionChange={mockOnPositionChange} />
      );
      
      const joystickArea = screen.getByRole('button', { name: /virtual joystick/i });
      
      // Start dragging to add event listeners
      fireEvent.mouseDown(joystickArea, {
        clientX: 160,
        clientY: 160
      });

      // Unmount component
      unmount();

      // Should have removed event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });
  });
});