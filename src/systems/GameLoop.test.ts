import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from './GameLoop';
import type { GameLoopConfig } from '@/types';

describe('GameLoop', () => {
  let gameLoop: GameLoop;
  let tickCallback: ReturnType<typeof vi.fn>;
  let warningCallback: ReturnType<typeof vi.fn>;
  let config: GameLoopConfig;
  
  beforeEach(() => {
    tickCallback = vi.fn();
    warningCallback = vi.fn();
    
    config = {
      targetFPS: 60,
      performanceWarningThreshold: 16.67,
      onTick: tickCallback,
      onPerformanceWarning: warningCallback,
    };
    
    gameLoop = new GameLoop(config);
  });
  
  afterEach(() => {
    gameLoop.stop();
    vi.clearAllMocks();
  });
  
  describe('Property 1: Delta time is always positive and reasonable', () => {
    it('should produce positive delta times between consecutive frames', () => {
      const deltaTimesSeen: number[] = [];
      
      const testConfig: GameLoopConfig = {
        ...config,
        onTick: (dt) => {
          deltaTimesSeen.push(dt);
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      testLoop.start();
      
      // Simulate several frames with realistic timing
      // Note: First tick will have deltaTime of 0 since lastTime is set in start()
      let time = performance.now();
      (testLoop as any).tick(time);
      (testLoop as any).tick(time + 16);
      (testLoop as any).tick(time + 33);
      (testLoop as any).tick(time + 50);
      
      testLoop.stop();
      
      // Should have captured delta times
      expect(deltaTimesSeen.length).toBeGreaterThan(0);
      
      // Skip first delta (which is 0) and check remaining deltas
      const subsequentDeltas = deltaTimesSeen.slice(1);
      
      // All subsequent delta times should be positive
      expect(subsequentDeltas.every((dt) => dt > 0)).toBe(true);
      
      // All delta times should be reasonable (< 1 second)
      expect(deltaTimesSeen.every((dt) => dt <= 1.0)).toBe(true);
    });
    
    it('should clamp large delta times to 1 second', () => {
      const deltaTimesSeen: number[] = [];
      
      const testConfig: GameLoopConfig = {
        ...config,
        onTick: (dt) => {
          deltaTimesSeen.push(dt);
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      testLoop.start();
      
      // Simulate tab switch (5 second gap)
      (testLoop as any).tick(0);
      (testLoop as any).tick(5000);
      
      testLoop.stop();
      
      // Delta time should be clamped to 1.0 second
      expect(deltaTimesSeen[deltaTimesSeen.length - 1]).toBeLessThanOrEqual(1.0);
    });
  });
  
  describe('Property 2: Pause-resume is idempotent', () => {
    it('should have same effect when pausing multiple times', () => {
      const testLoop = new GameLoop(config);
      testLoop.start();
      
      // Pause multiple times
      testLoop.pause();
      testLoop.pause();
      testLoop.pause();
      
      expect(testLoop.isPaused()).toBe(true);
      
      testLoop.stop();
    });
    
    it('should not execute updates while paused', () => {
      let tickCount = 0;
      
      const testConfig: GameLoopConfig = {
        ...config,
        onTick: () => {
          tickCount++;
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      testLoop.start();
      
      // Let it run for a few frames
      (testLoop as any).tick(0);
      (testLoop as any).tick(16);
      
      const ticksBeforePause = tickCount;
      
      // Pause and try to tick
      testLoop.pause();
      (testLoop as any).tick(32);
      (testLoop as any).tick(48);
      
      const ticksAfterPause = tickCount;
      
      testLoop.stop();
      
      // Tick count should not increase while paused
      expect(ticksAfterPause).toBe(ticksBeforePause);
    });
  });
  
  describe('Property 3: Pause-resume round trip', () => {
    it('should restore running state after pause-resume cycle', () => {
      let tickCount = 0;
      
      const testConfig: GameLoopConfig = {
        ...config,
        onTick: () => {
          tickCount++;
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      testLoop.start();
      
      // Perform pause-resume cycles
      testLoop.pause();
      expect(testLoop.isPaused()).toBe(true);
      
      testLoop.resume();
      expect(testLoop.isPaused()).toBe(false);
      
      testLoop.pause();
      expect(testLoop.isPaused()).toBe(true);
      
      testLoop.resume();
      expect(testLoop.isPaused()).toBe(false);
      
      // After cycles, should still be running
      const wasRunningBefore = tickCount;
      (testLoop as any).tick(performance.now());
      const isRunningAfter = tickCount > wasRunningBefore;
      
      expect(isRunningAfter).toBe(true);
      
      testLoop.stop();
    });
  });
  
  describe('Property 4: Performance metrics are non-negative', () => {
    it('should always return non-negative FPS and frame time values', () => {
      const testLoop = new GameLoop(config);
      testLoop.start();
      
      // Simulate several frames
      (testLoop as any).tick(0);
      (testLoop as any).tick(16);
      (testLoop as any).tick(33);
      (testLoop as any).tick(50);
      (testLoop as any).tick(67);
      
      const fps = testLoop.getFPS();
      const frameTime = testLoop.getFrameTime();
      
      testLoop.stop();
      
      // Both metrics should be non-negative
      expect(fps).toBeGreaterThanOrEqual(0);
      expect(frameTime).toBeGreaterThanOrEqual(0);
    });
    
    it('should return 0 for FPS and frame time when no frames have been processed', () => {
      const testLoop = new GameLoop(config);
      
      expect(testLoop.getFPS()).toBe(0);
      expect(testLoop.getFrameTime()).toBe(0);
    });
  });
  
  describe('Edge Cases', () => {
    it('should emit performance warning when frame time exceeds threshold', () => {
      const warnings: number[] = [];
      
      const testConfig: GameLoopConfig = {
        ...config,
        performanceWarningThreshold: 16.67,
        onPerformanceWarning: (frameTime) => {
          warnings.push(frameTime);
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      testLoop.start();
      
      // Simulate slow frame (50ms)
      (testLoop as any).tick(0);
      (testLoop as any).tick(50);
      
      testLoop.stop();
      
      // Should have emitted warning
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toBeGreaterThan(16.67);
    });
    
    it('should handle tab switch scenario with large delta time', () => {
      const deltaTimesSeen: number[] = [];
      
      const testConfig: GameLoopConfig = {
        ...config,
        onTick: (dt) => {
          deltaTimesSeen.push(dt);
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      testLoop.start();
      
      // Normal frame
      (testLoop as any).tick(0);
      (testLoop as any).tick(16);
      
      // Tab switch (10 second gap)
      (testLoop as any).tick(10016);
      
      testLoop.stop();
      
      // Large delta should be clamped to 1.0 second
      const lastDelta = deltaTimesSeen[deltaTimesSeen.length - 1];
      expect(lastDelta).toBeLessThanOrEqual(1.0);
    });
    
    it('should not start if already running', () => {
      const testLoop = new GameLoop(config);
      
      testLoop.start();
      const rafIdAfterFirstStart = (testLoop as any).rafId;
      
      testLoop.start(); // Try to start again
      const rafIdAfterSecondStart = (testLoop as any).rafId;
      
      testLoop.stop();
      
      // RAF ID should not change (didn't restart)
      expect(rafIdAfterFirstStart).toBe(rafIdAfterSecondStart);
    });
    
    it('should reset metrics when stopped', () => {
      const testLoop = new GameLoop(config);
      testLoop.start();
      
      // Run some frames
      (testLoop as any).tick(0);
      (testLoop as any).tick(16);
      (testLoop as any).tick(32);
      
      testLoop.stop();
      
      // Metrics should be reset
      expect(testLoop.getFPS()).toBe(0);
      expect(testLoop.getFrameTime()).toBe(0);
    });
  });
});
