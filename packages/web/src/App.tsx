
import { useDroneSocket } from './hooks/useDroneSocket';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { useViewport } from './hooks/useViewport';
import VideoPlayer from './components/VideoPlayer';
import MovementControls from './components/MovementControls';
import FullScreenControl from './components/FullScreenControl';

function App() {
  const { 
    isConnected, 
    isDroneConnected, 
    latestTelemetry, 
    latestVideoData,
    isVideoStreamActive,
    connectionError,
    sendCommand,
    reconnectDrone
  } = useDroneSocket();

  // Track viewport for responsive and orientation handling
  const { isLandscape, isMobile } = useViewport();

  // Set up keyboard controls
  const { isActive: keyboardActive } = useKeyboardControls({
    onCommand: sendCommand,
    disabled: !isDroneConnected,
    sensitivity: 0.7
  });

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden min-h-screen">
      {/* Main Content - Full screen video with overlay controls */}
      <main className="relative flex-1 overflow-hidden">
        {/* Video Player - Full screen background */}
        <VideoPlayer 
          videoData={latestVideoData}
          isStreamActive={isVideoStreamActive}
          className="absolute inset-0 w-full h-full"
        />

        {/* Overlay Controls - Mobile optimized */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Bar - Connection status and controls */}
          <div className="pointer-events-auto bg-gradient-to-b from-black/70 to-transparent p-3 sm:p-4">
            <div className="flex items-center justify-between">
              {/* Left side - Title and connection status */}
              <div className="flex items-center space-x-3">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white">AR Drone 🚁</h1>
                
                {/* Connection indicators */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-white/80 hidden sm:inline">Backend</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      isDroneConnected ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-xs text-white/80 hidden sm:inline">Drone</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      isVideoStreamActive ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs text-white/80 hidden sm:inline">Video</span>
                  </div>
                </div>
              </div>

              {/* Right side - Status and fullscreen */}
              <div className="flex items-center space-x-3">
                {/* Battery and status */}
                {latestTelemetry && (
                  <div className="flex items-center space-x-3 text-white">
                    <div className="text-sm font-medium">
                      ⚡ {latestTelemetry.batteryPercentage}%
                    </div>
                    <div className={`text-sm font-medium ${
                      latestTelemetry?.flightState === 'flying' ? 'text-green-400' :
                      latestTelemetry?.flightState === 'landed' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {latestTelemetry?.flightState || 'unknown'}
                    </div>
                  </div>
                )}
                <FullScreenControl className="text-white" />
              </div>
            </div>
            
            {connectionError && (
              <div className="mt-2 p-2 bg-red-600/90 rounded text-xs text-white">
                {connectionError}
              </div>
            )}
          </div>

          {/* Bottom Controls - Touch optimized with larger buttons */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
            {/* Primary control buttons - Extra large for mobile */}
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={() => {
                  const isFlying = latestTelemetry?.flightState === 'flying' || latestTelemetry?.flightState === 'hovering';
                  sendCommand({
                    type: isFlying ? 'LAND' : 'TAKE_OFF',
                    timestamp: Date.now()
                  });
                }}
                className="min-w-[100px] min-h-[56px] px-6 py-4 rounded-lg bg-blue-600/90 hover:bg-blue-700/90 active:bg-blue-800/90 text-white font-semibold text-base sm:text-lg backdrop-blur-sm touch-manipulation transition-all duration-150 shadow-lg"
              >
                {latestTelemetry?.flightState === 'flying' || latestTelemetry?.flightState === 'hovering' ? '⬇ Land' : '⬆ Takeoff'}
              </button>
              <button
                onClick={() => sendCommand({ type: 'EMERGENCY_STOP', timestamp: Date.now() })}
                className="min-w-[56px] min-h-[56px] px-4 py-4 rounded-lg bg-red-600/90 hover:bg-red-700/90 active:bg-red-800/90 text-white font-semibold text-xl backdrop-blur-sm touch-manipulation transition-all duration-150 shadow-lg"
              >
                🛑
              </button>
              <button
                onClick={() => sendCommand({ type: 'SWITCH_CAMERA', timestamp: Date.now() })}
                className="min-w-[56px] min-h-[56px] px-4 py-4 rounded-lg bg-purple-600/90 hover:bg-purple-700/90 active:bg-purple-800/90 text-white font-semibold text-xl backdrop-blur-sm touch-manipulation transition-all duration-150 shadow-lg"
              >
                📷
              </button>
            </div>
            
            {/* Secondary controls */}
            <div className="flex justify-center space-x-3 mb-4">
              <button
                onClick={() => sendCommand({ type: 'RESET_EMERGENCY', timestamp: Date.now() })}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-orange-600/80 hover:bg-orange-700/80 active:bg-orange-800/80 text-white text-sm font-medium backdrop-blur-sm touch-manipulation transition-all duration-150"
              >
                🔄 Reset
              </button>
              <button
                onClick={reconnectDrone}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-yellow-600/80 hover:bg-yellow-700/80 active:bg-yellow-800/80 text-white text-sm font-medium backdrop-blur-sm touch-manipulation transition-all duration-150"
              >
                🔌 Reconnect
              </button>
            </div>

            {/* Virtual Joysticks - Always visible on mobile, positioned for easy thumb access */}
            {isMobile && (
              <div className="flex justify-between items-end px-4 sm:px-8">
                <MovementControls
                  onCommand={sendCommand}
                  disabled={!isDroneConnected}
                  className=""
                />
              </div>
            )}
          </div>

          {/* Desktop controls panel - Only show on larger screens */}
          {!isMobile && (
            <aside className="absolute right-0 top-20 bottom-20 w-80 pointer-events-auto bg-gray-800/90 backdrop-blur-sm text-white overflow-y-auto m-4 rounded-lg shadow-xl">
              <div className="p-4">
                {/* Keyboard status */}
                <div className="bg-gray-700 p-3 rounded-lg mb-3">
                  <div className={`text-sm font-medium ${keyboardActive ? 'text-green-400' : 'text-gray-400'}`}>
                    ⌨️ Keyboard: {keyboardActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* Keyboard Controls - Desktop */}
                <div className="bg-gray-900 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-1 flex items-center justify-between">
                <span>⌨️ Keyboard</span>
                <div className={`w-2 h-2 rounded-full ${keyboardActive ? 'bg-green-500' : 'bg-gray-500'}`} />
              </h3>
              
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="bg-gray-800 p-1 rounded">
                  <div className="text-gray-400 text-xs mb-1">Movement</div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">WASD</kbd>
                      <span className="text-gray-300 text-xs">Move</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-1 rounded">
                  <div className="text-gray-400 text-xs mb-1">Altitude</div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">↑↓←→</kbd>
                      <span className="text-gray-300 text-xs">Alt/Turn</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-1 flex justify-center space-x-2 text-xs">
                <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">Space</kbd>
                <span className="text-gray-400">Takeoff</span>
                <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">E</kbd>
                <span className="text-gray-400">Stop</span>
              </div>
            </div>

                {/* Telemetry */}
                {latestTelemetry && (
                  <div className="bg-gray-900 rounded-lg p-3 mt-3">
                    <h3 className="text-sm font-semibold mb-2">📊 Telemetry</h3>
                
                    <div className="space-y-2">
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Battery</span>
                          <span className="text-lg font-bold text-blue-400">{latestTelemetry.batteryPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              latestTelemetry.batteryPercentage > 50 ? 'bg-green-500' :
                              latestTelemetry.batteryPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${latestTelemetry.batteryPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 p-2 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">WiFi Signal</span>
                          <span className="text-lg font-bold text-green-400">{latestTelemetry.wifiSignalStrength}</span>
                        </div>
                      </div>
                    </div>
                
                    {/* Video Stream Info */}
                    {latestVideoData && (
                      <div className="bg-gray-800 p-2 rounded mt-2">
                        <div className="text-gray-400 text-xs">
                          Video: Seq {latestVideoData.sequenceNumber} | {Date.now() - latestVideoData.timestamp}ms
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Desktop Movement Controls */}
                <div className="bg-gray-900 rounded-lg p-3 mt-3">
                  <h3 className="text-sm font-semibold mb-3 text-center">Movement Controls</h3>
                  <MovementControls 
                    onCommand={sendCommand}
                    disabled={!isDroneConnected}
                  />
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}

export default App