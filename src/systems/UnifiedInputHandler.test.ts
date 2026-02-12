import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnifiedInputHandler } from './UnifiedInputHandler';

describe('UnifiedInputHandler', () => {
  let inputHandler: UnifiedInputHandler;
  
  beforeEach(() => {
    inputHandler = new UnifiedInputHandler();
    inputHandler.initialize();
  });
  
  afterEach(() => {
    inputHandler.dispose();
  });
  
  describe('Initialization', () => {
    it('should initialize without errors', () => {
      const handler = new UnifiedInputHandler();
      expect(() => handler.initialize()).not.toThrow();
      handler.dispose();
    });
    
    it('should be enabled after initialization', () => {
      expect(inputHandler.isInputEnabled()).toBe(true);
    });
  });
  
  describe('Mouse Input', () => {
    it('should handle mouse click', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      
      const event = new MouseEvent('click', { clientX: 100, clientY: 200 });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should handle mouse down', () => {
      const callback = vi.fn();
      inputHandler.on('mousedown', callback);
      
      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 200 });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should handle mouse up', () => {
      const callback = vi.fn();
      inputHandler.on('mouseup', callback);
      
      const event = new MouseEvent('mouseup', { clientX: 100, clientY: 200 });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should handle mouse move', () => {
      const callback = vi.fn();
      inputHandler.on('mousemove', callback);
      
      const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
  });
  
  describe('Keyboard Input', () => {
    it('should handle key down', () => {
      const callback = vi.fn();
      inputHandler.on('keydown', callback);
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should handle key up', () => {
      const callback = vi.fn();
      inputHandler.on('keyup', callback);
      
      const event = new KeyboardEvent('keyup', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
  });
  
  describe('Touch Input', () => {
    it('should handle touch start', () => {
      const callback = vi.fn();
      inputHandler.on('touchstart', callback);
      
      const event = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 } as Touch],
      });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should handle touch end', () => {
      const callback = vi.fn();
      inputHandler.on('touchend', callback);
      
      const event = new TouchEvent('touchend', { touches: [] });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should handle touch move', () => {
      const callback = vi.fn();
      inputHandler.on('touchmove', callback);
      
      const event = new TouchEvent('touchmove', {
        touches: [{ clientX: 150, clientY: 250 } as Touch],
      });
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
  });
  
  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should remove event listener', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      inputHandler.off('click', callback);
      
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(callback).not.toHaveBeenCalled();
    });
    
    it('should support multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      inputHandler.on('click', callback1);
      inputHandler.on('click', callback2);
      
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });
  
  describe('Input Latency', () => {
    it('should track input latency', () => {
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      const latency = inputHandler.getAverageLatency();
      expect(latency).toBeGreaterThanOrEqual(0);
    });
    
    it('should return 0 latency when no input', () => {
      expect(inputHandler.getAverageLatency()).toBe(0);
      expect(inputHandler.getMaxLatency()).toBe(0);
    });
    
    it('should check if latency is within threshold', () => {
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(inputHandler.isLatencyWithinThreshold()).toBe(true);
    });
    
    it('should track maximum latency', () => {
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      const maxLatency = inputHandler.getMaxLatency();
      expect(maxLatency).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Enable/Disable', () => {
    it('should disable input handling', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      
      inputHandler.disable();
      
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(callback).not.toHaveBeenCalled();
    });
    
    it('should enable input handling', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      
      inputHandler.disable();
      inputHandler.enable();
      
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(callback).toHaveBeenCalled();
    });
    
    it('should report enabled state', () => {
      expect(inputHandler.isInputEnabled()).toBe(true);
      
      inputHandler.disable();
      expect(inputHandler.isInputEnabled()).toBe(false);
      
      inputHandler.enable();
      expect(inputHandler.isInputEnabled()).toBe(true);
    });
  });
  
  describe('Input Conflict Prevention', () => {
    it('should prevent rapid input type switching', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      inputHandler.on('keydown', callback);
      
      // Mouse click
      const mouseEvent = new MouseEvent('click');
      document.dispatchEvent(mouseEvent);
      
      // Immediate keyboard input (should be ignored due to throttle)
      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(keyEvent);
      
      // Should only be called once (mouse event)
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Cleanup', () => {
    it('should remove all event listeners on dispose', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      
      inputHandler.dispose();
      
      const event = new MouseEvent('click');
      document.dispatchEvent(event);
      
      expect(callback).not.toHaveBeenCalled();
    });
    
    it('should clear all listeners on dispose', () => {
      const callback = vi.fn();
      inputHandler.on('click', callback);
      inputHandler.on('keydown', callback);
      
      inputHandler.dispose();
      
      // Try to trigger events
      document.dispatchEvent(new MouseEvent('click'));
      document.dispatchEvent(new KeyboardEvent('keydown'));
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
  
  describe('Configuration', () => {
    it('should accept custom latency threshold', () => {
      const handler = new UnifiedInputHandler({ latencyThreshold: 50 });
      handler.initialize();
      
      expect(handler.isLatencyWithinThreshold()).toBe(true);
      
      handler.dispose();
    });
    
    it('should accept custom throttle delay', () => {
      const handler = new UnifiedInputHandler({ throttleDelay: 32 });
      handler.initialize();
      
      expect(handler.isInputEnabled()).toBe(true);
      
      handler.dispose();
    });
  });
});
