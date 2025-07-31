# **AR.Drone 2.0 Web Controller Product Requirements Document (PRD)**

## **1\. Goals and Background Context**

### **Goals**

* To create a modern, simple, and functional web-based control interface for the Parrot AR.Drone 2.0.  
* To deliver an immersive and intuitive flying experience by prioritizing the live video feed.  
* To ensure the initial version (MVP) is developed quickly for personal use, focusing only on essential features for flight.

### **Background Context**

The official mobile applications for the Parrot AR.Drone 2.0 have been discontinued, leaving a gap for users who wish to operate their drones, especially on desktop platforms. This project aims to solve this by creating a browser-based controller that can be run locally.

The application will interface with the drone's known Wi-Fi protocol, sending UDP commands for flight control and receiving the H.264 TCP video stream, likely leveraging the node-ar-drone library as a foundational piece. The target users are hobbyists, educators, and tinkerers who need a fast, reliable, and modern interface to continue enjoying their drones.

### **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-07-30 | 1.0 | Initial PRD draft | John, PM |

## **2\. Requirements**

### **Functional**

* **FR1:** The system shall display a live video stream from the AR.Drone 2.0's camera.  
* **FR2:** The user shall be able to send core flight commands to the drone, including Takeoff, Land, and Emergency Stop.  
* **FR3:** The user shall be able to control the drone's movement (forward/backward, left/right) and its altitude/rotation using on-screen controls.  
* **FR4:** The system shall display the drone's real-time status, including battery level, Wi-Fi connectivity, and current flight state (e.g., Landed, Flying).  
* **FR5:** The user shall be able to switch the video feed between the drone's front and bottom cameras.  
* **FR6:** The user shall be able to toggle the video feed into a full-screen display mode.

### **Non-Functional**

* **NFR1:** The application must be designed for rapid development and deployment for personal use.  
* **NFR2:** The user interface shall be simple, intuitive, and uncluttered, prioritizing ease of use over feature complexity.  
* **NFR3:** The control inputs and video feed should have low latency to ensure a responsive flying experience.  
* **NFR4:** The application shall be capable of running locally on a personal computer.

## **3\. User Interface Design Goals**

### **Overall UX Vision**

The user experience will be immersive and focused, prioritizing the live video feed above all else. The interface should feel like a cockpit window, not a complex dashboard. All controls and status information will be presented as non-intrusive overlays, ensuring the user's attention remains on flying the drone. The design will be clean, modern, and minimalist to support the goal of rapid development and intuitive operation.

### **Key Interaction Paradigms**

The primary interaction paradigm is a full-screen video display with context-sensitive overlays.

* **Status Information:** Displayed passively at the top of the screen.  
* **Flight Controls:** Presented actively at the bottom of the screen, with clear, touch/click-friendly targets for virtual joysticks and action buttons.

### **Core Screens and Views**

* **Main Control Interface:** A single, all-encompassing view that includes the video feed, status bar, and control bar. There are no other primary screens or views in the MVP.

### **Accessibility: None**

* For the initial MVP, accessibility features are not a primary focus. The design will prioritize functional simplicity for rapid development.

### **Branding**

* There are no specific branding requirements for this personal project. The design will use a clean, modern, and generic aesthetic.

### **Target Device and Platforms: Web Responsive**

* The application will be a responsive web app, designed to function on any desktop browser.

## **4\. Technical Assumptions**

### **Repository Structure: Monorepo**

* A single repository will be used to house both the frontend web application and the backend Node.js server. This simplifies setup and dependency management for a small project.

### **Service Architecture**

* The architecture will be a simple **Monolith**. The "backend" will be a lightweight Node.js server whose primary responsibilities are:  
  1. Interfacing with the node-ar-drone library.  
  2. Proxying UDP flight commands from the web client to the drone.  
  3. Proxying the TCP video stream from the drone to the web client (likely via WebSockets).

### **Testing Requirements**

* For the initial MVP, the focus will be on **Unit Only** testing for critical functions to ensure core logic is sound without the overhead of a full testing pyramid.

### **Additional Technical Assumptions and Requests**

* The core of the application's drone communication will be built upon the existing node-ar-drone Node.js library.  
* The frontend will be a modern JavaScript framework (e.g., React, Vue, or Svelte) capable of handling real-time data streams for video and telemetry.

## **5\. Epic List**

* **Epic 1: Foundation & Core Display:** Establish the foundational web application and backend server, connect to the drone, and display the live video stream and essential status telemetry.  
* **Epic 2: Interactive Flight Control:** Implement all user-facing flight controls, enabling the user to pilot the drone through the web interface.  
* **Epic 3: Enhanced Viewing Experience:** Add user controls for switching cameras and toggling a full-screen video mode.

## **6\. Epic Details**

### **Epic 1: Foundation & Core Display**

**Goal:** This epic focuses on establishing the core technical foundation of the project. The goal is to create a functional "hello world" by setting up the web server and frontend application, establishing a connection to the drone, and successfully displaying the live video stream and basic status data. This epic ensures the most critical and highest-risk components (drone communication and video streaming) are working before any complex UI is built.

#### **Story 1.1: Project Scaffolding**

As a developer,  
I want a basic monorepo structure with a Node.js backend and a frontend web app,  
so that I have a clean, organized foundation to start building the application.  
**Acceptance Criteria:**

