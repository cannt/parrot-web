
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
      {/* Header - Mobile-first responsive design */}
      <header className="bg-gray-800 text-white p-2 sm:p-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold truncate flex-shrink">AR Drone Controller v1.3 🚁✨</h1>
          
          {/* Connection Status Indicators and Controls - Mobile optimized */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs hidden sm:inline">Backend</span>
              <span className="text-xs sm:hidden">BE</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isDroneConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-xs hidden sm:inline">Drone</span>
              <span className="text-xs sm:hidden">DR</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isVideoStreamActive ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              <span className="text-xs hidden sm:inline">Video</span>
              <span className="text-xs sm:hidden">VD</span>
            </div>
            
            {/* Full Screen Control - Mobile sized */}
            <FullScreenControl className="ml-1 sm:ml-2" />
          </div>
        </div>
        
        {connectionError && (
          <div className="max-w-7xl mx-auto mt-1 p-1 bg-red-600 rounded text-xs">
            {connectionError}
          </div>
        )}
      </header>

      {/* Main Content - Responsive layout with orientation support */}
      <main className={`flex-1 flex ${isLandscape && isMobile ? 'flex-row' : 'flex-col lg:flex-row'} overflow-hidden min-h-0`}>
        {/* Video Player - Mobile-optimized main view */}
        <div className="flex-1 p-1 sm:p-2 min-w-0 order-1 lg:order-1">
          <VideoPlayer 
            videoData={latestVideoData}
            isStreamActive={isVideoStreamActive}
            className="w-full h-full"
          />
        </div>

        {/* Controls - Responsive based on orientation and device */}
        <aside className={`w-full ${isLandscape && isMobile ? 'w-72 h-auto' : 'h-52 sm:h-60 md:h-64'} lg:w-80 lg:h-auto bg-gray-800 text-white flex flex-col overflow-hidden order-2 lg:order-2`}>
          {/* Mobile-first responsive controls */}
          <div className="flex-1 overflow-y-auto p-1 sm:p-2">
            {/* Compact mobile status bar with touch-friendly sizing */}
            <div className="bg-gray-700 p-2 sm:p-2 rounded-lg mb-1 sm:mb-2 min-h-[44px] flex items-center">
              <div className="flex items-center justify-between text-sm sm:text-sm w-full">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
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
                    <span className="capitalize text-sm sm:text-sm font-medium">{latestTelemetry?.flightState || 'unknown'}</span>
                  </div>
                  <div className="text-blue-400 text-sm sm:text-sm font-medium">
                    ⚡ {latestTelemetry?.batteryPercentage || 0}%
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded min-h-[32px] flex items-center ${keyboardActive ? 'bg-green-600' : 'bg-gray-600'}`}>
                  KB: {keyboardActive ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>

            {/* Flight Controls - Mobile touch-optimized with 44px minimum touch targets */}
            <div className="bg-gray-900 rounded-lg p-2 sm:p-3">
              <div className="flex space-x-2 mb-3">
                <button
                  onClick={() => {
                    const isFlying = latestTelemetry?.flightState === 'flying' || latestTelemetry?.flightState === 'hovering';
                    sendCommand({
                      type: isFlying ? 'LAND' : 'TAKE_OFF',
                      timestamp: Date.now()
                    });
                  }}
                  className="flex-1 min-h-[44px] py-3 px-3 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium touch-manipulation transition-colors duration-150"
                >
                  {latestTelemetry?.flightState === 'flying' || latestTelemetry?.flightState === 'hovering' ? '⬇ Land' : '⬆ Takeoff'}
                </button>
                <button
                  onClick={() => sendCommand({ type: 'EMERGENCY_STOP', timestamp: Date.now() })}
                  className="min-w-[44px] min-h-[44px] px-3 py-3 rounded bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium touch-manipulation transition-colors duration-150"
                >
                  🛑
                </button>
                <button
                  onClick={() => sendCommand({ type: 'SWITCH_CAMERA', timestamp: Date.now() })}
                  className="min-w-[44px] min-h-[44px] px-3 py-3 rounded bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-medium touch-manipulation transition-colors duration-150"
                >
                  📷
                </button>
              </div>
              
              {/* Recovery buttons - Mobile touch-optimized */}
              <div className="flex space-x-2">
                <button
                  onClick={() => sendCommand({ type: 'RESET_EMERGENCY', timestamp: Date.now() })}
                  className="flex-1 min-h-[44px] py-2 px-2 rounded bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-medium touch-manipulation transition-colors duration-150"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={reconnectDrone}
                  className="flex-1 min-h-[44px] py-2 px-2 rounded bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white text-xs font-medium touch-manipulation transition-colors duration-150"
                >
                  🔌 Reconnect
                </button>
              </div>
            </div>

            {/* Virtual Joysticks - Show/hide based on orientation */}
            <div className={`${isLandscape && isMobile ? 'hidden' : 'block lg:hidden'} mt-2`}>
              <div className="bg-gray-900 rounded-lg p-3">
                <h3 className="text-sm font-semibold mb-3 text-center">🕹️ Touch Controls</h3>
                <MovementControls
                  onCommand={sendCommand}
                  disabled={!isDroneConnected}
                  className="h-36 sm:h-40"
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

            {/* Telemetry - Mobile-optimized display */}
            {latestTelemetry && (
              <div className="bg-gray-900 rounded-lg p-2 sm:p-3">
                <h3 className="text-sm font-semibold mb-2">📊 Data</h3>
                
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div className="bg-gray-800 p-2 rounded min-h-[60px] flex flex-col justify-between">
                    <div className="text-gray-400 text-xs sm:text-sm font-medium">Battery</div>
                    <div className="text-base sm:text-lg font-bold text-blue-400">
                      {latestTelemetry.batteryPercentage}%
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
                  
                  <div className="bg-gray-800 p-2 rounded min-h-[60px] flex flex-col justify-between">
                    <div className="text-gray-400 text-xs sm:text-sm font-medium">WiFi</div>
                    <div className="text-base sm:text-lg font-bold text-green-400">
                      {latestTelemetry.wifiSignalStrength}
                    </div>
                  </div>
                </div>
                
                {/* Video Stream Info - Mobile compact */}
                {latestVideoData && (
                  <div className="bg-gray-800 p-2 rounded mt-2">
                    <div className="text-gray-400 text-xs">
                      <span className="hidden sm:inline">Video: Seq {latestVideoData.sequenceNumber} | </span>
                      <span>{Date.now() - latestVideoData.timestamp}ms</span>
                    </div>
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