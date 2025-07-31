/**
 * Shared types for drone telemetry and control communication
 */

export interface DroneTelemetry {
  batteryPercentage: number;
  flightState: 'landed' | 'flying' | 'hovering' | 'error' | 'unknown';
  wifiSignalStrength: number;
}

/**
 * Movement payload for MOVE commands
 */
export interface MovementPayload {
  pitch: number; // Forward/Backward tilt, -1 to 1
  roll: number;  // Left/Right tilt, -1 to 1
  yaw: number;   // Rotational speed, -1 to 1
  gaz: number;   // Vertical speed/altitude, -1 to 1
}

/**
 * Control commands that can be sent to the drone
 */
export interface ControlCommand {
  type: 'TAKE_OFF' | 'LAND' | 'EMERGENCY_STOP' | 'MOVE' | 'SWITCH_CAMERA';
  timestamp?: number;
  payload?: MovementPayload;
}

/**
 * Video stream data structure for real-time transmission
 */
export interface VideoStreamData {
  chunk: Buffer;
  timestamp: number;
  sequenceNumber: number;
}

/**
 * WebSocket message types for real-time communication
 */
export type WebSocketMessage = 
  | { type: 'telemetry'; data: DroneTelemetry; timestamp: string }
  | { type: 'video'; data: VideoStreamData; timestamp: string }
  | { type: 'connection'; message: string; droneConnected: boolean }
  | { type: 'command'; data: ControlCommand; timestamp: string }
  | { type: 'ack'; message: string };