# **4\. Technical Assumptions**

## **Repository Structure: Monorepo**

* A single repository will be used to house both the frontend web application and the backend Node.js server. This simplifies setup and dependency management for a small project.

## **Service Architecture**

* The architecture will be a simple **Monolith**. The "backend" will be a lightweight Node.js server whose primary responsibilities are:  
  1. Interfacing with the node-ar-drone library.  
  2. Proxying UDP flight commands from the web client to the drone.  
  3. Proxying the TCP video stream from the drone to the web client (likely via WebSockets).

## **Testing Requirements**

* For the initial MVP, the focus will be on **Unit Only** testing for critical functions to ensure core logic is sound without the overhead of a full testing pyramid.

## **Additional Technical Assumptions and Requests**

* The core of the application's drone communication will be built upon the existing node-ar-drone Node.js library.  
* The frontend will be a modern JavaScript framework (e.g., React, Vue, or Svelte) capable of handling real-time data streams for video and telemetry.
