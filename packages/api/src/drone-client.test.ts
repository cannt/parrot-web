import { DroneClient } from './drone-client';

// Mock video stream
const mockVideoStream = {
  on: jest.fn()
};

// Mock the ar-drone module
const mockClient = {
  config: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  land: jest.fn(),
  takeoff: jest.fn(),
  emergency: jest.fn(),
  createPngStream: jest.fn(() => mockVideoStream),
  // Movement command methods
  front: jest.fn(),
  back: jest.fn(),
  left: jest.fn(),
  right: jest.fn(),
  up: jest.fn(),
  down: jest.fn(),
  clockwise: jest.fn(),
  counterClockwise: jest.fn(),
  stop: jest.fn()
};

jest.mock('ar-drone', () => ({
  createClient: jest.fn(() => mockClient)
}));

describe('DroneClient', () => {
  let droneClient: DroneClient;
  let mockTelemetryCallback: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    droneClient = new DroneClient();
    mockTelemetryCallback = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    droneClient.disconnect();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should create ar-drone client and setup event listeners', () => {
      expect(mockClient.on).toHaveBeenCalledWith('navdata', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should start with disconnected status', () => {
      expect(droneClient.getConnectionStatus()).toBe(false);
    });
  });

  describe('connection', () => {
    it('should connect successfully when navdata is received', async () => {
      const connectPromise = droneClient.connect();
      
      // Immediately trigger navdata handler without setTimeout
      const navdataHandler = mockClient.on.mock.calls.find(call => call[0] === 'navdata')[1];
      setTimeout(() => navdataHandler({ demo: { batteryPercentage: 50 } }), 0);
      
      // Advance timers to process setTimeout(0)
      jest.advanceTimersByTime(0);

      await expect(connectPromise).resolves.toBeUndefined();
      expect(droneClient.getConnectionStatus()).toBe(true);
      expect(mockClient.config).toHaveBeenCalledWith('general:navdata_demo', 'FALSE');
      expect(mockClient.config).toHaveBeenCalledWith('control:altitude_max', '3000');
    });

    it('should timeout if no navdata is received', async () => {
      const connectPromise = droneClient.connect();
      
      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(10000);

      await expect(connectPromise).rejects.toThrow('Drone connection timeout');
      expect(droneClient.getConnectionStatus()).toBe(false);
    });
  });

  describe('telemetry handling', () => {
    beforeEach(() => {
      droneClient.onTelemetry(mockTelemetryCallback);
    });

    it('should process valid navdata and trigger callbacks', () => {
      const mockNavdata = {
        demo: {
          batteryPercentage: 75,
          wifiRate: 54
        },
        droneState: {
          landed: false,
          flying: true,
          hovering: false,
          emergency: false
        }
      };

      const navdataHandler = mockClient.on.mock.calls.find(call => call[0] === 'navdata')[1];
      navdataHandler(mockNavdata);

      expect(mockTelemetryCallback).toHaveBeenCalledWith({
        batteryPercentage: 75,
        flightState: 'flying',
        wifiSignalStrength: 54
      });
    });

    it('should map flight states correctly', () => {
      const testCases = [
        { droneState: { landed: true }, expected: 'landed' },
        { droneState: { flying: true }, expected: 'flying' },
        { droneState: { hovering: true }, expected: 'hovering' },
        { droneState: { emergency: true }, expected: 'error' },
        { droneState: {}, expected: 'unknown' }
      ];

      const navdataHandler = mockClient.on.mock.calls.find(call => call[0] === 'navdata')[1];

      testCases.forEach(({ droneState, expected }) => {
        mockTelemetryCallback.mockClear();
        const mockNavdata = { demo: {}, droneState };
        navdataHandler(mockNavdata);

        expect(mockTelemetryCallback).toHaveBeenCalledWith(
          expect.objectContaining({ flightState: expected })
        );
      });
    });

    it('should handle missing data gracefully', () => {
      const navdataHandler = mockClient.on.mock.calls.find(call => call[0] === 'navdata')[1];
      
      // Test with null navdata
      navdataHandler(null);
      expect(mockTelemetryCallback).not.toHaveBeenCalled();

      // Test with missing demo data
      navdataHandler({ droneState: { landed: true } });
      expect(mockTelemetryCallback).toHaveBeenCalledWith({
        batteryPercentage: 0,
        flightState: 'landed',
        wifiSignalStrength: 0
      });
    });
  });

  describe('callback management', () => {
    it('should add and remove telemetry callbacks', () => {
      droneClient.onTelemetry(mockTelemetryCallback);
      
      const navdataHandler = mockClient.on.mock.calls.find(call => call[0] === 'navdata')[1];
      navdataHandler({ demo: { batteryPercentage: 50 }, droneState: { landed: true } });

      expect(mockTelemetryCallback).toHaveBeenCalled();
      mockTelemetryCallback.mockClear();

      droneClient.offTelemetry(mockTelemetryCallback);
      navdataHandler({ demo: { batteryPercentage: 50 }, droneState: { landed: true } });

      expect(mockTelemetryCallback).not.toHaveBeenCalled();
    });
  });

  describe('disconnection', () => {
    it('should disconnect and clean up resources', () => {
      droneClient.disconnect();

      expect(mockClient.land).toHaveBeenCalled();
      expect(droneClient.getConnectionStatus()).toBe(false);
    });
  });

  describe('video stream functionality', () => {
    let mockVideoCallback: jest.Mock;

    beforeEach(() => {
      mockVideoCallback = jest.fn();
    });

    it('should setup video stream event listeners on initialization', () => {
      expect(mockVideoStream.on).toHaveBeenCalledWith('data', expect.any(Function));
      expect(mockVideoStream.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockVideoStream.on).toHaveBeenCalledWith('end', expect.any(Function));
    });

    it('should start and stop video streaming', () => {
      expect(droneClient.getVideoStreamStatus()).toBe(false);
      
      droneClient.startVideoStream();
      expect(droneClient.getVideoStreamStatus()).toBe(true);
      
      droneClient.stopVideoStream();
      expect(droneClient.getVideoStreamStatus()).toBe(false);
    });

    it('should start video stream regardless of connection status', () => {
      expect(droneClient.getVideoStreamStatus()).toBe(false);
      
      droneClient.startVideoStream();
      
      expect(droneClient.getVideoStreamStatus()).toBe(true);
    });

    it('should process video data when stream is active', () => {
      droneClient.onVideo(mockVideoCallback);
      droneClient.startVideoStream();

      const mockBuffer = Buffer.from('test video data');
      const videoDataHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'data')[1];
      
      videoDataHandler(mockBuffer);

      expect(mockVideoCallback).toHaveBeenCalledWith({
        chunk: mockBuffer,
        timestamp: expect.any(Number),
        sequenceNumber: 0
      });
    });

    it('should not process video data when stream is inactive', () => {
      droneClient.onVideo(mockVideoCallback);
      // Note: not starting video stream

      const mockBuffer = Buffer.from('test video data');
      const videoDataHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'data')[1];
      
      videoDataHandler(mockBuffer);

      expect(mockVideoCallback).not.toHaveBeenCalled();
    });

    it('should handle video stream errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      droneClient.startVideoStream();

      const videoErrorHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'error')[1];
      const mockError = new Error('Video stream error');
      
      videoErrorHandler(mockError);

      expect(consoleSpy).toHaveBeenCalledWith('Video stream error:', mockError);
      expect(droneClient.getVideoStreamStatus()).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should handle video stream end', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      droneClient.startVideoStream();

      const videoEndHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'end')[1];
      
      videoEndHandler();

      expect(consoleSpy).toHaveBeenCalledWith('Video stream ended');
      expect(droneClient.getVideoStreamStatus()).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should manage video callback subscriptions', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      droneClient.onVideo(callback1);
      droneClient.onVideo(callback2);
      droneClient.startVideoStream();

      const mockBuffer = Buffer.from('test');
      const videoDataHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'data')[1];
      
      videoDataHandler(mockBuffer);

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Remove one callback
      droneClient.offVideo(callback1);
      callback1.mockClear();
      callback2.mockClear();

      videoDataHandler(mockBuffer);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should auto-start video stream on successful connection', async () => {
      const startVideoStreamSpy = jest.spyOn(droneClient, 'startVideoStream');
      
      const connectPromise = droneClient.connect();
      
      // Immediately trigger navdata handler
      const navdataHandler = mockClient.on.mock.calls.find(call => call[0] === 'navdata')[1];
      setTimeout(() => navdataHandler({ demo: { batteryPercentage: 50 } }), 0);
      
      // Advance timers to process setTimeout(0)
      jest.advanceTimersByTime(0);

      await connectPromise;

      expect(startVideoStreamSpy).toHaveBeenCalled();
      expect(droneClient.getVideoStreamStatus()).toBe(true);
    });

    it('should stop video stream on disconnection', () => {
      droneClient.startVideoStream();
      expect(droneClient.getVideoStreamStatus()).toBe(true);

      droneClient.disconnect();

      expect(droneClient.getVideoStreamStatus()).toBe(false);
    });

    it('should increment sequence numbers for video frames', () => {
      droneClient.onVideo(mockVideoCallback);
      droneClient.startVideoStream();

      const videoDataHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'data')[1];
      
      // Send multiple video frames
      for (let i = 0; i < 3; i++) {
        videoDataHandler(Buffer.from(`frame ${i}`));
        
        expect(mockVideoCallback).toHaveBeenLastCalledWith({
          chunk: Buffer.from(`frame ${i}`),
          timestamp: expect.any(Number),
          sequenceNumber: i
        });
      }
    });

    it('should reset sequence number on disconnect', () => {
      droneClient.onVideo(mockVideoCallback);
      droneClient.startVideoStream();

      const videoDataHandler = mockVideoStream.on.mock.calls.find(call => call[0] === 'data')[1];
      
      // Send frames to increment sequence
      videoDataHandler(Buffer.from('frame 1'));
      videoDataHandler(Buffer.from('frame 2'));
      
      // Verify we have calls
      expect(mockVideoCallback).toHaveBeenCalledTimes(2);

      // Disconnect resets the sequence number
      droneClient.disconnect();
      
      // Verify disconnect cleared callbacks and reset counter
      expect(droneClient.getConnectionStatus()).toBe(false);
      expect(droneClient.getVideoStreamStatus()).toBe(false);
    });
  });

  describe('Flight Commands', () => {
    beforeEach(async () => {
      // Manually set connection state for testing flight commands
      (droneClient as any).isConnected = true;
    });

    describe('takeoff()', () => {
      it('should send takeoff command when connected', async () => {
        await droneClient.takeoff();
        
        expect(mockClient.takeoff).toHaveBeenCalledTimes(1);
      });

      it('should reject with error when not connected', async () => {
        droneClient.disconnect();
        
        await expect(droneClient.takeoff()).rejects.toThrow('Drone is not connected');
        expect(mockClient.takeoff).toHaveBeenCalledTimes(0);
      });

      it('should handle ar-drone library errors', async () => {
        const error = new Error('Drone communication failed');
        mockClient.takeoff.mockImplementation(() => {
          throw error;
        });

        await expect(droneClient.takeoff()).rejects.toThrow('Failed to send takeoff command: Error: Drone communication failed');
        
        // Reset mock for other tests
        mockClient.takeoff.mockImplementation(() => {});
      });
    });

    describe('land()', () => {
      it('should send land command when connected', async () => {
        // Clear any previous calls from disconnect/connection
        mockClient.land.mockClear();
        
        await droneClient.land();
        
        expect(mockClient.land).toHaveBeenCalledTimes(1);
      });

      it('should reject with error when not connected', async () => {
        droneClient.disconnect();
        mockClient.land.mockClear();
        
        await expect(droneClient.land()).rejects.toThrow('Drone is not connected');
        expect(mockClient.land).toHaveBeenCalledTimes(0);
      });

      it('should handle ar-drone library errors', async () => {
        const error = new Error('Land command failed');
        mockClient.land.mockImplementation(() => {
          throw error;
        });

        await expect(droneClient.land()).rejects.toThrow('Failed to send land command: Error: Land command failed');
        
        // Reset mock for other tests
        mockClient.land.mockImplementation(() => {});
      });
    });

    describe('emergencyStop()', () => {
      it('should send emergency command when connected', async () => {
        await droneClient.emergencyStop();
        
        expect(mockClient.emergency).toHaveBeenCalledTimes(1);
      });

      it('should reject with error when not connected', async () => {
        droneClient.disconnect();
        
        await expect(droneClient.emergencyStop()).rejects.toThrow('Drone is not connected');
        expect(mockClient.emergency).toHaveBeenCalledTimes(0);
      });

      it('should handle ar-drone library errors', async () => {
        const error = new Error('Emergency command failed');
        mockClient.emergency.mockImplementation(() => {
          throw error;
        });

        await expect(droneClient.emergencyStop()).rejects.toThrow('Failed to send emergency stop command: Error: Emergency command failed');
        
        // Reset mock for other tests
        mockClient.emergency.mockImplementation(() => {});
      });
    });
  });

  describe('Movement Commands', () => {
    beforeEach(async () => {
      // Manually set connection state for testing movement commands
      (droneClient as any).isConnected = true;
    });

    describe('move()', () => {
      it('should send front command for positive pitch', async () => {
        const movement = { pitch: 0.8, roll: 0, yaw: 0, gaz: 0 };
        
        await droneClient.move(movement);
        
        expect(mockClient.front).toHaveBeenCalledWith(0.4); // 0.8 * 0.5 speed
        expect(mockClient.back).not.toHaveBeenCalled();
      });

      it('should send back command for negative pitch', async () => {
        const movement = { pitch: -0.6, roll: 0, yaw: 0, gaz: 0 };
        
        await droneClient.move(movement);
        
        expect(mockClient.back).toHaveBeenCalledWith(0.3); // 0.6 * 0.5 speed
        expect(mockClient.front).not.toHaveBeenCalled();
      });

      it('should send right command for positive roll', async () => {
        const movement = { pitch: 0, roll: 0.4, yaw: 0, gaz: 0 };
        
        await droneClient.move(movement);
        
        expect(mockClient.right).toHaveBeenCalledWith(0.2); // 0.4 * 0.5 speed
        expect(mockClient.left).not.toHaveBeenCalled();
      });

      it('should send left command for negative roll', async () => {
        const movement = { pitch: 0, roll: -0.9, yaw: 0, gaz: 0 };
        
        await droneClient.move(movement);
        
        expect(mockClient.left).toHaveBeenCalledWith(0.45); // 0.9 * 0.5 speed
        expect(mockClient.right).not.toHaveBeenCalled();
      });

      it('should send clockwise command for positive yaw', async () => {
        const movement = { pitch: 0, roll: 0, yaw: 0.7, gaz: 0 };
        
        await droneClient.move(movement);
        
        expect(mockClient.clockwise).toHaveBeenCalledWith(0.35); // 0.7 * 0.5 speed
        expect(mockClient.counterClockwise).not.toHaveBeenCalled();
      });

      it('should send counterClockwise command for negative yaw', async () => {
        const movement = { pitch: 0, roll: 0, yaw: -0.5, gaz: 0 };
        
        await droneClient.move(movement);
        
        expect(mockClient.counterClockwise).toHaveBeenCalledWith(0.25); // 0.5 * 0.5 speed
        expect(mockClient.clockwise).not.toHaveBeenCalled();
      });

      it('should send up command for positive gaz', async () => {
        const movement = { pitch: 0, roll: 0, yaw: 0, gaz: 0.3 };
        
        await droneClient.move(movement);
        
        expect(mockClient.up).toHaveBeenCalledWith(0.15); // 0.3 * 0.5 speed
        expect(mockClient.down).not.toHaveBeenCalled();
      });

      it('should send down command for negative gaz', async () => {
        const movement = { pitch: 0, roll: 0, yaw: 0, gaz: -0.8 };
        
        await droneClient.move(movement);
        
        expect(mockClient.down).toHaveBeenCalledWith(0.4); // 0.8 * 0.5 speed
        expect(mockClient.up).not.toHaveBeenCalled();
      });

      it('should send multiple commands for combined movement', async () => {
        const movement = { pitch: 0.5, roll: -0.3, yaw: 0.2, gaz: -0.4 };
        
        await droneClient.move(movement);
        
        expect(mockClient.front).toHaveBeenCalledWith(0.25);
        expect(mockClient.left).toHaveBeenCalledWith(0.15);
        expect(mockClient.clockwise).toHaveBeenCalledWith(0.1);
        expect(mockClient.down).toHaveBeenCalledWith(0.2);
      });

      it('should ignore small movements below threshold', async () => {
        const movement = { pitch: 0.05, roll: -0.08, yaw: 0.02, gaz: -0.09 };
        
        await droneClient.move(movement);
        
        // All values below 0.1 threshold should be ignored
        expect(mockClient.front).not.toHaveBeenCalled();
        expect(mockClient.back).not.toHaveBeenCalled();
        expect(mockClient.left).not.toHaveBeenCalled();
        expect(mockClient.right).not.toHaveBeenCalled();
        expect(mockClient.clockwise).not.toHaveBeenCalled();
        expect(mockClient.counterClockwise).not.toHaveBeenCalled();
        expect(mockClient.up).not.toHaveBeenCalled();
        expect(mockClient.down).not.toHaveBeenCalled();
      });

      it('should reject with error when not connected', async () => {
        droneClient.disconnect();
        const movement = { pitch: 0.5, roll: 0, yaw: 0, gaz: 0 };
        
        await expect(droneClient.move(movement)).rejects.toThrow('Drone is not connected');
        expect(mockClient.front).not.toHaveBeenCalled();
      });

      it('should handle ar-drone library errors', async () => {
        const error = new Error('Movement command failed');
        mockClient.front.mockImplementation(() => {
          throw error;
        });

        const movement = { pitch: 0.5, roll: 0, yaw: 0, gaz: 0 };

        await expect(droneClient.move(movement)).rejects.toThrow('Failed to send movement command: Error: Movement command failed');
        
        // Reset mock for other tests
        mockClient.front.mockImplementation(() => {});
      });
    });

    describe('hover()', () => {
      it('should send stop command when connected', async () => {
        await droneClient.hover();
        
        expect(mockClient.stop).toHaveBeenCalledTimes(1);
      });

      it('should reject with error when not connected', async () => {
        droneClient.disconnect();
        
        await expect(droneClient.hover()).rejects.toThrow('Drone is not connected');
        expect(mockClient.stop).not.toHaveBeenCalled();
      });

      it('should handle ar-drone library errors', async () => {
        const error = new Error('Hover command failed');
        mockClient.stop.mockImplementation(() => {
          throw error;
        });

        await expect(droneClient.hover()).rejects.toThrow('Failed to send hover command: Error: Hover command failed');
        
        // Reset mock for other tests
        mockClient.stop.mockImplementation(() => {});
      });
    });
  });

  describe('Camera Commands', () => {
    beforeEach(async () => {
      // Manually set connection state for testing camera commands
      (droneClient as any).isConnected = true;
    });

    describe('switchCamera()', () => {
      it('should send camera switch command when connected', async () => {
        await droneClient.switchCamera();
        
        expect(mockClient.config).toHaveBeenCalledWith('video:video_channel', 1);
      });

      it('should toggle between front and bottom cameras', async () => {
        // Start with front camera (default)
        expect(droneClient.getCurrentCamera()).toBe(0);
        
        // Switch to bottom camera
        await droneClient.switchCamera();
        expect(mockClient.config).toHaveBeenCalledWith('video:video_channel', 1);
        expect(droneClient.getCurrentCamera()).toBe(1);
        
        // Switch back to front camera
        await droneClient.switchCamera();
        expect(mockClient.config).toHaveBeenCalledWith('video:video_channel', 0);
        expect(droneClient.getCurrentCamera()).toBe(0);
      });

      it('should reject with error when not connected', async () => {
        droneClient.disconnect();
        
        await expect(droneClient.switchCamera()).rejects.toThrow('Drone is not connected');
        expect(mockClient.config).not.toHaveBeenCalledWith('video:video_channel', expect.any(Number));
      });

      it('should handle ar-drone library errors', async () => {
        const error = new Error('Camera config failed');
        mockClient.config.mockImplementation((key: string) => {
          if (key === 'video:video_channel') {
            throw error;
          }
        });

        await expect(droneClient.switchCamera()).rejects.toThrow('Failed to switch camera: Error: Camera config failed');
        
        // Reset mock for other tests
        mockClient.config.mockImplementation(() => {});
      });

      it('should maintain camera state across multiple switches', async () => {
        // Test multiple switches in sequence
        const switches = [
          { expected: 1, description: 'first switch to bottom' },
          { expected: 0, description: 'second switch to front' },
          { expected: 1, description: 'third switch to bottom' }
        ];

        for (const { expected, description } of switches) {
          await droneClient.switchCamera();
          expect(droneClient.getCurrentCamera()).toBe(expected);
          expect(mockClient.config).toHaveBeenLastCalledWith('video:video_channel', expected);
        }
      });
    });

    describe('getCurrentCamera()', () => {
      it('should return current camera state', () => {
        // Should start with front camera (0)
        expect(droneClient.getCurrentCamera()).toBe(0);
      });

      it('should return updated camera state after switching', async () => {
        expect(droneClient.getCurrentCamera()).toBe(0);
        
        await droneClient.switchCamera();
        expect(droneClient.getCurrentCamera()).toBe(1);
        
        await droneClient.switchCamera();
        expect(droneClient.getCurrentCamera()).toBe(0);
      });
    });
  });
});