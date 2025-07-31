// @ts-ignore
const arDrone = require('ar-drone');
import { DroneTelemetry, VideoStreamData, MovementPayload } from './types';

export class DroneClient {
  private client: any;
  private videoStream: any;
  private isConnected: boolean = false;
  private isVideoStreamActive: boolean = false;
  private telemetryCallbacks: ((telemetry: DroneTelemetry) => void)[] = [];
  private videoCallbacks: ((videoData: VideoStreamData) => void)[] = [];
  private connectionTimeoutId: NodeJS.Timeout | null = null;
  private videoSequenceNumber: number = 0;
  private currentCamera: number = 0; // 0 = front camera, 1 = bottom camera

  constructor() {
    this.client = arDrone.createClient();
    this.videoStream = this.client.createPngStream();
    this.setupEventListeners();
    this.setupVideoStream();
  }

  /**
   * Initialize connection to the AR.Drone
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      try {
        // Setup connection timeout
        this.connectionTimeoutId = setTimeout(() => {
          reject(new Error('Drone connection timeout after 10 seconds'));
        }, 10000);

        // Listen for navdata to confirm connection
        const navdataHandler = (navData: any) => {
          if (navData && this.connectionTimeoutId) {
            clearTimeout(this.connectionTimeoutId);
            this.connectionTimeoutId = null;
            this.isConnected = true;
            this.client.removeListener('navdata', navdataHandler);
            
            // Start video stream automatically after connection
            this.startVideoStream();
            
            resolve();
          }
        };

        this.client.on('navdata', navdataHandler);

        // Start the connection process with proper configuration
        this.client.config('general:navdata_demo', 'FALSE');
        this.client.config('control:altitude_max', '3000');
        
      } catch (error) {
        if (this.connectionTimeoutId) {
          clearTimeout(this.connectionTimeoutId);
          this.connectionTimeoutId = null;
        }
        reject(new Error(`Failed to connect to drone: ${error}`));
      }
    });
  }

  /**
   * Setup event listeners for drone telemetry
   */
  private setupEventListeners(): void {
    this.client.on('navdata', (navdata: any) => {
      if (!navdata) return;

      const telemetry: DroneTelemetry = {
        batteryPercentage: navdata.demo?.batteryPercentage ?? 0,
        flightState: this.mapFlightState(navdata.droneState),
        wifiSignalStrength: navdata.demo?.wifiRate ?? 0
      };

      // Broadcast telemetry to all registered callbacks
      this.telemetryCallbacks.forEach(callback => {
        try {
          callback(telemetry);
        } catch (error) {
          console.error('Error in telemetry callback:', error);
        }
      });
    });

    this.client.on('error', (error: Error) => {
      console.error('Drone client error:', error);
      this.isConnected = false;
    });
  }

  /**
   * Setup video stream event listeners
   */
  private setupVideoStream(): void {
    if (!this.videoStream) return;

    this.videoStream.on('data', (buffer: Buffer) => {
      if (!this.isVideoStreamActive) return;

      const videoData: VideoStreamData = {
        chunk: buffer,
        timestamp: Date.now(),
        sequenceNumber: this.videoSequenceNumber++
      };

      // Broadcast video data to all registered callbacks
      this.videoCallbacks.forEach(callback => {
        try {
          callback(videoData);
        } catch (error) {
          console.error('Error in video callback:', error);
        }
      });
    });

    this.videoStream.on('error', (error: Error) => {
      console.error('Video stream error:', error);
      this.isVideoStreamActive = false;
    });

    this.videoStream.on('end', () => {
      console.log('Video stream ended');
      this.isVideoStreamActive = false;
    });
  }

  /**
   * Map drone state to standardized flight state
   */
  private mapFlightState(droneState: any): DroneTelemetry['flightState'] {
    if (!droneState) {
      // If no droneState but we have telemetry, assume landed
      return 'landed';
    }

    // Debug log the drone state structure
    console.log('Drone state structure:', JSON.stringify(droneState, null, 2));

    if (droneState.landed) return 'landed';
    if (droneState.flying) return 'flying';
    if (droneState.hovering) return 'hovering';
    if (droneState.emergency) return 'error';
    
    // If we can't determine state but have navdata, assume landed
    return 'landed';
  }

  /**
   * Subscribe to telemetry updates
   */
  public onTelemetry(callback: (telemetry: DroneTelemetry) => void): void {
    this.telemetryCallbacks.push(callback);
  }

  /**
   * Remove telemetry callback
   */
  public offTelemetry(callback: (telemetry: DroneTelemetry) => void): void {
    const index = this.telemetryCallbacks.indexOf(callback);
    if (index > -1) {
      this.telemetryCallbacks.splice(index, 1);
    }
  }

  /**
   * Subscribe to video stream updates
   */
  public onVideo(callback: (videoData: VideoStreamData) => void): void {
    this.videoCallbacks.push(callback);
  }

  /**
   * Remove video stream callback
   */
  public offVideo(callback: (videoData: VideoStreamData) => void): void {
    const index = this.videoCallbacks.indexOf(callback);
    if (index > -1) {
      this.videoCallbacks.splice(index, 1);
    }
  }

