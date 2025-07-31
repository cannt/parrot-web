/**
 * Shared types for drone telemetry and control communication
 */

export interface DroneTelemetry {
  batteryPercentage: number;
  flightState: 'landed' | 'flying' | 'hovering' | 'error' | 'unknown';
  wifiSignalStrength: number;
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
 * Control commands that can be sent to the drone
 */
export interface ControlCommand {
  type: 'TAKE_OFF' | 'LAND' | 'EMERGENCY_STOP';
  timestamp?: number;
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