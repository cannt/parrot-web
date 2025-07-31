# **3\. Tech Stack**

## **Technology Stack Table**

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