1. A single Git repository is initialized.  
2. The repository contains a packages directory with two subdirectories: api (for the backend) and web (for the frontend).  
3. The api package has a basic Node.js server setup (e.g., using Express or Fastify).  
4. The web package is initialized with a modern frontend framework (e.g., using Vite \+ React).  
5. A root package.json is configured to manage both workspaces.

#### **Story 1.2: Drone Connection and Telemetry**

As a developer,  
I want the backend server to connect to the AR.Drone 2.0 and stream its telemetry data to the frontend,  
so that the web app can display real-time status information.  
**Acceptance Criteria:**

1. The backend server successfully initializes the node-ar-drone client and establishes a connection with the drone.  
2. The server captures telemetry data (at a minimum: battery level, flight state, Wi-Fi signal).  
3. A WebSocket connection is established between the frontend and the backend server.  
4. The backend broadcasts received telemetry data to all connected frontend clients via the WebSocket.  
5. The frontend client can receive and log the telemetry data to the browser console.

#### **Story 1.3: Live Video Stream Display**

As a user,  
I want to see the live video feed from the drone's camera displayed in the web application,  
so that I have a real-time view of the drone's perspective.  
**Acceptance Criteria:**

1. The backend server successfully receives the drone's H.264 video stream.  
2. The video stream is processed and proxied to the frontend via a WebSocket or similar real-time protocol.  
3. The frontend application renders the video stream in a standard HTML video element, filling the main view.  
4. The video display is stable and has minimal perceivable latency.

### **Epic 2: Interactive Flight Control**

**Goal:** This epic is focused on making the drone flyable. The goal is to implement all the primary user-facing controls, allowing the user to safely take off, land, and maneuver the drone in the air using the web interface. This epic builds directly on the foundation of Epic 1 by sending commands to the drone and reacting to its state.

#### **Story 2.1: Core Flight Actions**

As a user,  
I want to be able to command the drone to Takeoff, Land, and perform an Emergency Stop,  
so that I can manage the basic flight state of the drone safely.  
**Acceptance Criteria:**

1. The UI displays distinct buttons for "Takeoff/Land" and "Emergency Stop".  
2. Clicking the "Takeoff" button sends the takeoff command to the drone. The drone's state (from telemetry) updates to "Flying".  
3. When the drone is flying, the button changes to "Land". Clicking it sends the land command. The drone's state updates to "Landed".  
4. Clicking the "Emergency Stop" button at any time sends the emergency command, immediately cutting power to the motors.

#### **Story 2.2: Implement Movement and Rotation Controls**

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

### **Epic 3: Enhanced Viewing Experience**

**Goal:** This epic focuses on improving the user's visual control and immersion. The goal is to add functionality that gives the user more control over what they see, building on the core video stream established in Epic 1\.

#### **Story 3.1: Camera Switching**

As a user,  
I want a button to switch between the drone's front and bottom cameras,  
so that I can change my perspective during flight.  
**Acceptance Criteria:**

1. A camera-switch icon or button is displayed on the UI.  
2. Clicking the button sends the appropriate "switch camera" command to the drone.  
3. The video stream displayed in the UI updates to show the feed from the newly selected camera.  
4. The control works seamlessly while the drone is on the ground or in flight.

#### **Story 3.2: Full-Screen Mode**

As a user,  
I want to toggle a full-screen mode for the video feed,  
so that I can have a more immersive and unobstructed view while flying.  
**Acceptance Criteria:**

1. A "full-screen" icon or button is displayed on the UI.  
2. Clicking the button expands the web application's video element to fill the entire screen, hiding browser UI elements.  
3. All UI overlays (status bar, controls) remain functional and scale appropriately in full-screen mode.  
4. Clicking the button again (or pressing the 'Esc' key) exits full-screen mode and returns the view to its standard layout.

## **7\. Checklist Results Report**

I have performed a validation of the PRD against the standard **PM Requirements Checklist**. The document is in excellent shape and ready for the next phase.

| Category | Status | Critical Issues |
| :---- | :---- | :---- |
| 1\. Problem Definition & Context | ✅ PASS | None |
| 2\. MVP Scope Definition | ✅ PASS | None |
| 3\. User Experience Requirements | ✅ PASS | None |
| 4\. Functional Requirements | ✅ PASS | None |
| 5\. Non-Functional Requirements | ✅ PASS | None |
| 6\. Epic & Story Structure | ✅ PASS | None |
| 7\. Technical Guidance | ✅ PASS | None |
| 8\. Cross-Functional Requirements | ✅ PASS | None |
| 9\. Clarity & Communication | ✅ PASS | None |

Final Decision: READY FOR ARCHITECT & UX-EXPERT  
The PRD is comprehensive, properly structured, and ready for both architectural design and detailed UI/UX specification.

## **8\. Next Steps**

This PRD provides the necessary input for our specialist agents to proceed.

### **UX Expert Prompt**

**To: Sally (UX Expert)**

Please review the attached PRD, specifically the "User Interface Design Goals" section. Based on this, create a formal **UI/UX Specification** document (front-end-spec.md) that details the information architecture, user flows, and component standards for the drone control interface.

### **Architect Prompt**

**To: Winston (Architect)**

Please review the attached PRD, paying close attention to the "Requirements" and "Technical Assumptions" sections. Your task is to create a comprehensive **Architecture Document** (architecture.md) that defines the fullstack architecture, including the Node.js backend, the frontend application, and the communication protocols between them.