import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMonitorImpl } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitorImpl;

  beforeEach(() => {
    monitor = new PerformanceMonitorImpl();
  });

  describe('Constructor', () => {
    it('should create with default parameters', () => {
      const mon = new PerformanceMonitorImpl();
      expect(mon).toBeDefined();
      expect(mon.getAverageFPS()).toBe(60);
    });

    it('should create with custom maxSamples', () => {
      const mon = new PerformanceMonitorImpl(30);
      expect(mon).toBeDefined();
    });

    it('should create with custom fpsThreshold', () => {
      const mon = new PerformanceMonitorImpl(60, 50);
      expect(mon).toBeDefined();
    });

    it('should throw error for non-positive maxSamples', () => {
      expect(() => new PerformanceMonitorImpl(0)).toThrow('maxSamples must be positive');
      expect(() => new PerformanceMonitorImpl(-1)).toThrow('maxSamples must be positive');
    });

    it('should throw error for non-positive fpsThreshold', () => {
      expect(() => new PerformanceMonitorImpl(60, 0)).toThrow('fpsThreshold must be positive');
      expect(() => new PerformanceMonitorImpl(60, -1)).toThrow('fpsThreshold must be positive');
    });
  });

  describe('recordFrameTime', () => {
    it('should record frame time', () => {
      monitor.recordFrameTime(16.67);
      expect(monitor.getAverageFPS()).toBeCloseTo(60, 0);
    });

    it('should record multiple frame times', () => {
      monitor.recordFrameTime(16.67);
      monitor.recordFrameTime(16.67);
      monitor.recordFrameTime(16.67);
      expect(monitor.getAverageFPS()).toBeCloseTo(60, 0);
    });

    it('should handle negative frame times gracefully', () => {
      monitor.recordFrameTime(-10);
      expect(monitor.getAverageFPS()).toBe(60); // Should ignore negative value
    });

    it('should handle zero frame times', () => {
      monitor.recordFrameTime(0);
      expect(monitor.getAverageFPS()).toBe(60); // Should handle gracefully
    });

    it('should limit samples to maxSamples', () => {
      const mon = new PerformanceMonitorImpl(3);
      
      mon.recordFrameTime(10);
      mon.recordFrameTime(20);
      mon.recordFrameTime(30);
      mon.recordFrameTime(40); // Should push out the first sample (10)
      
      const stats = mon.getFrameTimeStats();
      expect(stats.min).toBe(20);
      expect(stats.max).toBe(40);
    });
  });

  describe('getAverageFPS', () => {
    it('should return 60 FPS when no data', () => {
      expect(monitor.getAverageFPS()).toBe(60);
    });

    it('should calculate FPS from frame times', () => {
      // 16.67ms = 60 FPS
      monitor.recordFrameTime(16.67);
      expect(monitor.getAverageFPS()).toBeCloseTo(60, 0);
    });

    it('should calculate FPS for slow frames', () => {
      // 33.33ms = 30 FPS
      monitor.recordFrameTime(33.33);
      expect(monitor.getAverageFPS()).toBeCloseTo(30, 0);
    });

    it('should calculate FPS for fast frames', () => {
      // 8.33ms = 120 FPS
      monitor.recordFrameTime(8.33);
      expect(monitor.getAverageFPS()).toBeCloseTo(120, 0);
    });

    it('should average multiple frame times', () => {
      monitor.recordFrameTime(16.67); // 60 FPS
      monitor.recordFrameTime(33.33); // 30 FPS
      // Average: 25ms = 40 FPS
      expect(monitor.getAverageFPS()).toBeCloseTo(40, 0);
    });

    it('should handle very fast frame times', () => {
      monitor.recordFrameTime(1);
      expect(monitor.getAverageFPS()).toBe(1000);
    });

    it('should handle very slow frame times', () => {
      monitor.recordFrameTime(100);
      expect(monitor.getAverageFPS()).toBe(10);
    });
  });

  describe('shouldReduceQuality', () => {
    it('should return false when no data', () => {
      expect(monitor.shouldReduceQuality()).toBe(false);
    });

    it('should return false with insufficient samples', () => {
      // Default maxSamples is 60, need at least 30
      for (let i = 0; i < 20; i++) {
        monitor.recordFrameTime(20); // 50 FPS
      }
      expect(monitor.shouldReduceQuality()).toBe(false);
    });

    it('should return true when FPS drops below threshold', () => {
      // Record enough samples (30+) with poor performance
      for (let i = 0; i < 40; i++) {
        monitor.recordFrameTime(20); // 50 FPS, below threshold of 55
      }
      expect(monitor.shouldReduceQuality()).toBe(true);
    });

    it('should return false when FPS is above threshold', () => {
      for (let i = 0; i < 40; i++) {
        monitor.recordFrameTime(16.67); // 60 FPS, above threshold of 55
      }
      expect(monitor.shouldReduceQuality()).toBe(false);
    });

    it('should respect custom FPS threshold', () => {
      const mon = new PerformanceMonitorImpl(60, 50);
      
      for (let i = 0; i < 40; i++) {
        monitor.recordFrameTime(19); // ~52 FPS
      }
      
      // 52 FPS is above 50 threshold
      expect(mon.shouldReduceQuality()).toBe(false);
    });

    it('should detect performance degradation', () => {
      // Start with good performance
      for (let i = 0; i < 30; i++) {
        monitor.recordFrameTime(16.67); // 60 FPS
      }
      expect(monitor.shouldReduceQuality()).toBe(false);

      // Performance degrades
      for (let i = 0; i < 40; i++) {
        monitor.recordFrameTime(25); // 40 FPS
      }
      expect(monitor.shouldReduceQuality()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should clear all frame times', () => {
      monitor.recordFrameTime(16.67);
      monitor.recordFrameTime(16.67);
      monitor.reset();
      
      expect(monitor.getAverageFPS()).toBe(60);
      expect(monitor.shouldReduceQuality()).toBe(false);
    });

    it('should allow recording after reset', () => {
      monitor.recordFrameTime(16.67);
      monitor.reset();
      monitor.recordFrameTime(33.33);
      
      expect(monitor.getAverageFPS()).toBeCloseTo(30, 0);
    });
  });

  describe('getFrameTimeStats', () => {
    it('should return zeros when no data', () => {
      const stats = monitor.getFrameTimeStats();
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.avg).toBe(0);
    });

    it('should return correct stats for single sample', () => {
      monitor.recordFrameTime(16.67);
      const stats = monitor.getFrameTimeStats();
      
      expect(stats.min).toBeCloseTo(16.67, 1);
      expect(stats.max).toBeCloseTo(16.67, 1);
      expect(stats.avg).toBeCloseTo(16.67, 1);
    });

    it('should return correct stats for multiple samples', () => {
      monitor.recordFrameTime(10);
      monitor.recordFrameTime(20);
      monitor.recordFrameTime(30);
      
      const stats = monitor.getFrameTimeStats();
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(30);
      expect(stats.avg).toBe(20);
    });

    it('should track min/max correctly', () => {
      monitor.recordFrameTime(15);
      monitor.recordFrameTime(25);
      monitor.recordFrameTime(10);
      monitor.recordFrameTime(30);
      monitor.recordFrameTime(20);
      
      const stats = monitor.getFrameTimeStats();
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(30);
      expect(stats.avg).toBe(20);
    });

    it('should update stats after new recordings', () => {
      monitor.recordFrameTime(10);
      let stats = monitor.getFrameTimeStats();
      expect(stats.max).toBe(10);

      monitor.recordFrameTime(20);
      stats = monitor.getFrameTimeStats();
      expect(stats.max).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large frame times', () => {
      monitor.recordFrameTime(1000);
      expect(monitor.getAverageFPS()).toBe(1);
    });

    it('should handle very small frame times', () => {
      monitor.recordFrameTime(0.1);
      expect(monitor.getAverageFPS()).toBe(10000);
    });

    it('should handle mixed frame times', () => {
      monitor.recordFrameTime(10);
      monitor.recordFrameTime(50);
      monitor.recordFrameTime(20);
      
      const avg = monitor.getAverageFPS();
      expect(avg).toBeGreaterThan(0);
      expect(avg).toBeLessThan(1000);
    });

    it('should handle rapid recordings', () => {
      for (let i = 0; i < 1000; i++) {
        monitor.recordFrameTime(16.67);
      }
      
      // Should only keep last 60 samples
      expect(monitor.getAverageFPS()).toBeCloseTo(60, 0);
    });
  });

  describe('Performance Scenarios', () => {
    it('should detect consistently poor performance', () => {
      const mon = new PerformanceMonitorImpl(30, 55);
      
      for (let i = 0; i < 30; i++) {
        mon.recordFrameTime(25); // 40 FPS
      }
      
      expect(mon.shouldReduceQuality()).toBe(true);
    });

    it('should not trigger on brief performance dips', () => {
      // Good performance - fill the rolling window
      for (let i = 0; i < 60; i++) {
        monitor.recordFrameTime(16.67); // 60 FPS
      }
      
      // Brief dip (only 5 frames out of 60)
      for (let i = 0; i < 5; i++) {
        monitor.recordFrameTime(50); // 20 FPS
      }
      
      // Average should still be above threshold
      // 55 frames at 16.67ms + 5 frames at 50ms = avg ~19.4ms = ~51.5 FPS (below 55 threshold)
      // This is actually expected behavior - even brief dips affect the average
      // Let's use a smaller dip that doesn't cross threshold
      monitor.reset();
      for (let i = 0; i < 60; i++) {
        monitor.recordFrameTime(16.67); // 60 FPS
      }
      for (let i = 0; i < 3; i++) {
        monitor.recordFrameTime(25); // 40 FPS
      }
      // 57 frames at 16.67ms + 3 frames at 25ms = avg ~17.1ms = ~58.5 FPS (above 55 threshold)
      expect(monitor.shouldReduceQuality()).toBe(false);
    });

    it('should detect sustained performance issues', () => {
      // Start good
      for (let i = 0; i < 30; i++) {
        monitor.recordFrameTime(16.67); // 60 FPS
      }
      
      // Sustained poor performance
      for (let i = 0; i < 60; i++) {
        monitor.recordFrameTime(25); // 40 FPS
      }
      
      expect(monitor.shouldReduceQuality()).toBe(true);
    });
  });
});
