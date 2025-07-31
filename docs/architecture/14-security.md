# **14\. Security**

## **Input Validation**

* **Validation Library:** N/A. Manual type-checking will be used.  
* **Validation Location:** The backend server MUST validate all incoming WebSocket messages to ensure they conform to the ControlCommand type structure before processing them. This prevents malformed data from the client from crashing the server.

## **Authentication & Authorization**

* **Auth Method:** N/A. The application runs locally and does not have user accounts or authentication.

## **Secrets Management**

* **Approach:** N/A. The application does not require any API keys or secrets.

## **API Security**

* **WebSocket Security:** The backend WebSocket server MUST be bound to localhost. This ensures that only the web application running on the same machine can connect to it, preventing other devices on the local network from accessing the control server.

## **Data Protection**

* **PII Handling:** N/A. The application does not handle any Personally Identifiable Information (PII).

## **Dependency Security**

* **Scanning Tool:** Developers should periodically run npm audit to check for known vulnerabilities in the project's dependencies and apply patches as needed.
