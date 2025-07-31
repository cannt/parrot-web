# **11\. Error Handling Strategy**

## **General Approach**

* **Error Model:** Errors will be handled as close to their source as possible. The backend will manage drone-specific errors, and the frontend will manage UI and connection errors.  
* **Error Propagation:** The backend will not propagate raw drone errors to the frontend. Instead, it will update the flightState in the DroneTelemetry object to "error" and log the specific error to the server console. The frontend will react to this state change.  
* **User Feedback:** The UI will provide clear, user-friendly feedback when an error state is entered (e.g., displaying a "Connection Lost" message).

## **Logging Standards**

* **Library:** Standard console.log, console.warn, and console.error will be used for both the frontend and backend. No external logging libraries are needed for the MVP.  
* **Format:** Logs will be simple text messages, prefixed with the component or context (e.g., \[Backend\], \[WebSocket\], \[UI\]).

## **Error Handling Patterns**

* **Backend: Drone Connection Errors:**  
  * If the backend server cannot connect to the drone, it will log the error and periodically retry the connection.  
  * It will send a DroneTelemetry update with flightState: 'error' to the frontend.  
* **Frontend: WebSocket Errors:**  
  * If the frontend loses its WebSocket connection to the backend, it will display a "Disconnected" overlay.  
  * It will attempt to reconnect to the WebSocket server automatically.  
* **User-Facing Errors:**  
  * The UI will translate the flightState: 'error' into a simple, non-technical message for the user (e.g., "Drone connection error. Please check Wi-Fi and restart the drone.").