  /**
   * Start video streaming
   */
  public startVideoStream(): void {
    this.isVideoStreamActive = true;
    console.log('Video stream started');
  }

  /**
   * Stop video streaming
   */
  public stopVideoStream(): void {
    this.isVideoStreamActive = false;
    console.log('Video stream stopped');
  }

  /**
   * Get video stream status
   */
  public getVideoStreamStatus(): boolean {
    return this.isVideoStreamActive;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Command drone to take off
   */
  public takeoff(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        this.client.takeoff();
        console.log('Takeoff command sent');
        resolve();
      } catch (error) {
        console.error('Error sending takeoff command:', error);
        reject(new Error(`Failed to send takeoff command: ${error}`));
      }
    });
  }

  /**
   * Command drone to land
   */
  public land(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        this.client.land();
        console.log('Land command sent');
        resolve();
      } catch (error) {
        console.error('Error sending land command:', error);
        reject(new Error(`Failed to send land command: ${error}`));
      }
    });
  }

  /**
   * Command drone to perform emergency stop
   */
  public emergencyStop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        this.client.emergency();
        console.log('Emergency stop command sent');
        
        // After emergency stop, wait a bit then send another emergency to reset
        setTimeout(() => {
          try {
            this.client.emergency(); // Second emergency call resets the emergency state
            console.log('Emergency reset command sent');
          } catch (error) {
            console.warn('Error sending emergency reset:', error);
          }
        }, 1000);
        
        resolve();
      } catch (error) {
        console.error('Error sending emergency stop command:', error);
        reject(new Error(`Failed to send emergency stop command: ${error}`));
      }
    });
  }

  /**
   * Command drone to move based on joystick input
   */
  public move(movement: MovementPayload): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        // Convert normalized values (-1 to 1) to ar-drone speed values (0 to 1)
        const speed = 0.5; // Base speed multiplier

        // Apply pitch (forward/backward)
        if (movement.pitch > 0.1) {
          this.client.front(movement.pitch * speed);
        } else if (movement.pitch < -0.1) {
          this.client.back(Math.abs(movement.pitch) * speed);
        }

        // Apply roll (left/right)  
        if (movement.roll > 0.1) {
          this.client.right(movement.roll * speed);
        } else if (movement.roll < -0.1) {
          this.client.left(Math.abs(movement.roll) * speed);
        }

        // Apply yaw (rotation)
        if (movement.yaw > 0.1) {
          this.client.clockwise(movement.yaw * speed);
        } else if (movement.yaw < -0.1) {
          this.client.counterClockwise(Math.abs(movement.yaw) * speed);
        }

        // Apply gaz (altitude)
        if (movement.gaz > 0.1) {
          this.client.up(movement.gaz * speed);
        } else if (movement.gaz < -0.1) {
          this.client.down(Math.abs(movement.gaz) * speed);
        }

        console.log('Movement command sent:', movement);
        resolve();
      } catch (error) {
        console.error('Error sending movement command:', error);
        reject(new Error(`Failed to send movement command: ${error}`));
      }
    });
  }

  /**
   * Command drone to stop and hover
   */
  public hover(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        this.client.stop();
        console.log('Hover command sent');
        resolve();
      } catch (error) {
        console.error('Error sending hover command:', error);
        reject(new Error(`Failed to send hover command: ${error}`));
      }
    });
  }

  /**
   * Switch between front and bottom cameras
   */
  public switchCamera(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        // Switch between front camera (0) and bottom camera (1)
        const nextCamera = this.currentCamera === 0 ? 1 : 0;
        
        this.client.config('video:video_channel', nextCamera);
        this.currentCamera = nextCamera;
        console.log(`Camera switched to ${nextCamera === 0 ? 'front' : 'bottom'} camera`);
        resolve();
      } catch (error) {
        console.error('Error switching camera:', error);
        reject(new Error(`Failed to switch camera: ${error}`));
      }
    });
  }

  /**
   * Get current camera (0 = front, 1 = bottom)
   */
  public getCurrentCamera(): number {
    return this.currentCamera;
  }

  /**
   * Reset drone emergency state
   */
  public resetEmergency(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Drone is not connected'));
        return;
      }

      try {
        // Send emergency command twice to reset emergency state
        this.client.emergency();
        setTimeout(() => {
          this.client.emergency();
          console.log('Drone emergency state reset');
          resolve();
        }, 500);
      } catch (error) {
        console.error('Error resetting emergency state:', error);
        reject(new Error(`Failed to reset emergency state: ${error}`));
      }
    });
  }

  /**
   * Disconnect from drone
   */
  public disconnect(): void {
    // Clear connection timeout if active
    if (this.connectionTimeoutId) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }

    // Stop video streaming
    this.stopVideoStream();

    if (this.client) {
      // Send land command before disconnecting
      try {
        this.client.land();
      } catch (error) {
        console.warn('Error during drone landing:', error);
      }
      
      this.isConnected = false;
      this.telemetryCallbacks = [];
      this.videoCallbacks = [];
      this.videoSequenceNumber = 0;
    }
  }
}