declare module 'ar-drone' {
  interface NavData {
    demo?: {
      batteryPercentage?: number;
      wifiRate?: number;
    };
    droneState?: {
      landed?: boolean;
      flying?: boolean;
      hovering?: boolean;
      emergency?: boolean;
    };
  }

  interface DroneClient {
    config(key: string, value: string): void;
    on(event: 'navdata', callback: (data: NavData) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    removeListener(event: string, callback: Function): void;
    land(): void;
    createPngStream(): any;
  }

  function createClient(): DroneClient;
  
  const arDrone: {
    createClient: typeof createClient;
  };
  
  export = arDrone;
}