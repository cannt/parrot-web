
import { useDroneSocket } from './hooks/useDroneSocket';
import { useKeyboardControls } from './hooks/useKeyboardControls';
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

  // Set up keyboard controls
  const { isActive: keyboardActive } = useKeyboardControls({
    onCommand: sendCommand,
    disabled: !isDroneConnected,
    sensitivity: 0.7
  });

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header - Fixed height */}
      <header className="bg-gray-800 text-white p-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">AR Drone Controller v1.3 🚁✨</h1>
          
          {/* Connection Status Indicators and Controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs">Backend</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isDroneConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs">Drone</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isVideoStreamActive ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              <span className="text-xs">Video</span>
            </div>
            
            {/* Full Screen Control */}
            <FullScreenControl className="ml-2" />
          </div>
        </div>
        
        {connectionError && (
          <div className="max-w-7xl mx-auto mt-1 p-1 bg-red-600 rounded text-xs">
            {connectionError}
          </div>
        )}
      </header>

      {/* Main Content - Responsive layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Video Player - Main View */}
        <div className="flex-1 p-1 sm:p-2 min-w-0 order-1 lg:order-1">
          <VideoPlayer 
            videoData={latestVideoData}
            isStreamActive={isVideoStreamActive}
            className="w-full h-full"
          />
        </div>

        {/* Controls - Mobile: Bottom, Desktop: Right Sidebar */}
        <aside className="w-full h-48 sm:h-56 lg:w-80 lg:h-auto bg-gray-800 text-white flex flex-col overflow-hidden order-2 lg:order-2">
          {/* Mobile-optimized controls */}
          <div className="flex-1 overflow-y-auto p-1 sm:p-2">
            {/* Compact Status Bar for Mobile */}
            <div className="bg-gray-700 p-1 sm:p-2 rounded-lg mb-1 sm:mb-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`flex items-center space-x-1 ${
                    latestTelemetry?.flightState === 'flying' ? 'text-green-400' :
                    latestTelemetry?.flightState === 'landed' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      latestTelemetry?.flightState === 'flying' ? 'bg-green-500' :
                      latestTelemetry?.flightState === 'landed' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="capitalize text-xs sm:text-sm">{latestTelemetry?.flightState || 'unknown'}</span>
                  </div>
                  <div className="text-blue-400 text-xs sm:text-sm">
                    ⚡ {latestTelemetry?.batteryPercentage || 0}%
                  </div>
                </div>
                <div className={`text-xs px-1 sm:px-2 py-1 rounded ${keyboardActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                  KB: {keyboardActive ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>

            {/* Flight Controls - Touch-optimized */}
            <div className="bg-gray-900 rounded-lg p-2 sm:p-3">
              <div className="flex space-x-1 sm:space-x-2 mb-2">
                <button
                  onClick={() => {
                    const isFlying = latestTelemetry?.flightState === 'flying' || latestTelemetry?.flightState === 'hovering';
                    sendCommand({
                      type: isFlying ? 'LAND' : 'TAKE_OFF',
                      timestamp: Date.now()
                    });
                  }}
                  className="flex-1 py-3 sm:py-2 px-2 sm:px-3 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-medium touch-manipulation"
                >
                  {latestTelemetry?.flightState === 'flying' || latestTelemetry?.flightState === 'hovering' ? '⬇ Land' : '⬆ Takeoff'}
                </button>
                <button
                  onClick={() => sendCommand({ type: 'EMERGENCY_STOP', timestamp: Date.now() })}
                  className="px-3 sm:px-3 py-3 sm:py-2 rounded bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs sm:text-sm font-medium touch-manipulation"
                >
                  🛑
                </button>
                <button
                  onClick={() => sendCommand({ type: 'SWITCH_CAMERA', timestamp: Date.now() })}
                  className="px-3 sm:px-3 py-3 sm:py-2 rounded bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs sm:text-sm font-medium touch-manipulation"
                >
                  📷
                </button>
              </div>
              
              {/* Recovery buttons - Mobile optimized */}
              <div className="flex space-x-1">
                <button
                  onClick={() => sendCommand({ type: 'RESET_EMERGENCY', timestamp: Date.now() })}
                  className="flex-1 py-2 sm:py-1 px-2 rounded bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-medium touch-manipulation"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={reconnectDrone}
                  className="flex-1 py-2 sm:py-1 px-2 rounded bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white text-xs font-medium touch-manipulation"
                >
                  🔌 Reconnect
                </button>
              </div>
            </div>

            {/* Virtual Joysticks for Mobile */}
            <div className="block lg:hidden">
              <div className="bg-gray-900 rounded-lg p-2">
                <h3 className="text-xs sm:text-sm font-semibold mb-2 text-center">🕹️ Touch Controls</h3>
                <MovementControls
                  onCommand={sendCommand}
                  disabled={!isDroneConnected}
                  className="h-32 sm:h-40"
                />
              </div>
            </div>

            {/* Keyboard Controls - Compact (Desktop only) */}
            <div className="hidden lg:block bg-gray-900 rounded-lg p-2">
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

            {/* Telemetry - Compact Grid */}
            {latestTelemetry && (
              <div className="bg-gray-900 rounded-lg p-2">
                <h3 className="text-sm font-semibold mb-1">📊 Data</h3>
                
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="bg-gray-800 p-1 rounded">
                    <div className="text-gray-400 text-xs">Battery</div>
                    <div className="text-sm font-bold text-blue-400">
                      {latestTelemetry.batteryPercentage}%
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                      <div 
                        className={`h-1 rounded-full ${
                          latestTelemetry.batteryPercentage > 50 ? 'bg-green-500' :
                          latestTelemetry.batteryPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${latestTelemetry.batteryPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-1 rounded">
                    <div className="text-gray-400 text-xs">WiFi</div>
                    <div className="text-sm font-bold text-green-400">
                      {latestTelemetry.wifiSignalStrength}
                    </div>
                  </div>
                </div>
                
                {/* Video Stream Info */}
                {latestVideoData && (
                  <div className="bg-gray-800 p-1 rounded mt-1">
                    <div className="text-gray-400 text-xs">Video: Seq {latestVideoData.sequenceNumber} | {Date.now() - latestVideoData.timestamp}ms</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Movement Controls */}
          <div className="bg-gray-900 p-2 border-t border-gray-700 flex-shrink-0">
            <MovementControls 
              onCommand={sendCommand}
              disabled={!isDroneConnected}
            />
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App