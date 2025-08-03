import React, { useCallback, useRef } from 'react';
import { VirtualJoystick } from './VirtualJoystick';
import { MovementPayload, ControlCommand } from '../types/types';
import { useViewport } from '../hooks/useViewport';

// Mobile-optimized constants for touch controls
const MOBILE_JOYSTICK_SIZE = 100;  // Larger for better touch interaction
const DESKTOP_JOYSTICK_SIZE = 80;  // Smaller for desktop
const MOBILE_KNOB_SIZE = 36;       // Larger for finger control
const DESKTOP_KNOB_SIZE = 28;      // Smaller for desktop
const COMMAND_THROTTLE_MS = 50;    // 20 FPS for smooth control

interface MovementControlsProps {
  onCommand: (command: ControlCommand) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * MovementControls component provides dual joystick interface for drone movement
 * Left joystick: pitch (forward/backward) and roll (left/right)
 * Right joystick: gaz (altitude) and yaw (rotation)
 */
export const MovementControls: React.FC<MovementControlsProps> = ({
  onCommand,
  className = '',
  disabled = false
}) => {
  const { isMobile } = useViewport();
  const leftJoystickRef = useRef({ x: 0, y: 0 });
  const rightJoystickRef = useRef({ x: 0, y: 0 });
  const commandThrottleRef = useRef<NodeJS.Timeout>();

  const sendMovementCommand = useCallback(() => {
    if (disabled) return;

    const movement: MovementPayload = {
      pitch: leftJoystickRef.current.y,    // Forward/Backward (left joystick Y)
      roll: leftJoystickRef.current.x,     // Left/Right (left joystick X)
      yaw: rightJoystickRef.current.x,     // Rotation (right joystick X)
      gaz: rightJoystickRef.current.y      // Altitude (right joystick Y)
    };

    const command: ControlCommand = {
      type: 'MOVE',
      timestamp: Date.now(),
      payload: movement
    };

    onCommand(command);
  }, [onCommand, disabled]);

  const throttledSendCommand = useCallback(() => {
    // Clear existing timeout
    if (commandThrottleRef.current) {
      clearTimeout(commandThrottleRef.current);
    }

    // Send command immediately, then throttle subsequent calls
    sendMovementCommand();
    
    // Set up throttling for continuous movement
    commandThrottleRef.current = setTimeout(() => {
      commandThrottleRef.current = undefined;
    }, COMMAND_THROTTLE_MS);
  }, [sendMovementCommand]);

  const handleLeftJoystickChange = useCallback((position: { x: number; y: number }) => {
    leftJoystickRef.current = position;
    throttledSendCommand();
  }, [throttledSendCommand]);

  const handleRightJoystickChange = useCallback((position: { x: number; y: number }) => {
    rightJoystickRef.current = position;
    throttledSendCommand();
  }, [throttledSendCommand]);

  const joystickSize = isMobile ? MOBILE_JOYSTICK_SIZE : DESKTOP_JOYSTICK_SIZE;
  const knobSize = isMobile ? MOBILE_KNOB_SIZE : DESKTOP_KNOB_SIZE;

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center w-full max-w-sm mx-auto sm:space-x-4">
        {/* Left Joystick - Movement (Pitch/Roll) - Mobile optimized */}
        <div className="flex flex-col items-center">
          <VirtualJoystick
            onPositionChange={handleLeftJoystickChange}
            size={joystickSize}
            knobSize={knobSize}
            className={`touch-manipulation ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            label=""
            data-testid="joystick-movement"
          />
          <div className="mt-2 text-center">
            <div className="text-sm text-blue-400 font-medium">Move</div>
            <div className="text-xs text-gray-400">⇅ ⇅</div>
          </div>
        </div>

        {/* Right Joystick - Altitude & Rotation (Gaz/Yaw) - Mobile optimized */}
        <div className="flex flex-col items-center">
          <VirtualJoystick
            onPositionChange={handleRightJoystickChange}
            size={joystickSize}
            knobSize={knobSize}
            className={`touch-manipulation ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            label=""
            data-testid="joystick-altitude---rotation"
          />
          <div className="mt-2 text-center">
            <div className="text-sm text-green-400 font-medium">Alt/Turn</div>
            <div className="text-xs text-gray-400">↑↓ ↻</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementControls;