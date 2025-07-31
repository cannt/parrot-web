# **5\. Components**

## **Backend Server (api package)**

* **Responsibility:** This component acts as the central nervous system for drone communication. Its sole responsibility is to be a dedicated proxy, translating simple WebSocket messages from the frontend into the complex UDP/TCP commands required by the drone via the node-ar-drone library, and vice-versa. It encapsulates all direct interaction with the drone, shielding the frontend from the complexities of the drone's protocol.  
* **Key Interfaces:**  
  * Exposes a single WebSocket endpoint (e.g., /ws) for all real-time, bidirectional communication with the frontend.  
* **Dependencies:** node-ar-drone, ws (WebSocket library), express.  
* **Technology Stack:** Node.js, Express, TypeScript.

## **Frontend Web App (web package)**

* **Responsibility:** This component is responsible for everything the user sees and interacts with. It renders the user interface, including the video player, status displays, and flight controls. It captures user input (clicks, joystick movements) and sends the corresponding ControlCommand data models to the backend via the WebSocket connection. It also listens for and reactively displays the DroneTelemetry and video data it receives from the backend.  
* **Key Interfaces:**  
  * Connects to the backend's WebSocket endpoint to send commands and receive data.  
* **Dependencies:** react, tailwindcss.  
* **Technology Stack:** React, Vite, TypeScript.
