import React, { useRef, useCallback, useEffect, useState } from 'react';

interface JoystickPosition {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

interface VirtualJoystickProps {
  onPositionChange: (position: JoystickPosition) => void;
  size?: number;
  knobSize?: number;
  className?: string;
  label?: string;
  'data-testid'?: string;
}

/**
 * VirtualJoystick component provides touch/mouse interaction for drone control
 * Returns normalized position values (-1 to 1) from center of joystick area
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onPositionChange,
  size = 120,
  knobSize = 40,
  className = '',
  label,
  'data-testid': dataTestId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<JoystickPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<number>();

  const maxDistance = (size - knobSize) / 2;

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    // Limit to circular boundary
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxDistance;
      deltaY = Math.sin(angle) * maxDistance;
    }

    // Convert to normalized coordinates (-1 to 1)
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY === 0 ? 0 : -deltaY / maxDistance; // Invert Y for intuitive control

    const newPosition = { x: normalizedX, y: normalizedY };
    setPosition(newPosition);
    onPositionChange(newPosition);

    // Update knob visual position
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  }, [maxDistance, onPositionChange]);

  const returnToCenter = useCallback(() => {
    const newPosition = { x: 0, y: 0 };
    setPosition(newPosition);
    onPositionChange(newPosition);
    
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    setIsDragging(false);
  }, [onPositionChange]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    returnToCenter();
  }, [returnToCenter]);

  // Touch events - Enhanced for mobile responsiveness
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setIsDragging(true);
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation(); // Prevent scrolling conflicts
    const touch = e.touches[0];
    if (touch) {
      updatePosition(touch.clientX, touch.clientY);
    }
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    returnToCenter();
  }, [returnToCenter]);

  // Setup global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {label && (
        <div className="text-white text-sm font-medium text-center">
          {label}
        </div>
      )}
      
      <div
        ref={containerRef}
        className="relative bg-gray-800 rounded-full border-2 border-gray-600 cursor-grab active:cursor-grabbing select-none touch-manipulation user-select-none no-zoom"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="button"
        aria-label={`Virtual joystick ${label ? `for ${label}` : ''}`}
        tabIndex={0}
        data-testid={dataTestId}
      >
        {/* Joystick background circles for visual guidance */}
        <div 
          className="absolute inset-2 rounded-full border border-gray-700 opacity-30"
        />
        <div 
          className="absolute inset-4 rounded-full border border-gray-700 opacity-20"
        />
        
        {/* Center dot */}
        <div 
          className="absolute w-2 h-2 bg-gray-600 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />

        {/* Joystick knob - Enhanced mobile feedback */}
        <div
          ref={knobRef}
          className={`absolute bg-blue-500 rounded-full border-3 border-blue-400 transition-all duration-150 ${
            isDragging ? 'bg-blue-400 shadow-2xl scale-110 border-blue-300 ring-4 ring-blue-300/50' : 'shadow-lg hover:bg-blue-400 hover:scale-105'
          }`}
          style={{
            width: knobSize,
            height: knobSize,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Debug position display (only shown in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 font-mono">
          x: {position.x.toFixed(2)}, y: {position.y.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default VirtualJoystick;