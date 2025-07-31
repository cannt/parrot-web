import { VideoStreamProcessor } from './video-stream';
import { VideoStreamData } from './types/types';

describe('VideoStreamProcessor', () => {
  let processor: VideoStreamProcessor;
  let mockVideoData: VideoStreamData;

  beforeEach(() => {
    processor = new VideoStreamProcessor();
    mockVideoData = {
      chunk: Buffer.from('test video data'),
      timestamp: Date.now(),
      sequenceNumber: 1
    };
  });

  afterEach(() => {
    processor.stop();
  });

  describe('initialization', () => {
    it('should initialize with correct default values', () => {
      const status = processor.getBufferStatus();
      expect(status.isProcessing).toBe(false);
      expect(status.size).toBe(0);
      expect(status.maxSize).toBe(5);
      expect(status.frameDropCount).toBe(0);
      expect(status.targetFrameRate).toBe(30);
    });
  });

  describe('start/stop functionality', () => {
    it('should start processing when start() is called', () => {
      processor.start();
      const status = processor.getBufferStatus();
      expect(status.isProcessing).toBe(true);
    });

    it('should stop processing when stop() is called', () => {
      processor.start();
      processor.stop();
      const status = processor.getBufferStatus();
      expect(status.isProcessing).toBe(false);
      expect(status.size).toBe(0);
    });
  });

  describe('video data processing', () => {
    it('should not process video data when stopped', () => {
      const callback = jest.fn();
      processor.onProcessedStream(callback);
      
      processor.processVideoData(mockVideoData);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should process and broadcast video data when started', () => {
      const callback = jest.fn();
      processor.onProcessedStream(callback);
      processor.start();
      
      processor.processVideoData(mockVideoData);
      
      expect(callback).toHaveBeenCalledTimes(1);
      const callbackData = callback.mock.calls[0][0];
      expect(callbackData.sequenceNumber).toBe(mockVideoData.sequenceNumber);
      expect(callbackData.timestamp).toBe(mockVideoData.timestamp);
    });

    it('should convert video chunk to base64 format', () => {
      const callback = jest.fn();
      processor.onProcessedStream(callback);
      processor.start();
      
      processor.processVideoData(mockVideoData);
      
      const callbackData = callback.mock.calls[0][0];
      const base64String = callbackData.chunk.toString();
      const expectedBase64 = mockVideoData.chunk.toString('base64');
      expect(base64String).toBe(expectedBase64);
    });

    it('should maintain buffer size limit', () => {
      processor.start();
      
      // Add more than maxBufferSize (5) items
      for (let i = 0; i < 10; i++) {
        const videoData = {
          ...mockVideoData,
          sequenceNumber: i,
          timestamp: Date.now() + i
        };
        processor.processVideoData(videoData);
      }
      
      const status = processor.getBufferStatus();
      expect(status.size).toBeLessThanOrEqual(status.maxSize);
    });
  });

  describe('callback management', () => {
    it('should allow adding and removing stream callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      processor.onProcessedStream(callback1);
      processor.onProcessedStream(callback2);
      processor.start();
      
      processor.processVideoData(mockVideoData);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      
      processor.offProcessedStream(callback1);
      processor.processVideoData({
        ...mockVideoData,
        sequenceNumber: 2
      });
      
      expect(callback1).toHaveBeenCalledTimes(1); // Should not be called again
      expect(callback2).toHaveBeenCalledTimes(2); // Should be called again
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      processor.onProcessedStream(errorCallback);
      processor.onProcessedStream(normalCallback);
      processor.start();
      
      processor.processVideoData(mockVideoData);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error in video stream callback:', expect.any(Error));
      expect(normalCallback).toHaveBeenCalledTimes(1); // Should still be called
      
      consoleSpy.mockRestore();
    });
  });

  describe('performance optimization', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should drop frames when processing too quickly', () => {
      processor.start();
      processor.setTargetFrameRate(10); // Set low frame rate for testing
      
      const callback = jest.fn();
      processor.onProcessedStream(callback);
      
      // Process frames rapidly
      processor.processVideoData(mockVideoData);
      jest.advanceTimersByTime(10); // Less than frame interval
      processor.processVideoData({
        ...mockVideoData,
        sequenceNumber: 2
      });
      
      const metrics = processor.getPerformanceMetrics();
      expect(metrics.frameDropCount).toBeGreaterThan(0);
    });

    it('should allow frame rate adjustment', () => {
      processor.setTargetFrameRate(60);
      const status = processor.getBufferStatus();
      expect(status.targetFrameRate).toBe(60);
      
      processor.setTargetFrameRate(5); // Below minimum
      expect(processor.getBufferStatus().targetFrameRate).toBe(10); // Should clamp to minimum
      
      processor.setTargetFrameRate(100); // Above maximum
      expect(processor.getBufferStatus().targetFrameRate).toBe(60); // Should clamp to maximum
    });
  });

  describe('buffer management', () => {
    it('should clear buffer and reset performance counters', () => {
      processor.start();
      
      // Add some data and create frame drops
      for (let i = 0; i < 3; i++) {
        processor.processVideoData({
          ...mockVideoData,
          sequenceNumber: i
        });
      }
      
      let status = processor.getBufferStatus();
      expect(status.size).toBeGreaterThan(0);
      
      processor.clearBuffer();
      
      status = processor.getBufferStatus();
      expect(status.size).toBe(0);
      expect(status.frameDropCount).toBe(0);
    });

    it('should provide accurate performance metrics', () => {
      processor.start();
      
      const metrics = processor.getPerformanceMetrics();
      expect(metrics).toHaveProperty('frameDropCount');
      expect(metrics).toHaveProperty('bufferUtilization');
      expect(metrics).toHaveProperty('targetFrameRate');
      
      expect(typeof metrics.frameDropCount).toBe('number');
      expect(typeof metrics.bufferUtilization).toBe('number');
      expect(typeof metrics.targetFrameRate).toBe('number');
    });
  });
});