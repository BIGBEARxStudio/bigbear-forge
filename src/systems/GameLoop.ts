import type { GameLoopConfig } from '@/types';

/**
 * GameLoop - 60fps RAF-based tick system
 * 
 * Runs independently of React render cycle, calculates delta time,
 * tracks FPS, and emits performance warnings.
 */
export class GameLoop {
  private isRunning: boolean = false;
  private isPausedState: boolean = false;
  private rafId: number | null = null;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private frameTimes: number[] = [];
  private readonly maxFrameSamples: number = 60;
  
  private config: GameLoopConfig;
  
  constructor(config: GameLoopConfig) {
    this.config = config;
  }
  
  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPausedState = false;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }
  
  /**
   * Stop the game loop completely
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.isPausedState = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Reset metrics
    this.frameTimes = [];
    this.frameCount = 0;
  }
  
  /**
   * Pause the game loop (stops updates but maintains state)
   */
  pause(): void {
    if (!this.isRunning || this.isPausedState) return;
    this.isPausedState = true;
  }
  
  /**
   * Resume the game loop from paused state
   */
  resume(): void {
    if (!this.isRunning || !this.isPausedState) return;
    
    this.isPausedState = false;
    // Reset lastTime to prevent large delta time spike
    this.lastTime = performance.now();
  }
  
  /**
   * Check if game loop is paused
   */
  isPaused(): boolean {
    return this.isPausedState;
  }
  
  /**
   * Get current FPS (rolling average over last 60 frames)
   */
  getFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
  }
  
  /**
   * Get current frame time in milliseconds
   */
  getFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return this.frameTimes[this.frameTimes.length - 1];
  }
  
  /**
   * Main tick function (called every frame via RAF)
   */
  private tick = (currentTime: number): void => {
    if (!this.isRunning) return;
    
    // Schedule next frame
    this.rafId = requestAnimationFrame(this.tick);
    
    // Skip updates if paused
    if (this.isPausedState) return;
    
    // Calculate delta time in seconds
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    // Handle edge cases (tab switch, debugger pause)
    const clampedDeltaTime = Math.min(deltaTime, 1.0);
    
    // Track frame time for FPS calculation
    const frameTime = deltaTime * 1000;
    this.frameTimes.push(frameTime);
    
    // Keep only last 60 frames
    if (this.frameTimes.length > this.maxFrameSamples) {
      this.frameTimes.shift();
    }
    
    // Emit performance warning if frame time exceeds threshold
    if (frameTime > this.config.performanceWarningThreshold) {
      this.config.onPerformanceWarning(frameTime);
    }
    
    // Call tick callback with delta time
    this.config.onTick(clampedDeltaTime);
    
    this.frameCount++;
  };
}
