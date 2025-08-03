import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { VirtualJoystick } from './VirtualJoystick';

describe('VirtualJoystick - Mobile Touch Tests', () => {
  const mockOnPositionChange = vi.fn();

  beforeEach(() => {
    mockOnPositionChange.mockClear();
    
    // Mock getBoundingClientRect for touch calculations
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 100,
      bottom: 200,
      right: 200,
      width: 100,
      height: 100,
      x: 100,
      y: 100,
      toJSON: () => {}
    }));
  });

  describe('Touch Event Handling', () => {
    it('should handle touch start events', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 150 } as Touch],
        bubbles: true
      });

      fireEvent(joystick, touchEvent);
      
      expect(mockOnPositionChange).toHaveBeenCalled();
    });

    it('should prevent default touch behavior to avoid scrolling', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 150 } as Touch],
        bubbles: true,
        cancelable: true
      });

      const preventDefaultSpy = vi.spyOn(touchStartEvent, 'preventDefault');
      fireEvent(joystick, touchStartEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should stop event propagation to prevent conflicts', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 150, clientY: 150 } as Touch],
        bubbles: true,
        cancelable: true
      });

      const stopPropagationSpy = vi.spyOn(touchStartEvent, 'stopPropagation');
      fireEvent(joystick, touchStartEvent);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should handle touch move events while dragging', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Start touch
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      // Move touch
      fireEvent.touchMove(document, {
        touches: [{ clientX: 160, clientY: 160 }]
      });

      expect(mockOnPositionChange).toHaveBeenCalledTimes(2);
    });

    it('should handle touch end and return to center', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Start touch
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      // End touch
      fireEvent.touchEnd(document);

      // Should call with center position (0, 0)
      expect(mockOnPositionChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    });

    it('should handle touch cancel events', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Start touch
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      // Cancel touch
      fireEvent.touchCancel(document);

      // Should return to center
      expect(mockOnPositionChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    });
  });

  describe('Mobile-Optimized Styling', () => {
    it('should have touch-manipulation class', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      expect(joystick).toHaveClass('touch-manipulation');
    });

    it('should have user-select-none class', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      expect(joystick).toHaveClass('user-select-none');
    });

    it('should render mobile-appropriate sizes', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Should have mobile-optimized dimensions
      expect(joystick).toHaveStyle({ width: '80px', height: '80px' });
    });

    it('should show enhanced visual feedback when dragging', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Start dragging
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      // Knob should have dragging styles
      const knob = joystick.querySelector('.bg-blue-400.shadow-lg.scale-110');
      expect(knob).toBeInTheDocument();
    });
  });

  describe('Position Calculation', () => {
    it('should calculate normalized positions correctly', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Touch at center (should be 0, 0)
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      expect(mockOnPositionChange).toHaveBeenCalledWith({ x: 0, y: 0 });
    });

    it('should limit movement to circular boundary', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Touch far outside boundary
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 250, clientY: 250 }]
      });

      const lastCall = mockOnPositionChange.mock.calls[mockOnPositionChange.mock.calls.length - 1];
      const [position] = lastCall;
      
      // Position should be normalized and within -1 to 1 range
      expect(position.x).toBeGreaterThanOrEqual(-1);
      expect(position.x).toBeLessThanOrEqual(1);
      expect(position.y).toBeGreaterThanOrEqual(-1);
      expect(position.y).toBeLessThanOrEqual(1);
    });

    it('should invert Y axis for intuitive control', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Touch above center (should give positive Y for up movement)
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 125 }]
      });

      const lastCall = mockOnPositionChange.mock.calls[mockOnPositionChange.mock.calls.length - 1];
      const [position] = lastCall;
      
      // Y should be positive when touching above center (inverted)
      expect(position.y).toBeGreaterThan(0);
    });
  });

  describe('Multi-touch Handling', () => {
    it('should handle only the first touch point', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Multi-touch event
      fireEvent.touchStart(joystick, {
        touches: [
          { clientX: 150, clientY: 150 },
          { clientX: 200, clientY: 200 }
        ]
      });

      // Should only process first touch
      expect(mockOnPositionChange).toHaveBeenCalledWith({ x: 0, y: 0 });
    });

    it('should gracefully handle missing touch data', () => {
      render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Start dragging
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      // Touch move with no touches (edge case)
      fireEvent.touchMove(document, { touches: [] });

      // Should not crash and previous position should be maintained
      expect(mockOnPositionChange).toHaveBeenCalled();
    });
  });

  describe('Event Cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <VirtualJoystick
          onPositionChange={mockOnPositionChange}
          size={80}
          knobSize={28}
        />
      );

      const joystick = screen.getByRole('button');
      
      // Start dragging to activate listeners
      fireEvent.touchStart(joystick, {
        touches: [{ clientX: 150, clientY: 150 }]
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function), { passive: false });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));
    });
  });
});