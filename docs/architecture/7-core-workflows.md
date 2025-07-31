# **7\. Core Workflows**

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
