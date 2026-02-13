/**
 * PerformanceMonitor - Tracks frame times and FPS to detect performance issues
 * Provides quality reduction recommendations when performance drops
 */

export interface PerformanceMonitor {
  recordFrameTime(frameTime: number): void;
  getAverageFPS(): number;
  shouldReduceQuality(): boolean;
  reset(): void;
  getFrameTimeStats(): { min: number; max: number; avg: number };
}

export class PerformanceMonitorImpl implements PerformanceMonitor {
  private frameTimes: number[] = [];
  private readonly maxSamples: number;
  private readonly fpsThreshold: number;

  constructor(maxSamples: number = 60, fpsThreshold: number = 55) {
    if (maxSamples <= 0) {
      throw new Error('maxSamples must be positive');
    }
    if (fpsThreshold <= 0) {
      throw new Error('fpsThreshold must be positive');
    }
    this.maxSamples = maxSamples;
    this.fpsThreshold = fpsThreshold;
  }

  recordFrameTime(frameTime: number): void {
    if (frameTime < 0) {
      console.warn('Negative frame time recorded, ignoring');
      return;
    }

    this.frameTimes.push(frameTime);
    
    // Keep only the most recent samples
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  getAverageFPS(): number {
    if (this.frameTimes.length === 0) {
      return 60; // Default to 60 FPS when no data
    }

    const avgFrameTime = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    
    // Avoid division by zero
    if (avgFrameTime === 0) {
      return 60;
    }

    return 1000 / avgFrameTime;
  }

  shouldReduceQuality(): boolean {
    // Need enough samples to make a decision
    if (this.frameTimes.length < this.maxSamples / 2) {
      return false;
    }

    return this.getAverageFPS() < this.fpsThreshold;
  }

  reset(): void {
    this.frameTimes = [];
  }

  getFrameTimeStats(): { min: number; max: number; avg: number } {
    if (this.frameTimes.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const min = Math.min(...this.frameTimes);
    const max = Math.max(...this.frameTimes);
    const avg = this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;

    return { min, max, avg };
  }
}
