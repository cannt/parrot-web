import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDroneSocket } from './useDroneSocket';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  send(data: string): void {
    // Store sent data for testing
    this.lastSentData = data;
    console.log('MockWebSocket.send called with:', data);
  }

  lastSentData?: string;

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    setTimeout(() => {
      this.onclose?.(new CloseEvent('close', { code: code || 1000, reason }));
    }, 0);
  }

  // Helper method to simulate receiving messages
  simulateMessage(data: any): void {
    if (this.onmessage) {
      const event = new MessageEvent('message', { data: JSON.stringify(data) });
      this.onmessage(event);
    }
  }

  // Helper method to simulate errors
  simulateError(): void {
    this.onerror?.(new Event('error'));
  }
}

// Mock global WebSocket
(global as any).WebSocket = MockWebSocket;

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {})
};

describe('useDroneSocket', () => {
  let mockWebSocket: MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Capture the WebSocket instance when created
    (global as any).WebSocket = vi.fn((url: string) => {
      mockWebSocket = new MockWebSocket(url);
      // Reset the lastSentData for each test
      mockWebSocket.lastSentData = undefined;
      return mockWebSocket;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useDroneSocket());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isDroneConnected).toBe(false);
    expect(result.current.latestTelemetry).toBe(null);
    expect(result.current.latestVideoData).toBe(null);
    expect(result.current.isVideoStreamActive).toBe(false);
    expect(result.current.connectionError).toBe(null);
    expect(typeof result.current.sendCommand).toBe('function');
  });

  it('should establish WebSocket connection on mount', async () => {
    const { result } = renderHook(() => useDroneSocket());

    // Wait for connection to establish
    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.isConnected).toBe(true);
    expect(consoleSpy.log).toHaveBeenCalledWith('Attempting to connect to WebSocket server...');
    expect(consoleSpy.log).toHaveBeenCalledWith('WebSocket connection established');
  });

  it('should handle connection messages', async () => {
    const { result } = renderHook(() => useDroneSocket());

    await act(async () => {
      vi.runAllTimers();
      mockWebSocket.simulateMessage({
        type: 'connection',
        message: 'Connected to AR Drone Controller API',
        droneConnected: true
      });
    });

    expect(result.current.isDroneConnected).toBe(true);
    expect(consoleSpy.log).toHaveBeenCalledWith('Connection message:', 'Connected to AR Drone Controller API');
  });

  it('should handle telemetry messages', async () => {
    const { result } = renderHook(() => useDroneSocket());

    const telemetryData = {
      batteryPercentage: 75,
      flightState: 'flying' as const,
      wifiSignalStrength: 54
    };

    await act(async () => {
      vi.runAllTimers();
      mockWebSocket.simulateMessage({
        type: 'telemetry',
        data: telemetryData,
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    expect(result.current.latestTelemetry).toEqual(telemetryData);
    expect(result.current.isDroneConnected).toBe(true);
    expect(consoleSpy.log).toHaveBeenCalledWith('Received telemetry data:', telemetryData);
  });

  it('should handle acknowledgment messages', async () => {
    renderHook(() => useDroneSocket());

    await act(async () => {
      vi.runAllTimers();
      mockWebSocket.simulateMessage({
        type: 'ack',
        message: 'Message received'
      });
    });

    expect(consoleSpy.log).toHaveBeenCalledWith('Acknowledgment:', 'Message received');
  });

  it('should handle malformed JSON messages', async () => {
    renderHook(() => useDroneSocket());

    await act(async () => {
      vi.runAllTimers();
      // Simulate malformed message by directly calling onmessage with invalid JSON
      const event = new MessageEvent('message', { data: 'invalid json' });
      mockWebSocket.onmessage?.(event);
    });

    expect(consoleSpy.error).toHaveBeenCalledWith('Error parsing WebSocket message:', expect.any(Error));
  });

  it('should handle WebSocket errors', async () => {
    const { result } = renderHook(() => useDroneSocket());

    await act(async () => {
      vi.runAllTimers();
      mockWebSocket.simulateError();
    });

    expect(result.current.connectionError).toBe('WebSocket connection error');
    expect(consoleSpy.error).toHaveBeenCalledWith('WebSocket error:', expect.any(Event));
  });

  it('should handle connection close and attempt reconnection', async () => {
    const { result } = renderHook(() => useDroneSocket());

    // Establish connection first
    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.isConnected).toBe(true);

    // Simulate connection close (non-normal closure)
    await act(async () => {
      // Manually trigger the onclose event to properly simulate closure
      const closeEvent = new CloseEvent('close', { code: 1006, reason: 'Connection lost' });
      mockWebSocket.onclose?.(closeEvent);
      vi.runAllTimers();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isDroneConnected).toBe(false);
    expect(consoleSpy.log).toHaveBeenCalledWith('WebSocket connection closed:', 1006, 'Connection lost');
    expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Attempting to reconnect'));
  });

  it('should handle normal connection close without reconnection', async () => {
    const { result } = renderHook(() => useDroneSocket());

    // Establish connection first
    await act(async () => {
      vi.runAllTimers();
    });

    // Simulate normal close (code 1000)
    await act(async () => {
      mockWebSocket.close(1000, 'Normal closure');
      vi.runAllTimers();
    });

    expect(result.current.isConnected).toBe(false);
    expect(consoleSpy.log).not.toHaveBeenCalledWith(expect.stringContaining('Attempting to reconnect'));
  });

  it('should clean up on unmount', async () => {
    const { result, unmount } = renderHook(() => useDroneSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.isConnected).toBe(true);

    unmount();

    // WebSocket should be closed
    expect(mockWebSocket.readyState).toBe(MockWebSocket.CLOSED);
  });

  it('should handle connection failure during initialization', async () => {
    // Mock WebSocket constructor to throw an error
    (global as any).WebSocket = vi.fn(() => {
      throw new Error('Failed to create WebSocket');
    });

    const { result } = renderHook(() => useDroneSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.connectionError).toBe('Failed to create WebSocket connection');
    expect(consoleSpy.error).toHaveBeenCalledWith('Failed to create WebSocket connection:', expect.any(Error));
  });

  describe('video stream functionality', () => {
    it('should handle video stream messages', async () => {
      const { result } = renderHook(() => useDroneSocket());

      const videoData = {
        chunk: Buffer.from('test video data'),
        timestamp: Date.now(),
        sequenceNumber: 1
      };

      await act(async () => {
        vi.runAllTimers();
        mockWebSocket.simulateMessage({
          type: 'video',
          data: videoData,
          timestamp: '2023-01-01T00:00:00.000Z'
        });
      });

      expect(result.current.latestVideoData).toEqual(videoData);
      expect(result.current.isVideoStreamActive).toBe(true);
      expect(consoleSpy.log).toHaveBeenCalledWith(expect.stringContaining('Received video data'));
    });

    it('should validate video data before processing', async () => {
      const { result } = renderHook(() => useDroneSocket());

      // Send invalid video data (missing required fields)
      await act(async () => {
        vi.runAllTimers();
        mockWebSocket.simulateMessage({
          type: 'video',
          data: { invalidField: 'invalid' },
          timestamp: '2023-01-01T00:00:00.000Z'
        });
      });

      expect(result.current.latestVideoData).toBe(null);
      expect(result.current.isVideoStreamActive).toBe(false);
      expect(consoleSpy.log).toHaveBeenCalledWith('Received WebSocket message type:', 'video');
    });

    it('should reset video stream state on connection close', async () => {
      const { result } = renderHook(() => useDroneSocket());

      // Establish connection and video stream
      await act(async () => {
        vi.runAllTimers();
        mockWebSocket.simulateMessage({
          type: 'video',
          data: {
            chunk: Buffer.from('test'),
            timestamp: Date.now(),
            sequenceNumber: 1
          }
        });
      });

      expect(result.current.isVideoStreamActive).toBe(true);

      // Close connection
      await act(async () => {
        const closeEvent = new CloseEvent('close', { code: 1006, reason: 'Connection lost' });
        mockWebSocket.onclose?.(closeEvent);
        vi.runAllTimers();
      });

      expect(result.current.isVideoStreamActive).toBe(false);
    });

    it('should handle multiple video frames in sequence', async () => {
      const { result } = renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
      });

      // Send multiple video frames
      for (let i = 1; i <= 3; i++) {
        await act(async () => {
          mockWebSocket.simulateMessage({
            type: 'video',
            data: {
              chunk: Buffer.from(`video frame ${i}`),
              timestamp: Date.now() + i,
              sequenceNumber: i
            }
          });
        });

        expect(result.current.latestVideoData?.sequenceNumber).toBe(i);
        expect(result.current.isVideoStreamActive).toBe(true);
      }
    });

    it('should handle video stream warnings for invalid data', async () => {
      renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
        mockWebSocket.simulateMessage({
          type: 'video',
          data: null // Invalid video data
        });
      });

      expect(consoleSpy.log).toHaveBeenCalledWith('Received WebSocket message type:', 'video');
    });
  });

  describe('message type handling', () => {
    it('should handle unknown message types', async () => {
      renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
        mockWebSocket.simulateMessage({
          type: 'unknown_type',
          data: 'some data'
        });
      });

      expect(consoleSpy.log).toHaveBeenCalledWith('Unknown message type:', 'unknown_type');
    });

    it('should properly log message types without full data for performance', async () => {
      renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
        mockWebSocket.simulateMessage({
          type: 'telemetry',
          data: {
            batteryPercentage: 50,
            flightState: 'landed',
            wifiSignalStrength: 25
          }
        });
      });

      // Should log message type but not the full message object for performance
      expect(consoleSpy.log).toHaveBeenCalledWith('Received WebSocket message type:', 'telemetry');
    });
  });

  describe('flight command functionality', () => {
    it('should include sendCommand function in return value', () => {
      const { result } = renderHook(() => useDroneSocket());
      
      expect(typeof result.current.sendCommand).toBe('function');
    });

    it('should send TAKE_OFF command when connected', async () => {
      const { result } = renderHook(() => useDroneSocket());

      // Establish connection first
      await act(async () => {
        vi.runAllTimers();
      });

      const command = {
        type: 'TAKE_OFF' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      expect(mockWebSocket.lastSentData).toBeDefined();
      const sentMessage = JSON.parse(mockWebSocket.lastSentData!);
      expect(sentMessage).toEqual({
        type: 'command',
        data: command,
        timestamp: expect.any(String)
      });
      expect(consoleSpy.log).toHaveBeenCalledWith('Command sent:', command);
    });

    it('should send LAND command when connected', async () => {
      const { result } = renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
      });

      const command = {
        type: 'LAND' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      const sentMessage = JSON.parse(mockWebSocket.lastSentData!);
      expect(sentMessage.data).toEqual(command);
      expect(sentMessage.type).toBe('command');
    });

    it('should send EMERGENCY_STOP command when connected', async () => {
      const { result } = renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
      });

      const command = {
        type: 'EMERGENCY_STOP' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      const sentMessage = JSON.parse(mockWebSocket.lastSentData!);
      expect(sentMessage.data).toEqual(command);
      expect(sentMessage.type).toBe('command');
    });

    it('should not send command when WebSocket is not connected', async () => {
      const { result } = renderHook(() => useDroneSocket());

      // Don't establish connection (WebSocket readyState is CONNECTING)
      mockWebSocket.readyState = MockWebSocket.CONNECTING;

      const command = {
        type: 'TAKE_OFF' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      expect(mockWebSocket.lastSentData).toBeUndefined();
      expect(result.current.connectionError).toBe('Cannot send command: WebSocket not connected');
      expect(consoleSpy.error).toHaveBeenCalledWith('WebSocket is not connected. Cannot send command:', command);
    });

    it('should not send command when WebSocket is closed', async () => {
      const { result } = renderHook(() => useDroneSocket());

      // Establish connection first
      await act(async () => {
        vi.runAllTimers();
      });

      // Close the connection
      mockWebSocket.readyState = MockWebSocket.CLOSED;

      const command = {
        type: 'LAND' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      expect(result.current.connectionError).toBe('Cannot send command: WebSocket not connected');
      expect(consoleSpy.error).toHaveBeenCalledWith('WebSocket is not connected. Cannot send command:', command);
    });

    it('should handle send errors gracefully', async () => {
      const { result } = renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
      });

      // Mock send to throw an error
      const sendError = new Error('Send failed');
      const originalSend = mockWebSocket.send;
      mockWebSocket.send = vi.fn(() => {
        throw sendError;
      });

      const command = {
        type: 'TAKE_OFF' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      expect(result.current.connectionError).toBe('Failed to send command: Error: Send failed');
      expect(consoleSpy.error).toHaveBeenCalledWith('Error sending command:', sendError);
      
      // Restore original send method
      mockWebSocket.send = originalSend;
    });

    it('should include timestamp in command message', async () => {
      const { result } = renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
      });

      const beforeSend = Date.now();
      const command = {
        type: 'EMERGENCY_STOP' as const,
        timestamp: Date.now()
      };

      await act(async () => {
        result.current.sendCommand(command);
      });

      const afterSend = Date.now();
      const sentMessage = JSON.parse(mockWebSocket.lastSentData!);
      
      expect(sentMessage.timestamp).toBeDefined();
      const messageTimestamp = new Date(sentMessage.timestamp).getTime();
      expect(messageTimestamp).toBeGreaterThanOrEqual(beforeSend);
      expect(messageTimestamp).toBeLessThanOrEqual(afterSend);
    });

    it('should maintain command data integrity', async () => {
      const { result } = renderHook(() => useDroneSocket());

      await act(async () => {
        vi.runAllTimers();
      });

      const originalCommand = {
        type: 'TAKE_OFF' as const,
        timestamp: 1234567890
      };

      await act(async () => {
        result.current.sendCommand(originalCommand);
      });

      const sentMessage = JSON.parse(mockWebSocket.lastSentData!);
      expect(sentMessage.data).toEqual(originalCommand);
      expect(sentMessage.data).not.toBe(originalCommand); // Should be a copy, not reference
    });
  });
});