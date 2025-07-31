# **1\. Goals and Background Context**

## **Goals**

* To create a modern, simple, and functional web-based control interface for the Parrot AR.Drone 2.0.  
* To deliver an immersive and intuitive flying experience by prioritizing the live video feed.  
* To ensure the initial version (MVP) is developed quickly for personal use, focusing only on essential features for flight.

## **Background Context**

The official mobile applications for the Parrot AR.Drone 2.0 have been discontinued, leaving a gap for users who wish to operate their drones, especially on desktop platforms. This project aims to solve this by creating a browser-based controller that can be run locally.

The application will interface with the drone's known Wi-Fi protocol, sending UDP commands for flight control and receiving the H.264 TCP video stream, likely leveraging the node-ar-drone library as a foundational piece. The target users are hobbyists, educators, and tinkerers who need a fast, reliable, and modern interface to continue enjoying their drones.

## **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-07-30 | 1.0 | Initial PRD draft | John, PM |
