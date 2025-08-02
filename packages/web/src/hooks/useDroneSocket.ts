import { useEffect, useRef, useState } from 'react';
import { DroneTelemetry, VideoStreamData, WebSocketMessage, ControlCommand } from '../types/types';

interface UseDroneSocketReturn {
  isConnected: boolean;
  isDroneConnected: boolean;
  latestTelemetry: DroneTelemetry | null;
  latestVideoData: VideoStreamData | null;
  isVideoStreamActive: boolean;
  connectionError: string | null;
  sendCommand: (command: ControlCommand) => void;
  reconnectDrone: () => void;
}

const WEBSOCKET_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3001';
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

// Validation function for telemetry data
const isValidTelemetryData = (data: any): data is DroneTelemetry => {
  return (
    data &&
    typeof data.batteryPercentage === 'number' &&
    typeof data.flightState === 'string' &&
    ['landed', 'flying', 'hovering', 'error', 'unknown'].includes(data.flightState) &&
    typeof data.wifiSignalStrength === 'number'
  );
};

// Validation function for video data
const isValidVideoData = (data: any): data is VideoStreamData => {
  return (
    data &&
    data.chunk &&
    typeof data.timestamp === 'number' &&
    typeof data.sequenceNumber === 'number'
  );
};

export const useDroneSocket = (): UseDroneSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isDroneConnected, setIsDroneConnected] = useState(false);
  const [latestTelemetry, setLatestTelemetry] = useState<DroneTelemetry | null>(null);
  const [latestVideoData, setLatestVideoData] = useState<VideoStreamData | null>(null);
  const [isVideoStreamActive, setIsVideoStreamActive] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastTelemetryTimeRef = useRef<number>(0);
  const telemetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      console.log('Attempting to connect to WebSocket server...');
      
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message type:', message.type);

          switch (message.type) {
            case 'connection':
              console.log('Connection message:', message.message);
              if (message.droneConnected !== undefined) {
                setIsDroneConnected(message.droneConnected);
              }
              break;

            case 'telemetry':
              if (message.data && isValidTelemetryData(message.data)) {
                console.log('Received telemetry data:', message.data);
                setLatestTelemetry(message.data);
                setIsDroneConnected(true);
                
                // Update last telemetry time
                lastTelemetryTimeRef.current = Date.now();
                
                // Clear existing timeout
                if (telemetryTimeoutRef.current) {
                  clearTimeout(telemetryTimeoutRef.current);
                }
                
                // Set timeout to detect if telemetry stops coming
                telemetryTimeoutRef.current = setTimeout(() => {
                  console.warn('Telemetry timeout - drone may be disconnected');
                  setIsDroneConnected(false);
                  setIsVideoStreamActive(false);
                  setConnectionError('Drone connection lost - telemetry timeout');
                }, 5000); // 5 seconds without telemetry = disconnected
              } else {
                console.warn('Received invalid telemetry data:', message.data);
              }
              break;

            case 'video':
              if (message.data && isValidVideoData(message.data)) {
                console.log(`Received video data - seq: ${message.data.sequenceNumber}, size: ${message.data.chunk.length}`);
                setLatestVideoData(message.data);
                setIsVideoStreamActive(true);
              } else {
                console.warn('Received invalid video data:', message.data);
              }
              break;

            case 'ack':
              console.log('Acknowledgment:', message.message);
              break;

            default:
              console.log('Unknown message type:', (message as any).type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setIsDroneConnected(false);
        setIsVideoStreamActive(false);
        
        // Attempt to reconnect if connection was not closed intentionally
        if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttemptsRef.current + 1}/5)`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, timeout);
        } else if (reconnectAttemptsRef.current >= 5) {
          setConnectionError('Failed to reconnect after 5 attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  };

  const sendCommand = (command: ControlCommand) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected. Cannot send command:', command);
      setConnectionError('Cannot send command: WebSocket not connected');
      return;
    }

    try {
      const message: WebSocketMessage = {
        type: 'command',
        data: command,
        timestamp: new Date().toISOString()
      };

      wsRef.current.send(JSON.stringify(message));
      console.log('Command sent:', command);
    } catch (error) {
      console.error('Error sending command:', error);
      setConnectionError(`Failed to send command: ${error}`);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (telemetryTimeoutRef.current) {
      clearTimeout(telemetryTimeoutRef.current);
      telemetryTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsDroneConnected(false);
    setLatestTelemetry(null);
    setLatestVideoData(null);
    setIsVideoStreamActive(false);
    setConnectionError(null);
  };

  const reconnectDrone = async () => {
    console.log('Manual drone reconnection requested');
    setConnectionError('Attempting to reconnect drone...');
    
    try {
      // Call the backend reconnection endpoint
      const response = await fetch(`${API_URL}/reconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Reconnection request sent:', result.message);
        setConnectionError('Reconnection in progress...');
        
        // Clear error message after a delay
        setTimeout(() => {
          setConnectionError(null);
        }, 5000);
      } else {
        throw new Error('Reconnection request failed');
      }
    } catch (error) {
      console.error('Failed to request drone reconnection:', error);
      setConnectionError('Failed to request reconnection');
    }
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isDroneConnected,
    latestTelemetry,
    latestVideoData,
    isVideoStreamActive,
    connectionError,
    sendCommand,
    reconnectDrone
  };
};