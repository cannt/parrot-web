# 🚁 Parrot Web - AR Drone Controller

A modern, real-time web-based drone control application built with React, TypeScript, and Node.js. Control your AR.Drone through an intuitive web interface with live video streaming and telemetry data.

![Drone Controller](https://img.shields.io/badge/Drone-AR.Drone-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-orange)

## ✨ Features

- **🎮 Real-time Control**: Fly your drone with intuitive web controls
- **📹 Live Video Stream**: View live video feed from drone camera
- **📊 Telemetry Dashboard**: Monitor battery, flight state, and WiFi signal
- **🎯 Multiple Control Methods**: 
  - Virtual joystick for movement
  - Keyboard controls for advanced users
  - Touch-friendly mobile interface
- **🔄 Auto-reconnection**: Automatic reconnection to drone when connection is lost
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🏗️ Architecture

### Monorepo Structure
```
parrot-web/
├── packages/
│   ├── api/          # Backend API server
│   ├── web/          # React frontend
│   └── shared/       # Shared TypeScript types
├── docs/             # Documentation
└── deployment files
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket, ar-drone library
- **Testing**: Vitest, Jest, Testing Library
- **Deployment**: Vercel (frontend) + Railway (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 20.11.0 or higher
- npm 10.0.0 or higher
- AR.Drone (Parrot AR.Drone 2.0 recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cannt/parrot-web.git
   cd parrot-web
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp packages/web/.env.example packages/web/.env.local
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🎮 Usage

### Connecting to Your Drone

1. **Connect to drone WiFi**: Join your AR.Drone's WiFi network
2. **Start the application**: Run `npm run dev`
3. **Open web interface**: Navigate to http://localhost:3000
4. **Connect**: Click the connect button in the interface

### Controls

- **Takeoff/Land**: Large buttons in the interface
- **Movement**: Use virtual joystick or arrow keys
- **Rotation**: Left/right controls or A/D keys
- **Emergency**: Emergency stop button (Space key)

### Keyboard Shortcuts
- `↑/↓`: Forward/Backward
- `←/→`: Left/Right
- `W/S`: Up/Down
- `A/D`: Rotate Left/Right
- `Space`: Emergency stop
- `T`: Takeoff
- `L`: Land

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web          # Start frontend only
npm run dev:api          # Start backend only

# Building
npm run build            # Build both packages
npm run build:web        # Build frontend only
npm run build:api        # Build backend only

# Testing
npm run test             # Run all tests
npm run test:web         # Run frontend tests
npm run test:api         # Run backend tests
npm run lint             # Run linting
```

### Project Structure

```
packages/
├── api/
│   ├── src/
│   │   ├── index.ts           # Main server file
│   │   ├── drone-client.ts    # Drone connection logic
│   │   ├── video-stream.ts    # Video streaming handler
│   │   └── types.ts           # Backend types
│   └── package.json
│
├── web/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # Frontend types
│   │   └── App.tsx
│   └── package.json
│
└── shared/
    └── types.ts              # Shared TypeScript types
```

## 🚀 Deployment

This application is designed for easy deployment with a cost-effective setup:

- **Frontend**: Vercel (Free tier)
- **Backend**: Railway ($5/month)
- **Total Cost**: $5/month

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy Backend** (Railway)
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Set root directory: `packages/api`

3. **Deploy Frontend** (Vercel)
   - Go to [vercel.com](https://vercel.com)
   - Connect GitHub repository
   - Set root directory: `packages/web`
   - Add environment variables with Railway URL

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local)**
```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

**Backend**
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3001)

## 🐛 Troubleshooting

### Common Issues

**Drone won't connect**
- Ensure you're connected to the drone's WiFi network
- Check if drone is powered on and ready
- Try the reconnect button in the interface

**Video stream not working**
- Video streaming requires a stable connection
- Check drone battery level
- Restart both drone and application

**Controls not responding**
- Verify WebSocket connection status
- Check browser console for errors
- Try refreshing the page

### Debug Mode

Enable debug logging by setting `localStorage.debug = 'drone:*'` in browser console.

## 🧪 Testing

The project includes comprehensive test suites:

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application flow testing

Run tests with:
```bash
npm run test
```

## 📝 API Reference

### WebSocket Messages

**Outgoing (Client → Server)**
```typescript
{
  type: 'command',
  data: {
    action: 'takeoff' | 'land' | 'up' | 'down' | 'left' | 'right' | 'forward' | 'back' | 'clockwise' | 'counterClockwise' | 'stop' | 'emergency',
    duration?: number
  }
}
```

**Incoming (Server → Client)**
```typescript
// Telemetry
{
  type: 'telemetry',
  data: {
    batteryPercentage: number,
    flightState: 'landed' | 'flying' | 'hovering' | 'error' | 'unknown',
    wifiSignalStrength: number
  }
}

// Video Stream
{
  type: 'video',
  data: {
    chunk: Buffer,
    timestamp: number,
    sequenceNumber: number
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ar-drone](https://github.com/felixge/node-ar-drone) - Node.js library for AR.Drone
- [Parrot AR.Drone](https://www.parrot.com/) - The amazing drone that makes this possible
- Open source community for the incredible tools and libraries

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/cannt/parrot-web/issues)
3. Create a new issue with detailed information

---

**Happy Flying! 🚁✨**