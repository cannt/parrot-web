# **AR.Drone 2.0 Web Controller Fullstack Architecture Document**

## **1\. Introduction**

This document outlines the complete fullstack architecture for the AR.Drone 2.0 Web Controller, including the Node.js backend system, the responsive frontend application, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack. This unified approach will streamline the development process for this modern, real-time application.

### **Starter Template or Existing Project**

N/A \- This is a greenfield project being built from scratch.

### **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-07-30 | 1.0 | Initial architecture draft | Winston, Architect |

## **2\. High Level Architecture**

### **Technical Summary**

The system employs a simple client-server architecture designed for local operation. The core of the system is a lightweight Node.js backend that acts as a dedicated proxy and controller for the AR.Drone 2.0. It manages all direct communication with the drone. The frontend is a modern, responsive single-page web application that provides the user interface. All communication between the frontend and backend, including video, telemetry, and control commands, will be handled in real-time via WebSockets. This design, housed within a monorepo, ensures a tightly integrated system that is easy to manage and develop for this personal project.

### **Platform and Infrastructure Choice**

* **Platform:** Local Machine. This application is designed to be run entirely on a user's local computer (e.g., a laptop) that can connect directly to the drone's Wi-Fi network.  
* **Key Services:** No external cloud services are required for the MVP. All components (frontend, backend) are self-contained.  
* **Deployment Host and Regions:** N/A. Deployment consists of running the application locally.

### **Repository Structure**

* **Structure:** Monorepo. As specified in the PRD, a single repository is the most efficient choice.  
* **Monorepo Tool:** Standard npm workspaces will be used to manage the api and web packages, simplifying dependency management and cross-package scripting.

### **High Level Architecture Diagram**

graph TD  
    subgraph User's Computer  
        A\[Browser: Web App UI\]  
        B\[Node.js Backend\]  
    end

    subgraph Drone's Wi-Fi Network  
        C\[Parrot AR.Drone 2.0\]  
    end

    A \-- WebSocket (Commands, Video, Telemetry) \--\> B  
    B \-- Wi-Fi (UDP Commands & TCP Video/Navdata) \--\> C

### **Architectural Patterns**

* **Backend Proxy/Facade:** The Node.js server will act as a Facade, providing a simplified WebSocket API to the frontend while encapsulating the more complex UDP/TCP-based interactions of the node-ar-drone library.  
* **Component-Based UI:** The frontend will be built using reusable components (e.g., VideoPlayer, StatusDisplay, FlightControls) as is standard with modern web frameworks.  
* **Observer Pattern (Real-time Data):** The frontend will observe the backend for real-time telemetry and video data pushed via WebSockets, updating the UI reactively as new data arrives.

## **3\. Tech Stack**

### **Technology Stack Table**

| Category | Technology | Version | Purpose | Rationale |
| :---- | :---- | :---- | :---- | :---- |
| **Language** | TypeScript | 5.4.5 | Primary language for both frontend and backend | Provides type safety for real-time data, preventing common errors and improving code quality. |
| **Backend Runtime** | Node.js | 20.11.0 | JavaScript runtime for the server | Required by the core node-ar-drone library and ideal for handling real-time I/O. |
| **Backend Framework** | Express | 4.19.2 | Web server framework | Minimal and fast for creating the simple backend proxy needed for this project. |
| **Real-time API** | WebSocket (ws) | 8.17.0 | Real-time communication protocol | Essential for low-latency streaming of video, telemetry, and control commands. |
| **Frontend Framework** | React | 18.3.1 | UI library for building the web application | A modern, popular, and efficient choice for creating component-based, reactive user interfaces. |
| **Frontend Build Tool** | Vite | 5.2.0 | Frontend development and build tool | Extremely fast setup and hot-reloading, which aligns perfectly with the goal of rapid development. |
| **Styling** | Tailwind CSS | 3.4.3 | Utility-first CSS framework | Allows for rapid UI development directly in the HTML without writing separate CSS files. |
| **Backend Testing** | Jest | 29.7.0 | Testing framework for the backend | A standard, robust choice for unit testing the Node.js server logic. |
| **Frontend Testing** | Vitest | 1.6.0 | Testing framework for the frontend | The native testing companion for Vite, offering a fast and seamless testing experience. |
| **Database** | N/A | \- | Not required for MVP | The application is a real-time controller and does not need to persist data. |
| **Authentication** | N/A | \- | Not required for MVP | This is a locally-run, personal-use application with no user accounts. |

## **4\. Data Models**

### **DroneTelemetry**

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

### **ControlCommand**

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

## **5\. Components**

### **Backend Server (api package)**

* **Responsibility:** This component acts as the central nervous system for drone communication. Its sole responsibility is to be a dedicated proxy, translating simple WebSocket messages from the frontend into the complex UDP/TCP commands required by the drone via the node-ar-drone library, and vice-versa. It encapsulates all direct interaction with the drone, shielding the frontend from the complexities of the drone's protocol.  
* **Key Interfaces:**  
  * Exposes a single WebSocket endpoint (e.g., /ws) for all real-time, bidirectional communication with the frontend.  
* **Dependencies:** node-ar-drone, ws (WebSocket library), express.  
* **Technology Stack:** Node.js, Express, TypeScript.

### **Frontend Web App (web package)**

* **Responsibility:** This component is responsible for everything the user sees and interacts with. It renders the user interface, including the video player, status displays, and flight controls. It captures user input (clicks, joystick movements) and sends the corresponding ControlCommand data models to the backend via the WebSocket connection. It also listens for and reactively displays the DroneTelemetry and video data it receives from the backend.  
* **Key Interfaces:**  
  * Connects to the backend's WebSocket endpoint to send commands and receive data.  
* **Dependencies:** react, tailwindcss.  
* **Technology Stack:** React, Vite, TypeScript.

## **6\. External APIs**

Not applicable for the Minimum Viable Product (MVP). The application is self-contained and communicates directly with the drone via a local backend proxy. No external cloud services or third-party APIs are required.

## **7\. Core Workflows**

This sequence diagram illustrates the end-to-end flow for a single user action, such as pressing the "Takeoff" button.

sequenceDiagram  
    participant User  
    participant WebAppUI as Frontend Web App  
    participant BackendServer as Node.js Backend  
    participant Drone

    User-\>\>WebAppUI: Clicks "Takeoff" button  
    WebAppUI-\>\>BackendServer: Sends 'TAKE\_OFF' command via WebSocket  
    BackendServer-\>\>Drone: Relays 'takeoff' command (UDP)  
    Drone--\>\>BackendServer: Sends updated telemetry (state: "flying")  
    BackendServer--\>\>WebAppUI: Broadcasts new telemetry via WebSocket  
    WebAppUI-\>\>User: Updates UI (e.g., state text changes to "Flying")

## **8\. Database Schema**

Not applicable for the Minimum Viable Product (MVP). The application handles real-time data and does not have a requirement for data persistence.

## **9\. Source Tree**

ar-drone-controller/  
├── packages/  
│   ├── api/  
│   │   ├── src/  
│   │   │   └── index.ts      \# Main backend server entry point  
│   │   ├── package.json  
│   │   └── tsconfig.json  
│   │  
│   └── web/  
│       ├── src/  
│       │   ├── components/   \# React components (e.g., VideoPlayer, Controls)  
│       │   ├── hooks/        \# Custom React hooks (e.g., useDroneSocket)  
│       │   ├── App.tsx       \# Main React application component  
│       │   └── main.tsx      \# Frontend application entry point  
│       ├── index.html  
│       ├── package.json  
│       └── tsconfig.json  
│  
├── docs/  
│   └── prd.md  
│  
└── package.json              \# Root package.json with workspace config

## **10\. Infrastructure and Deployment**

### **Infrastructure as Code**

* **Tool:** N/A. No cloud infrastructure is being provisioned.  
* **Location:** N/A.  
* **Approach:** The "infrastructure" is the user's local machine with Node.js and npm installed. The project's package.json files define all necessary dependencies.

### **Deployment Strategy**

* **Strategy:** Local execution. "Deployment" consists of running scripts from the project's root directory.  
* **CI/CD Platform:** N/A. No continuous integration or deployment pipeline is needed for the MVP.  
* **Pipeline Configuration:** N/A.

### **Environments**

* **Development:** The only environment is the local development environment, run via npm run dev.

### **Rollback Strategy**

* **Primary Method:** Version control via Git. Changes can be reverted by checking out a previous commit.  
* **Trigger Conditions:** N/A.  
* **Recovery Time Objective:** N/A.

## **11\. Error Handling Strategy**

### **General Approach**

* **Error Model:** Errors will be handled as close to their source as possible. The backend will manage drone-specific errors, and the frontend will manage UI and connection errors.  
* **Error Propagation:** The backend will not propagate raw drone errors to the frontend. Instead, it will update the flightState in the DroneTelemetry object to "error" and log the specific error to the server console. The frontend will react to this state change.  
* **User Feedback:** The UI will provide clear, user-friendly feedback when an error state is entered (e.g., displaying a "Connection Lost" message).

### **Logging Standards**

* **Library:** Standard console.log, console.warn, and console.error will be used for both the frontend and backend. No external logging libraries are needed for the MVP.  
* **Format:** Logs will be simple text messages, prefixed with the component or context (e.g., \[Backend\], \[WebSocket\], \[UI\]).

### **Error Handling Patterns**

* **Backend: Drone Connection Errors:**  
  * If the backend server cannot connect to the drone, it will log the error and periodically retry the connection.  
  * It will send a DroneTelemetry update with flightState: 'error' to the frontend.  
* **Frontend: WebSocket Errors:**  
  * If the frontend loses its WebSocket connection to the backend, it will display a "Disconnected" overlay.  
  * It will attempt to reconnect to the WebSocket server automatically.  
* **User-Facing Errors:**  
  * The UI will translate the flightState: 'error' into a simple, non-technical message for the user (e.g., "Drone connection error. Please check Wi-Fi and restart the drone.").

## **12\. Coding Standards**

### **Core Standards**

* **Languages & Runtimes:** The project MUST use the exact versions of TypeScript (5.4.5) and Node.js (20.11.0) specified in the Tech Stack section.  
* **Style & Linting:** The default linting configurations provided by Vite (for the frontend) and a standard TypeScript linter (for the backend) will be used. Code should be formatted automatically on save using Prettier.  
* **Test Organization:** Test files MUST be co-located with the source files they are testing and use the .test.ts (or .test.tsx) extension.

### **Naming Conventions**

| Element | Convention | Example |
| :---- | :---- | :---- |
| Components | PascalCase | FlightControls.tsx |
| Hooks | camelCase (use prefix) | useDroneSocket.ts |
| API Files | kebab-case | drone-client.ts |
| Types/Interfaces | PascalCase | interface DroneTelemetry |

### **Critical Rules**

* **Type Safety:** All WebSocket messages sent or received MUST conform to the ControlCommand and DroneTelemetry types defined in the shared types file.  
* **No Direct Drone API in Frontend:** The frontend (web package) MUST NOT contain any direct references to the node-ar-drone library. All drone communication must be proxied through the backend server.  
* **Environment Variables:** There will be no environment variables for the MVP. All configuration should be hardcoded for simplicity.

## **13\. Test Strategy and Standards**

### **Testing Philosophy**

* **Approach:** Test-After. For the MVP, tests will be written after the initial implementation to validate core functionality, prioritizing speed of development.  
* **Coverage Goals:** There are no strict code coverage targets for the MVP. The focus is on testing critical, complex, or high-risk logic rather than achieving a specific percentage.  
* **Test Pyramid:** The strategy is focused exclusively on the base of the pyramid: **Unit Tests**. Integration and End-to-End (E2E) tests are out of scope for the MVP.

### **Test Types and Organization**

* **Unit Tests:**  
  * **Frameworks:** Vitest for the frontend (web package) and Jest for the backend (api package), as specified in the Tech Stack.  
  * **File Convention:** Test files will be named \[filename\].test.ts or \[filename\].test.tsx.  
  * **Location:** Tests will be co-located with the source code files they are testing.  
  * **Mocking:** All external dependencies, especially the node-ar-drone client on the backend and WebSocket connections on the frontend, MUST be mocked during unit tests.

### **Test Data Management**

* **Strategy:** Test data will be hardcoded directly within the test files. There is no need for complex fixtures or factories for the MVP.

## **14\. Security**

### **Input Validation**

* **Validation Library:** N/A. Manual type-checking will be used.  
* **Validation Location:** The backend server MUST validate all incoming WebSocket messages to ensure they conform to the ControlCommand type structure before processing them. This prevents malformed data from the client from crashing the server.

### **Authentication & Authorization**

* **Auth Method:** N/A. The application runs locally and does not have user accounts or authentication.

### **Secrets Management**

* **Approach:** N/A. The application does not require any API keys or secrets.

### **API Security**

* **WebSocket Security:** The backend WebSocket server MUST be bound to localhost. This ensures that only the web application running on the same machine can connect to it, preventing other devices on the local network from accessing the control server.

### **Data Protection**

* **PII Handling:** N/A. The application does not handle any Personally Identifiable Information (PII).

### **Dependency Security**

* **Scanning Tool:** Developers should periodically run npm audit to check for known vulnerabilities in the project's dependencies and apply patches as needed.

## **15\. Checklist Results Report**

I have performed a validation of this architecture against the standard **Architect Solution Validation Checklist**. The architecture is well-defined, internally consistent, and directly supports the requirements of the PRD.

| Category | Status | Critical Issues |
| :---- | :---- | :---- |
| 1\. Requirements Alignment | ✅ PASS | None |
| 2\. Architecture Fundamentals | ✅ PASS | None |
| 3\. Technical Stack & Decisions | ✅ PASS | None |
| 4\. Frontend Design & Implementation | ✅ PASS | None |
| 5\. Resilience & Operational Readiness | ✅ PASS | None |
| 6\. Security & Compliance | ✅ PASS | None |
| 7\. Implementation Guidance | ✅ PASS | None |
| 8\. Dependency & Integration Management | ✅ PASS | None |
| 9\. AI Agent Implementation Suitability | ✅ PASS | None |

Final Decision: READY FOR DEVELOPMENT  
The architecture is robust, clear, and provides a sufficient blueprint for development to begin.

## **16\. Next Steps**

This architecture document, in conjunction with the PRD, provides all the necessary information to begin development. The next logical step is to hand this off to the development team (or in this case, the dev agent).

### **Developer Handoff Prompt**

**To: Dev Agent**

The fullstack architecture for the AR.Drone 2.0 Web Controller is complete and documented. Please begin implementation by following the epics and stories outlined in the prd.md.

Start with **Epic 1, Story 1.1: Project Scaffolding**. Your first task is to create the monorepo structure as defined in the **Source Tree** section of the architecture document.