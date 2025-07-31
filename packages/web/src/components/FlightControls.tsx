import React from 'react';
import { DroneTelemetry, ControlCommand } from '../types/types';

interface FlightControlsProps {
  telemetry: DroneTelemetry | null;
  onCommand: (command: ControlCommand) => void;
  className?: string;
}

/**
 * FlightControls component for drone takeoff, landing, and emergency stop
 * Displays state-aware buttons based on current flight status
 */
export const FlightControls: React.FC<FlightControlsProps> = ({
  telemetry,
  onCommand,
  className = ''
}) => {
  const flightState = telemetry?.flightState || 'unknown';
  const isFlying = flightState === 'flying' || flightState === 'hovering';

  const handleTakeoffLand = () => {
    const command: ControlCommand = {
      type: isFlying ? 'LAND' : 'TAKE_OFF',
      timestamp: Date.now()
    };
    onCommand(command);
  };

  const handleEmergencyStop = () => {
    const command: ControlCommand = {
      type: 'EMERGENCY_STOP',
      timestamp: Date.now()
    };
    onCommand(command);
  };

  const getButtonText = () => {
    if (flightState === 'unknown') return 'Takeoff';
    return isFlying ? 'Land' : 'Takeoff';
  };

  const getButtonColor = () => {
    if (flightState === 'unknown') return 'bg-blue-600 hover:bg-blue-700';
    return isFlying ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';
  };

  const isDisabled = flightState === 'error';

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-4">Flight Controls</h3>
      
      {/* Flight Status Indicator */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              flightState === 'flying' || flightState === 'hovering' ? 'bg-green-500' :
              flightState === 'landed' ? 'bg-blue-500' :
              flightState === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-white font-medium">
              Status: <span className="capitalize">{flightState}</span>
            </span>
          </div>
          {telemetry && (
            <div className="text-gray-400 text-sm">
              Battery: {telemetry.batteryPercentage}%
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {/* Takeoff/Land Button */}
        <button
          onClick={handleTakeoffLand}
          disabled={isDisabled}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
        >
          {getButtonText()}
        </button>

        {/* Emergency Stop Button */}
        <button
          onClick={handleEmergencyStop}
          disabled={false}
          className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Emergency Stop
        </button>
      </div>

      {/* Status Messages */}
      {flightState === 'unknown' && (
        <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
          <p className="text-yellow-300 text-sm">
            Waiting for drone connection...
          </p>
        </div>
      )}

      {flightState === 'error' && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-50 rounded-lg">
          <p className="text-red-300 text-sm">
            Drone is in error state. Use Emergency Stop to reset.
          </p>
        </div>
      )}
    </div>
  );
};

export default FlightControls;