import React, { useRef, useEffect, useState } from 'react';
import { VideoStreamData } from '../types/types';

interface VideoPlayerProps {
  videoData: VideoStreamData | null;
  isStreamActive: boolean;
  className?: string;
}

/**
 * VideoPlayer component for displaying live drone video stream
 * Handles PNG image frames from AR.Drone WebSocket stream
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoData,
  isStreamActive,
  className = ''
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [, setLastFrameTime] = useState<number>(0);

  // Update connection status based on stream activity
  useEffect(() => {
    if (isStreamActive && videoData) {
      setConnectionStatus('connected');
      setLastFrameTime(Date.now());
    } else if (isStreamActive) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isStreamActive, videoData]);

  // Process incoming video data (PNG frames from AR.Drone) with throttling
  useEffect(() => {
    if (!videoData || !imgRef.current) return;

    // Throttle to max 10 FPS to reduce CPU load
    const now = Date.now();
    const lastUpdate = imgRef.current.getAttribute('data-last-update');
    const timeSinceLastUpdate = now - (lastUpdate ? parseInt(lastUpdate) : 0);
    
    if (timeSinceLastUpdate < 100) { // 100ms = 10 FPS max
      return;
    }

    // Process frame with reduced logging
    const processVideoFrame = () => {
      try {
        const base64Data = videoData.chunk.toString();
        const dataUrl = `data:image/png;base64,${base64Data}`;
        
        if (imgRef.current) {
          imgRef.current.src = dataUrl;
          imgRef.current.setAttribute('data-last-update', now.toString());
          
          // Log only every 30 frames to reduce console spam (development only)
          if (process.env.NODE_ENV === 'development' && videoData.sequenceNumber % 30 === 0) {
            console.log(`Video frame ${videoData.sequenceNumber}, size: ${base64Data.length} chars`);
          }
        }

      } catch (error) {
        console.error('Error processing video data:', error);
      }
    };

    // Use setTimeout instead of requestAnimationFrame for better control
    const timeoutId = setTimeout(processVideoFrame, 0);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [videoData?.sequenceNumber]); // Only re-run when sequence number changes

  // Connection status indicator styling
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Live Stream Active';
      case 'connecting': return 'Connecting to Stream...';
      case 'disconnected': return 'Stream Disconnected';
      default: return 'Unknown Status';
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Image Element for PNG frames - Mobile optimized */}
      <img
        ref={imgRef}
        className="w-full h-full object-cover touch-manipulation"
        alt="Drone video stream"
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFZpZGVvPC90ZXh0Pjwvc3ZnPg=="
      />

      {/* Status Overlay - Mobile responsive */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
        <div className="flex items-center space-x-2 bg-black bg-opacity-70 rounded-lg px-2 py-1 sm:px-3 sm:py-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`} />
          <span className={`text-xs sm:text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Video Info Overlay (when connected) - Mobile responsive */}
      {connectionStatus === 'connected' && videoData && (
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
          <div className="bg-black bg-opacity-70 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-white text-xs">
            <div className="hidden sm:block">Seq: {videoData.sequenceNumber}</div>
            <div>Latency: {Date.now() - videoData.timestamp}ms</div>
          </div>
        </div>
      )}

      {/* No Stream Placeholder - Mobile optimized */}
      {connectionStatus === 'disconnected' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-gray-400 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4l2-2v6l-2-2v4H7V3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-base sm:text-lg font-medium">No Video Stream</p>
            <p className="text-xs sm:text-sm">Waiting for drone connection...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;