# **4\. Data Models**

## **DroneTelemetry**

**Purpose:** To represent the real-time status and navigation data sent from the backend server to the frontend web application. This object provides the pilot with all necessary situational awareness.

**Key Attributes:**

* batteryPercentage: number \- The remaining battery life of the drone, from 0 to 100\.  
* flightState: string \- The current operational state of the drone (e.g., "landed", "flying", "hovering", "error").  
* wifiSignalStrength: number \- A value representing the quality of the Wi-Fi connection, from 0 to 100\.

**TypeScript Interface:**

// packages/shared/types.ts

export interface DroneTelemetry {  
  batteryPercentage: number;  
  flightState: 'landed' | 'flying' | 'hovering' | 'error' | 'unknown';  
  wifiSignalStrength: number;  
}

## **ControlCommand**

**Purpose:** To represent any command sent from the frontend user interface to the backend server to be relayed to the drone. This is a discriminated union to ensure type safety for different kinds of commands.

Key Attributes:  
This is a type union representing either a discrete action or a continuous movement command.

* **Action Commands** (e.g., TAKE\_OFF, LAND): A simple object with a type property.  
* **Movement Command** (MOVE): An object with a type and a payload containing the flight vectors.  
  * pitch: Forward/backward tilt (-1 to 1).  
  * roll: Left/right tilt (-1 to 1).  
  * yaw: Rotational speed (-1 to 1).  
  * gaz: Vertical speed (-1 to 1).

**TypeScript Interface:**

// packages/shared/types.ts

export type ControlCommand \=  
  | { type: 'TAKE\_OFF' }  
  | { type: 'LAND' }  
  | { type: 'EMERGENCY\_STOP' }  
  | { type: 'SWITCH\_CAMERA' }  
  | {  
      type: 'MOVE';  
      payload: {  
        pitch: number; // Forward/Backward  
        roll: number;  // Left/Right  
        yaw: number;   // Rotation  
        gaz: number;   // Altitude  
      };  
    };
