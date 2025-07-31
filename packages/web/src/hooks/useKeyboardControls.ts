import { useEffect, useCallback, useRef } from 'react';
import { ControlCommand, MovementPayload } from '../types/types';

interface UseKeyboardControlsProps {
  onCommand: (command: ControlCommand) => void;
  disabled?: boolean;
  sensitivity?: number;
}

interface KeyState {
  [key: string]: boolean;
}

/**
 * Custom hook for keyboard-based drone controls
 * WASD: Movement (pitch/roll)
 * Arrow Keys: Altitude and rotation (gaz/yaw)
 * Space: Takeoff/Land
 * E: Emergency Stop
 */
export const useKeyboardControls = ({ 
  onCommand, 
  disabled = false, 
  sensitivity = 0.7 
}: UseKeyboardControlsProps) => {
  const keysRef = useRef<KeyState>({});
  const intervalRef = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false);

  // Movement key mappings
  const movementKeys = {
    // WASD for pitch/roll
    'w': { axis: 'pitch', value: sensitivity },    // Forward
    's': { axis: 'pitch', value: -sensitivity },   // Backward
    'a': { axis: 'roll', value: -sensitivity },    // Left
    'd': { axis: 'roll', value: sensitivity },     // Right
    
    // Arrow keys for gaz/yaw
    'ArrowUp': { axis: 'gaz', value: sensitivity },      // Up
    'ArrowDown': { axis: 'gaz', value: -sensitivity },   // Down
    'ArrowLeft': { axis: 'yaw', value: -sensitivity },   // Turn left
    'ArrowRight': { axis: 'yaw', value: sensitivity },   // Turn right
  };

  // Send movement command based on current key state
  const sendMovementCommand = useCallback(() => {
    if (disabled || isProcessingRef.current) return;

    const movement: MovementPayload = {
      pitch: 0,
      roll: 0,
      yaw: 0,
      gaz: 0
    };

    // Calculate movement based on active keys
    let hasMovement = false;
    Object.entries(movementKeys).forEach(([key, config]) => {
      if (keysRef.current[key]) {
        movement[config.axis as keyof MovementPayload] += config.value;
        hasMovement = true;
      }
    });

    // Only send command if there's movement or we need to stop
    if (hasMovement || isProcessingRef.current) {
      const command: ControlCommand = {
        type: 'MOVE',
        timestamp: Date.now(),
        payload: movement
      };

      onCommand(command);
      isProcessingRef.current = hasMovement;
    }
  }, [onCommand, disabled, sensitivity]);

  // Handle keydown events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const key = event.key.toLowerCase();
    
    // Prevent default for movement keys to avoid scrolling
    if (movementKeys[key] || movementKeys[event.key]) {
      event.preventDefault();
    }

    // Check for movement keys (both lowercase and original case for arrows)
    if (movementKeys[key] || movementKeys[event.key]) {
      const keyToUse = movementKeys[key] ? key : event.key;
      if (!keysRef.current[keyToUse]) {
        keysRef.current[keyToUse] = true;
        
        // Start continuous movement if not already running
        if (!intervalRef.current) {
          sendMovementCommand(); // Send immediately
          intervalRef.current = setInterval(sendMovementCommand, 50); // 20 FPS
        }
      }
      return;
    }

    // Handle action keys (only on keydown, no repeat)
    if (!event.repeat) {
      switch (key) {
        case ' ': // Space for takeoff/land
          event.preventDefault();
          // Send takeoff command - backend will determine if it should takeoff or land
          onCommand({
            type: 'TAKE_OFF',
            timestamp: Date.now()
          });
          break;
          
        case 'e': // Emergency stop
          event.preventDefault();
          onCommand({
            type: 'EMERGENCY_STOP',
            timestamp: Date.now()
          });
          break;
          
        case 'c': // Camera switch
          event.preventDefault();
          onCommand({
            type: 'SWITCH_CAMERA',
            timestamp: Date.now()
          });
          break;
      }
    }
  }, [onCommand, disabled, sendMovementCommand]);

  // Handle keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    const key = event.key.toLowerCase();
    const keyToUse = movementKeys[key] ? key : event.key;
    
    if (movementKeys[key] || movementKeys[event.key]) {
      keysRef.current[keyToUse] = false;
      
      // Check if any movement keys are still pressed
      const hasActiveKeys = Object.keys(movementKeys).some(k => keysRef.current[k]);
      
      // If no movement keys are active, stop the interval and send stop command
      if (!hasActiveKeys && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        
        // Send stop command (all zeros)
        onCommand({
          type: 'MOVE',
          timestamp: Date.now(),
          payload: { pitch: 0, roll: 0, yaw: 0, gaz: 0 }
        });
        
        isProcessingRef.current = false;
      }
    }
  }, [onCommand, disabled]);

  // Set up event listeners
  useEffect(() => {
    if (disabled) {
      // Clear any active states when disabled
      keysRef.current = {};
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      isProcessingRef.current = false;
      return;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Clean up interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [handleKeyDown, handleKeyUp, disabled]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    activeKeys: keysRef.current,
    isActive: !!intervalRef.current
  };
};