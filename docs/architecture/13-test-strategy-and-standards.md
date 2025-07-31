# **13\. Test Strategy and Standards**

## **Testing Philosophy**

* **Approach:** Test-After. For the MVP, tests will be written after the initial implementation to validate core functionality, prioritizing speed of development.  
* **Coverage Goals:** There are no strict code coverage targets for the MVP. The focus is on testing critical, complex, or high-risk logic rather than achieving a specific percentage.  
* **Test Pyramid:** The strategy is focused exclusively on the base of the pyramid: **Unit Tests**. Integration and End-to-End (E2E) tests are out of scope for the MVP.

## **Test Types and Organization**

* **Unit Tests:**  
  * **Frameworks:** Vitest for the frontend (web package) and Jest for the backend (api package), as specified in the Tech Stack.  
  * **File Convention:** Test files will be named \[filename\].test.ts or \[filename\].test.tsx.  
  * **Location:** Tests will be co-located with the source code files they are testing.  
  * **Mocking:** All external dependencies, especially the node-ar-drone client on the backend and WebSocket connections on the frontend, MUST be mocked during unit tests.

## **Test Data Management**

* **Strategy:** Test data will be hardcoded directly within the test files. There is no need for complex fixtures or factories for the MVP.
