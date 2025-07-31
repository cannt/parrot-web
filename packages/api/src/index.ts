import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import { DroneClient } from './drone-client';
import { VideoStreamProcessor } from './video-stream';
import { DroneTelemetry, VideoStreamData, WebSocketMessage, ControlCommand } from './types';

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });
const droneClient = new DroneClient();
const videoProcessor = new VideoStreamProcessor();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Basic health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    droneConnected: droneClient.getConnectionStatus()
  });
});

// Manual drone reconnection endpoint
app.post('/reconnect', async (_req, res) => {
  try {
    console.log('Manual reconnection requested via API');
    res.json({ message: 'Reconnection attempt started' });
    
    // Attempt reconnection in background
    setTimeout(() => {
      initializeDrone(0);
    }, 1000);
    
  } catch (error) {
    console.error('Error in manual reconnection:', error);
    res.status(500).json({ error: 'Reconnection failed', details: error });
  }
});

// Broadcast telemetry to all connected WebSocket clients
const broadcastTelemetry = (telemetry: DroneTelemetry) => {
  const message: WebSocketMessage = {
    type: 'telemetry',
    data: telemetry,
    timestamp: new Date().toISOString()
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

// Broadcast video data to all connected WebSocket clients
const broadcastVideoData = (videoData: VideoStreamData) => {
  const message: WebSocketMessage = {
    type: 'video',
    data: videoData,
    timestamp: new Date().toISOString()
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error broadcasting video data:', error);
      }
    }
  });
};

// Setup drone telemetry broadcasting
droneClient.onTelemetry(broadcastTelemetry);

// Setup video stream processing and broadcasting
droneClient.onVideo((videoData: VideoStreamData) => {
  videoProcessor.processVideoData(videoData);
});

// Setup video processor broadcasting
videoProcessor.onProcessedStream(broadcastVideoData);

// Handle control commands from WebSocket with enhanced error handling
const handleControlCommand = async (command: ControlCommand, ws: WebSocket) => {
  try {
    console.log(`Received control command: ${command.type}`);
    
    // Check if drone is connected before sending commands
    if (!droneClient.getConnectionStatus() && command.type !== 'RESET_EMERGENCY') {
      ws.send(JSON.stringify({ type: 'ack', message: 'Drone not connected. Please wait for reconnection.' }));
      return;
    }
    
    switch (command.type) {
      case 'TAKE_OFF':
        await droneClient.takeoff();
        ws.send(JSON.stringify({ type: 'ack', message: 'Takeoff command sent successfully' }));
        break;
      
      case 'LAND':
        await droneClient.land();
        ws.send(JSON.stringify({ type: 'ack', message: 'Land command sent successfully' }));
        break;
      
      case 'EMERGENCY_STOP':
        await droneClient.emergencyStop();
        ws.send(JSON.stringify({ type: 'ack', message: 'Emergency stop command sent successfully' }));
        break;
      
      case 'MOVE':
        if (command.payload) {
          // Check if all movement values are near zero (joystick released)
          const { pitch, roll, yaw, gaz } = command.payload;
          const threshold = 0.05;
          const isReleased = Math.abs(pitch) < threshold && 
                           Math.abs(roll) < threshold && 
                           Math.abs(yaw) < threshold && 
                           Math.abs(gaz) < threshold;
          
          if (isReleased) {
            await droneClient.hover();
          } else {
            await droneClient.move(command.payload);
          }
        } else {
          // No payload means stop/hover
          await droneClient.hover();
        }
        // Don't send ack for movement commands to reduce WebSocket traffic
        break;
      
      case 'SWITCH_CAMERA':
        await droneClient.switchCamera();
        ws.send(JSON.stringify({ type: 'ack', message: 'Camera switch command sent successfully' }));
        break;

      case 'RESET_EMERGENCY':
        try {
          await droneClient.resetEmergency();
          ws.send(JSON.stringify({ type: 'ack', message: 'Emergency state reset successfully' }));
          
          // Try to reconnect after reset
          setTimeout(() => {
            initializeDrone(0);
          }, 2000);
        } catch (resetError) {
          console.error('Error during emergency reset:', resetError);
          ws.send(JSON.stringify({ type: 'ack', message: 'Reset failed. Attempting reconnection...' }));
          
          // Force reconnection attempt
          setTimeout(() => {
            initializeDrone(0);
          }, 2000);
        }
        break;
      
      default:
        ws.send(JSON.stringify({ type: 'ack', message: `Unknown command type: ${command.type}` }));
    }
  } catch (error) {
    console.error('Error handling control command:', error);
    
    // Send error message but don't crash
    try {
      ws.send(JSON.stringify({ type: 'ack', message: `Command failed: ${error}. Server still running.` }));
    } catch (wsError) {
      console.error('Failed to send error message via WebSocket:', wsError);
    }
    
    // If it's a drone connection error, try to reconnect
    if (error instanceof Error && error.message.includes('not connected')) {
      console.log('Drone disconnected. Attempting reconnection...');
      setTimeout(() => {
        initializeDrone(0);
      }, 3000);
    }
  }
};

// WebSocket connection handling with error recovery
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  
  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    // Don't crash the server on WebSocket errors
  });
  
  ws.on('message', (rawMessage) => {
    try {
      const message = JSON.parse(rawMessage.toString());
      console.log('Received message:', message);
      
      // Handle control commands
      if (message.type === 'command' && message.data) {
        handleControlCommand(message.data as ControlCommand, ws);
      } else {
        ws.send(JSON.stringify({ type: 'ack', message: 'Message received' }));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      try {
        ws.send(JSON.stringify({ type: 'ack', message: 'Invalid message format' }));
      } catch (wsError) {
        console.error('Failed to send error response:', wsError);
        // Don't crash if we can't send the error message
      }
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
  
  // Send welcome message with error handling
  try {
    ws.send(JSON.stringify({ 
      type: 'connection', 
      message: 'Connected to AR Drone Controller API',
      droneConnected: droneClient.getConnectionStatus()
    }));
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }
});

// Handle WebSocket server errors
wss.on('error', (error) => {
  console.error('WebSocket Server error:', error);
  // Don't crash the server on WebSocket server errors
});

// Initialize drone connection and video processing with retry logic
const initializeDrone = async (retryCount = 0) => {
  try {
    console.log(`Attempting to connect to AR.Drone... (attempt ${retryCount + 1})`);
    await droneClient.connect();
    
    // Start video processor when drone is connected
    videoProcessor.start();
    
    console.log('Successfully connected to AR.Drone');
    console.log('Video stream processor started');
  } catch (error) {
    console.error('Failed to connect to AR.Drone:', error);
    console.log('Server will continue without drone connection');
    
    // Auto-retry connection every 10 seconds (up to 5 times)
    if (retryCount < 5) {
      console.log(`Will retry connection in 10 seconds... (${retryCount + 1}/5)`);
      setTimeout(() => {
        initializeDrone(retryCount + 1);
      }, 10000);
    } else {
      console.log('Max retry attempts reached. Drone connection will be manual.');
    }
  }
};

// Global error handlers to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.log('Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('Server will continue running...');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  
  // Disconnect drone safely
  try {
    droneClient.disconnect();
  } catch (error) {
    console.error('Error during drone disconnect:', error);
  }
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  
  // Disconnect drone safely
  try {
    droneClient.disconnect();
  } catch (error) {
    console.error('Error during drone disconnect:', error);
  }
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`AR Drone Controller API server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
    
    // Initialize drone connection after server starts
    initializeDrone();
  });
}

export default app;