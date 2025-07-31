import React, { useState } from 'react';
import { ControlCommand, DroneTelemetry } from '../types/types';

interface CameraSwitchControlProps {
  telemetry: DroneTelemetry | null;
  onCommand: (command: ControlCommand) => void;
  className?: string;
}

/**
 * CameraSwitchControl component for switching between front and bottom cameras
 * Displays a camera switch button with visual feedback for current camera
 */
export const CameraSwitchControl: React.FC<CameraSwitchControlProps> = ({
  telemetry,
  onCommand,
  className = ''
}) => {
  const [currentCamera, setCurrentCamera] = useState<'front' | 'bottom'>('front');
  const [isLoading, setIsLoading] = useState(false);

  const handleCameraSwitch = async () => {
    setIsLoading(true);
    
    const command: ControlCommand = {
      type: 'SWITCH_CAMERA',
      timestamp: Date.now()
    };
    
    try {
      onCommand(command);
      // Toggle camera state for visual feedback
      setCurrentCamera(prev => prev === 'front' ? 'bottom' : 'front');
    } catch (error) {
      console.error('Failed to switch camera:', error);
    } finally {
      // Reset loading state after a brief delay
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const flightState = telemetry?.flightState || 'unknown';
  const isDisabled = flightState === 'error' || flightState === 'unknown' || isLoading;

  const getCameraIcon = () => {
    return (
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    );
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-4">Camera Control</h3>
      
      {/* Current Camera Indicator */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              currentCamera === 'front' ? 'bg-blue-500' : 'bg-green-500'
            }`} />
            <span className="text-white font-medium">
              Camera: <span className="capitalize">{currentCamera}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Camera Switch Button */}
      <button
        onClick={handleCameraSwitch}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isLoading ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Switching...</span>
          </>
        ) : (
          <>
            {getCameraIcon()}
            <span>Switch to {currentCamera === 'front' ? 'Bottom' : 'Front'}</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {flightState === 'unknown' && (
        <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
          <p className="text-yellow-300 text-sm">
            Camera control available when drone is connected
          </p>
        </div>
      )}

      {flightState === 'error' && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-50 rounded-lg">
          <p className="text-red-300 text-sm">
            Camera control unavailable in error state
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraSwitchControl;