# **6\. Epic Details**

## **Epic 1: Foundation & Core Display**

**Goal:** This epic focuses on establishing the core technical foundation of the project. The goal is to create a functional "hello world" by setting up the web server and frontend application, establishing a connection to the drone, and successfully displaying the live video stream and basic status data. This epic ensures the most critical and highest-risk components (drone communication and video streaming) are working before any complex UI is built.

### **Story 1.1: Project Scaffolding**

As a developer,  
I want a basic monorepo structure with a Node.js backend and a frontend web app,  
so that I have a clean, organized foundation to start building the application.  
**Acceptance Criteria:**

1. A single Git repository is initialized.  
2. The repository contains a packages directory with two subdirectories: api (for the backend) and web (for the frontend).  
3. The api package has a basic Node.js server setup (e.g., using Express or Fastify).  
4. The web package is initialized with a modern frontend framework (e.g., using Vite \+ React).  
5. A root package.json is configured to manage both workspaces.

### **Story 1.2: Drone Connection and Telemetry**

As a developer,  
I want the backend server to connect to the AR.Drone 2.0 and stream its telemetry data to the frontend,  
so that the web app can display real-time status information.  
**Acceptance Criteria:**

1. The backend server successfully initializes the node-ar-drone client and establishes a connection with the drone.  
2. The server captures telemetry data (at a minimum: battery level, flight state, Wi-Fi signal).  
3. A WebSocket connection is established between the frontend and the backend server.  
4. The backend broadcasts received telemetry data to all connected frontend clients via the WebSocket.  
5. The frontend client can receive and log the telemetry data to the browser console.

### **Story 1.3: Live Video Stream Display**

As a user,  
I want to see the live video feed from the drone's camera displayed in the web application,  
so that I have a real-time view of the drone's perspective.  
**Acceptance Criteria:**

1. The backend server successfully receives the drone's H.264 video stream.  
2. The video stream is processed and proxied to the frontend via a WebSocket or similar real-time protocol.  
3. The frontend application renders the video stream in a standard HTML video element, filling the main view.  
4. The video display is stable and has minimal perceivable latency.

## **Epic 2: Interactive Flight Control**

**Goal:** This epic is focused on making the drone flyable. The goal is to implement all the primary user-facing controls, allowing the user to safely take off, land, and maneuver the drone in the air using the web interface. This epic builds directly on the foundation of Epic 1 by sending commands to the drone and reacting to its state.

### **Story 2.1: Core Flight Actions**

As a user,  
I want to be able to command the drone to Takeoff, Land, and perform an Emergency Stop,  
so that I can manage the basic flight state of the drone safely.  
**Acceptance Criteria:**

1. The UI displays distinct buttons for "Takeoff/Land" and "Emergency Stop".  
2. Clicking the "Takeoff" button sends the takeoff command to the drone. The drone's state (from telemetry) updates to "Flying".  
3. When the drone is flying, the button changes to "Land". Clicking it sends the land command. The drone's state updates to "Landed".  
4. Clicking the "Emergency Stop" button at any time sends the emergency command, immediately cutting power to the motors.

### **Story 2.2: Implement Movement and Rotation Controls**

As a user,  
I want on-screen controls to move the drone forward/backward, left/right, up/down, and to rotate it,  
so that I can pilot the drone effectively.  
**Acceptance Criteria:**

1. The UI displays two virtual joysticks or similar on-screen controls.  
2. The left control manages forward/backward and left/right strafing movements.  
3. The right control manages altitude (up/down) and rotation (clockwise/counter-clockwise).  
4. Interacting with the controls sends the corresponding movement commands to the backend server, which are then relayed to the drone.  
5. The drone responds to the control inputs in real-time.  
6. Releasing the controls causes the drone to stop and hover.

## **Epic 3: Enhanced Viewing Experience**

**Goal:** This epic focuses on improving the user's visual control and immersion. The goal is to add functionality that gives the user more control over what they see, building on the core video stream established in Epic 1\.

### **Story 3.1: Camera Switching**

As a user,  
I want a button to switch between the drone's front and bottom cameras,  
so that I can change my perspective during flight.  
**Acceptance Criteria:**

1. A camera-switch icon or button is displayed on the UI.  
2. Clicking the button sends the appropriate "switch camera" command to the drone.  
3. The video stream displayed in the UI updates to show the feed from the newly selected camera.  
4. The control works seamlessly while the drone is on the ground or in flight.

### **Story 3.2: Full-Screen Mode**

As a user,  
I want to toggle a full-screen mode for the video feed,  
so that I can have a more immersive and unobstructed view while flying.  
**Acceptance Criteria:**

1. A "full-screen" icon or button is displayed on the UI.  
2. Clicking the button expands the web application's video element to fill the entire screen, hiding browser UI elements.  
3. All UI overlays (status bar, controls) remain functional and scale appropriately in full-screen mode.  
4. Clicking the button again (or pressing the 'Esc' key) exits full-screen mode and returns the view to its standard layout.
