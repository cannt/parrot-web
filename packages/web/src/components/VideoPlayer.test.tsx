import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import VideoPlayer from './VideoPlayer';
import { VideoStreamData } from '../types/types';

// Mock URL methods
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn((callback) => {
    setTimeout(callback, 16); // Simulate ~60fps
    return 1;
  }),
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn(),
  writable: true,
});

// Mock atob function for base64 decoding
Object.defineProperty(window, 'atob', {
  value: vi.fn((_str: string) => 'decoded-binary-data'),
  writable: true,
});

describe('VideoPlayer', () => {
  let mockVideoData: VideoStreamData;

  beforeEach(() => {
    mockVideoData = {
      chunk: Buffer.from('dGVzdCB2aWRlbyBkYXRh'), // 'test video data' in base64
      timestamp: Date.now(),
      sequenceNumber: 1
    };

    mockCreateObjectURL.mockReturnValue('blob:mock-video-url');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('component rendering', () => {
    it('should render with disconnected state by default', () => {
      render(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={false} 
        />
      );

      expect(screen.getByText('Stream Disconnected')).toBeInTheDocument();
      expect(screen.getByText('No Video Stream')).toBeInTheDocument();
      expect(screen.getByText('Waiting for drone connection...')).toBeInTheDocument();
    });

    it('should render connecting state when stream is active but no data', () => {
      render(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={true} 
        />
      );

      expect(screen.getByText('Connecting to Stream...')).toBeInTheDocument();
    });

    it('should render connected state when stream is active with data', () => {
      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      expect(screen.getByText('Live Stream Active')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={false}
          className="custom-class"
        />
      );

      const videoPlayerDiv = container.firstChild as HTMLElement;
      expect(videoPlayerDiv).toHaveClass('custom-class');
    });
  });

  describe('video element', () => {
    it('should render video element with correct attributes', () => {
      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      const videoElement = document.querySelector('video') as HTMLVideoElement;
      expect(videoElement).toBeTruthy();
      expect(videoElement.tagName).toBe('VIDEO');
      expect(videoElement).toHaveAttribute('autoplay');
      expect(videoElement.muted).toBe(true);
      expect(videoElement).toHaveAttribute('playsinline');
      expect(videoElement).not.toHaveAttribute('controls');
    });

    it('should show fallback message for unsupported browsers', () => {
      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      expect(screen.getByText('Your browser does not support the video tag.')).toBeInTheDocument();
    });
  });

  describe('video data processing', () => {
    it('should create object URL when video data is provided', async () => {
      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      // Allow time for useEffect to run
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(window.atob).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });

    it('should revoke previous object URL when new data arrives', async () => {
      const { rerender } = render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      // Allow initial processing
      await new Promise(resolve => setTimeout(resolve, 50));

      const newVideoData = {
        ...mockVideoData,
        sequenceNumber: 2,
        timestamp: Date.now()
      };

      rerender(
        <VideoPlayer 
          videoData={newVideoData} 
          isStreamActive={true} 
        />
      );

      // Allow new processing
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should handle video processing errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock atob to throw error
      (window.atob as any).mockImplementation(() => {
        throw new Error('Invalid base64');
      });

      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalledWith('Error processing video data:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('status indicators', () => {
    it('should show correct status colors for different connection states', () => {
      const { rerender } = render(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={false} 
        />
      );

      // Disconnected state
      expect(screen.getByText('Stream Disconnected')).toHaveClass('text-red-500');

      // Connecting state
      rerender(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={true} 
        />
      );
      expect(screen.getByText('Connecting to Stream...')).toHaveClass('text-yellow-500');

      // Connected state
      rerender(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );
      expect(screen.getByText('Live Stream Active')).toHaveClass('text-green-500');
    });

    it('should display video info when connected', () => {
      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      expect(screen.getByText(`Seq: ${mockVideoData.sequenceNumber}`)).toBeInTheDocument();
      expect(screen.getByText(/Latency: \d+ms/)).toBeInTheDocument();
    });

    it('should not display video info when disconnected', () => {
      render(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={false} 
        />
      );

      expect(screen.queryByText(/Seq:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Latency:/)).not.toBeInTheDocument();
    });
  });

  describe('placeholder states', () => {
    it('should show no stream placeholder when disconnected', () => {
      render(
        <VideoPlayer 
          videoData={null} 
          isStreamActive={false} 
        />
      );

      expect(screen.getByText('No Video Stream')).toBeInTheDocument();
      expect(screen.getByText('Waiting for drone connection...')).toBeInTheDocument();
      
      // Should show camera icon SVG (check by class since JSDOM doesn't assign role to inline SVG)
      const svgElement = document.querySelector('svg.w-8.h-8');
      expect(svgElement).toBeInTheDocument();
    });

    it('should not show placeholder when connected', () => {
      render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      expect(screen.queryByText('No Video Stream')).not.toBeInTheDocument();
      expect(screen.queryByText('Waiting for drone connection...')).not.toBeInTheDocument();
    });
  });

  describe('cleanup', () => {
    it('should revoke object URL on unmount', async () => {
      const { unmount } = render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      // Allow time for useEffect to run and create object URL
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify object URL was created
      expect(mockCreateObjectURL).toHaveBeenCalled();

      unmount();

      // Verify cleanup was called
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should cancel animation frame on unmount', () => {
      const { unmount } = render(
        <VideoPlayer 
          videoData={mockVideoData} 
          isStreamActive={true} 
        />
      );

      unmount();

      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});