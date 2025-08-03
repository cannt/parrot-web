import React, { useCallback, useRef } from 'react';
import { VirtualJoystick } from './VirtualJoystick';
import { MovementPayload, ControlCommand } from '../types/types';

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
    }, 50); // 20 FPS for smooth control
  }, [sendMovementCommand]);

  const handleLeftJoystickChange = useCallback((position: { x: number; y: number }) => {
    leftJoystickRef.current = position;
    throttledSendCommand();
  }, [throttledSendCommand]);

  const handleRightJoystickChange = useCallback((position: { x: number; y: number }) => {
    rightJoystickRef.current = position;
    throttledSendCommand();
  }, [throttledSendCommand]);

  return (
    <div className={`${className}`}>
      <div className="flex justify-center items-center space-x-3 sm:space-x-4">
        {/* Left Joystick - Movement (Pitch/Roll) - Mobile optimized */}
        <div className="flex flex-col items-center">
          <VirtualJoystick
            onPositionChange={handleLeftJoystickChange}
            size={80}
            knobSize={28}
            className={`touch-manipulation ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            label=""
            data-testid="joystick-movement"
          />
          <div className="mt-2 text-center">
            <div className="text-sm text-blue-400 font-medium">Move</div>
            <div className="text-xs text-gray-500 hidden sm:block">WASD</div>
          </div>
        </div>

        {/* Center info - Mobile optimized */}
        <div className="text-center px-2">
          <div className="text-sm text-gray-400">🕹️</div>
          <div className="text-xs text-yellow-300 hidden sm:block">
            {disabled ? 'Off' : 'Hover'}
          </div>
        </div>

        {/* Right Joystick - Altitude & Rotation (Gaz/Yaw) - Mobile optimized */}
        <div className="flex flex-col items-center">
          <VirtualJoystick
            onPositionChange={handleRightJoystickChange}
            size={80}
            knobSize={28}
            className={`touch-manipulation ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            label=""
            data-testid="joystick-altitude---rotation"
          />
          <div className="mt-2 text-center">
            <div className="text-sm text-green-400 font-medium">Alt</div>
            <div className="text-xs text-gray-500 hidden sm:block">↑↓←→</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementControls;