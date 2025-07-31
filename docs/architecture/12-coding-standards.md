# **12\. Coding Standards**

## **Core Standards**

* **Languages & Runtimes:** The project MUST use the exact versions of TypeScript (5.4.5) and Node.js (20.11.0) specified in the Tech Stack section.  
* **Style & Linting:** The default linting configurations provided by Vite (for the frontend) and a standard TypeScript linter (for the backend) will be used. Code should be formatted automatically on save using Prettier.  
* **Test Organization:** Test files MUST be co-located with the source files they are testing and use the .test.ts (or .test.tsx) extension.

## **Naming Conventions**

| Element | Convention | Example |
| :---- | :---- | :---- |
| Components | PascalCase | FlightControls.tsx |
| Hooks | camelCase (use prefix) | useDroneSocket.ts |
| API Files | kebab-case | drone-client.ts |
| Types/Interfaces | PascalCase | interface DroneTelemetry |

## **Critical Rules**

* **Type Safety:** All WebSocket messages sent or received MUST conform to the ControlCommand and DroneTelemetry types defined in the shared types file.  
* **No Direct Drone API in Frontend:** The frontend (web package) MUST NOT contain any direct references to the node-ar-drone library. All drone communication must be proxied through the backend server.  
* **Environment Variables:** There will be no environment variables for the MVP. All configuration should be hardcoded for simplicity.
