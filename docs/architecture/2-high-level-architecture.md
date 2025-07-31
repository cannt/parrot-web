# **2\. High Level Architecture**

## **Technical Summary**

The system employs a simple client-server architecture designed for local operation. The core of the system is a lightweight Node.js backend that acts as a dedicated proxy and controller for the AR.Drone 2.0. It manages all direct communication with the drone. The frontend is a modern, responsive single-page web application that provides the user interface. All communication between the frontend and backend, including video, telemetry, and control commands, will be handled in real-time via WebSockets. This design, housed within a monorepo, ensures a tightly integrated system that is easy to manage and develop for this personal project.

## **Platform and Infrastructure Choice**

* **Platform:** Local Machine. This application is designed to be run entirely on a user's local computer (e.g., a laptop) that can connect directly to the drone's Wi-Fi network.  
* **Key Services:** No external cloud services are required for the MVP. All components (frontend, backend) are self-contained.  
* **Deployment Host and Regions:** N/A. Deployment consists of running the application locally.

## **Repository Structure**

* **Structure:** Monorepo. As specified in the PRD, a single repository is the most efficient choice.  
* **Monorepo Tool:** Standard npm workspaces will be used to manage the api and web packages, simplifying dependency management and cross-package scripting.

## **High Level Architecture Diagram**

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

## **Architectural Patterns**

* **Backend Proxy/Facade:** The Node.js server will act as a Facade, providing a simplified WebSocket API to the frontend while encapsulating the more complex UDP/TCP-based interactions of the node-ar-drone library.  
* **Component-Based UI:** The frontend will be built using reusable components (e.g., VideoPlayer, StatusDisplay, FlightControls) as is standard with modern web frameworks.  
* **Observer Pattern (Real-time Data):** The frontend will observe the backend for real-time telemetry and video data pushed via WebSockets, updating the UI reactively as new data arrives.
