# AR Drone Controller

A modern web-based controller for AR drones with real-time video streaming and telemetry.

## Features

- 🎮 Real-time drone control via WebSocket
- 📹 Live video streaming
- 📊 Real-time telemetry display
- 🕹️ Virtual joystick controls (mobile-optimized)
- ⌨️ Keyboard controls for desktop
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket
- **Deployment**: Vercel (frontend) + Railway (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development servers
npm run dev
```

### Development

- Frontend: `cd packages/web && npm run dev`
- Backend: `cd packages/api && npm run dev`

### Building

```bash
# Build frontend for production
cd packages/web && npm run build:prod
```

## Controls

### Desktop (Keyboard)
- **WASD**: Move (pitch/roll)
- **Arrow Keys**: Altitude/rotation
- **Space**: Takeoff/Land
- **E**: Emergency stop

### Mobile (Touch)
- **Left Joystick**: Movement (forward/back/left/right)
- **Right Joystick**: Altitude and rotation
- **Touch Buttons**: Takeoff, land, emergency stop

## Live Demo

🌐 **https://ex0.es**

## License

MIT