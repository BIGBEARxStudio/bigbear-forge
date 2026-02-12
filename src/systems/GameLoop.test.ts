import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fc } from 'fast-check';
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
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 10 }),
          (frameDelays) => {
            const deltaTimesSeen: number[] = [];
            
            const testConfig: GameLoopConfig = {
              ...config,
              onTick: (dt) => {
                deltaTimesSeen.push(dt);
              },
            };
            
            const testLoop = new GameLoop(testConfig);
            
            // Simulate frames with controlled timing
            let currentTime = 0;
            testLoop.start();
            
            frameDelays.forEach((delay) => {
              currentTime += delay;
              // Manually trigger tick with controlled time
              (testLoop as any).tick(currentTime);
            });
            
            testLoop.stop();
            
            // All delta times should be positive
            const allPositive = deltaTimesSeen.every((dt) => dt > 0);
            
            // All delta times should be reasonable (< 1 second after clamping)
            const allReasonable = deltaTimesSeen.every((dt) => dt <= 1.0);
            
            return allPositive && allReasonable;
          }
        ),
        { numRuns: 100 }
      );
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
});

  describe('Property 2: Pause-resume is idempotent', () => {
    it('should have same effect when pausing multiple times', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          (pauseCount) => {
            const testLoop = new GameLoop(config);
            testLoop.start();
            
            // Pause multiple times
            for (let i = 0; i < pauseCount; i++) {
              testLoop.pause();
            }
            
            const isPausedAfterMultiple = testLoop.isPaused();
            
            testLoop.stop();
            
            // Create new loop and pause once
            const testLoop2 = new GameLoop(config);
            testLoop2.start();
            testLoop2.pause();
            
            const isPausedAfterSingle = testLoop2.isPaused();
            
            testLoop2.stop();
            
            // Both should be paused
            return isPausedAfterMultiple === isPausedAfterSingle && isPausedAfterMultiple === true;
          }
        ),
        { numRuns: 50 }
      );
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
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (cycleCount) => {
            let tickCount = 0;
            
            const testConfig: GameLoopConfig = {
              ...config,
              onTick: () => {
                tickCount++;
              },
            };
            
            const testLoop = new GameLoop(testConfig);
            testLoop.start();
            
            // Perform multiple pause-resume cycles
            for (let i = 0; i < cycleCount; i++) {
              testLoop.pause();
              expect(testLoop.isPaused()).toBe(true);
              
              testLoop.resume();
              expect(testLoop.isPaused()).toBe(false);
            }
            
            // After cycles, should still be running
            const wasRunningBefore = tickCount;
            (testLoop as any).tick(performance.now());
            const isRunningAfter = tickCount > wasRunningBefore;
            
            testLoop.stop();
            
            return isRunningAfter;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 4: Performance metrics are non-negative', () => {
    it('should always return non-negative FPS and frame time values', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 5, maxLength: 100 }),
          (frameDelays) => {
            const testLoop = new GameLoop(config);
            testLoop.start();
            
            let currentTime = 0;
            
            // Simulate frames
            frameDelays.forEach((delay) => {
              currentTime += delay;
              (testLoop as any).tick(currentTime);
            });
            
            const fps = testLoop.getFPS();
            const frameTime = testLoop.getFrameTime();
            
            testLoop.stop();
            
            // Both metrics should be non-negative
            return fps >= 0 && frameTime >= 0;
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should return 0 for FPS and frame time when no frames have been processed', () => {
      const testLoop = new GameLoop(config);
      
      expect(testLoop.getFPS()).toBe(0);
      expect(testLoop.getFrameTime()).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle RAF fallback to setTimeout gracefully', () => {
      // Save original RAF
      const originalRAF = global.requestAnimationFrame;
      const originalCAF = global.cancelAnimationFrame;
      
      // Mock RAF as undefined (simulate old browser)
      (global as any).requestAnimationFrame = undefined;
      (global as any).cancelAnimationFrame = undefined;
      
      let tickCount = 0;
      const testConfig: GameLoopConfig = {
        ...config,
        onTick: () => {
          tickCount++;
        },
      };
      
      const testLoop = new GameLoop(testConfig);
      
      // Should not throw even without RAF
      expect(() => testLoop.start()).not.toThrow();
      
      testLoop.stop();
      
      // Restore RAF
      global.requestAnimationFrame = originalRAF;
      global.cancelAnimationFrame = originalCAF;
    });
    
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
