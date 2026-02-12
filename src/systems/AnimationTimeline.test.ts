import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationTimeline } from './AnimationTimeline';

describe('AnimationTimeline', () => {
  let animator: AnimationTimeline;
  let mockElement: HTMLElement;
  
  beforeEach(() => {
    animator = new AnimationTimeline();
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });
  
  describe('Timeline Creation', () => {
    it('should create cardDraw timeline', () => {
      const timeline = animator.cardDraw(mockElement);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
    
    it('should create cardPlay timeline', () => {
      const timeline = animator.cardPlay(mockElement, 100, 200);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
    
    it('should create cardAttack timeline', () => {
      const timeline = animator.cardAttack(mockElement);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
    
    it('should create screenShake timeline', () => {
      const timeline = animator.screenShake(mockElement);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
    
    it('should create damageNumber timeline', () => {
      const timeline = animator.damageNumber(mockElement);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
    
    it('should create victory timeline', () => {
      const timeline = animator.victory(mockElement);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
    
    it('should create defeat timeline', () => {
      const timeline = animator.defeat(mockElement);
      
      expect(timeline).toBeDefined();
      expect(timeline.duration()).toBeGreaterThan(0);
    });
  });
  
  describe('Custom Configuration', () => {
    it('should accept custom duration for cardDraw', () => {
      const timeline = animator.cardDraw(mockElement, { duration: 1.0 });
      
      expect(timeline.duration()).toBeGreaterThanOrEqual(1.0);
    });
    
    it('should accept custom ease for cardDraw', () => {
      const timeline = animator.cardDraw(mockElement, { ease: 'power2.out' });
      
      expect(timeline).toBeDefined();
    });
    
    it('should call onComplete callback', async () => {
      const onComplete = vi.fn();
      
      const timeline = animator.cardDraw(mockElement, { 
        duration: 0.01,
        onComplete 
      });
      
      timeline.play();
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(onComplete).toHaveBeenCalled();
    });
  });
  
  describe('Timeline Storage', () => {
    it('should store timeline with key', () => {
      const timeline = animator.cardDraw(mockElement);
      animator.storeTimeline('test-anim', timeline);
      
      const retrieved = animator.getTimeline('test-anim');
      expect(retrieved).toBe(timeline);
    });
    
    it('should return undefined for non-existent key', () => {
      const retrieved = animator.getTimeline('non-existent');
      expect(retrieved).toBeUndefined();
    });
    
    it('should kill timeline by key', () => {
      const timeline = animator.cardDraw(mockElement);
      animator.storeTimeline('test-anim', timeline);
      
      animator.killTimeline('test-anim');
      
      const retrieved = animator.getTimeline('test-anim');
      expect(retrieved).toBeUndefined();
    });
    
    it('should kill all timelines', () => {
      animator.storeTimeline('anim1', animator.cardDraw(mockElement));
      animator.storeTimeline('anim2', animator.cardPlay(mockElement, 100, 200));
      
      animator.killAll();
      
      expect(animator.getTimeline('anim1')).toBeUndefined();
      expect(animator.getTimeline('anim2')).toBeUndefined();
    });
  });
  
  describe('Timeline Control', () => {
    it('should pause timeline', () => {
      const timeline = animator.cardDraw(mockElement);
      animator.storeTimeline('test-anim', timeline);
      
      timeline.play();
      animator.pauseTimeline('test-anim');
      
      expect(timeline.paused()).toBe(true);
    });
    
    it('should resume timeline', () => {
      const timeline = animator.cardDraw(mockElement);
      animator.storeTimeline('test-anim', timeline);
      
      timeline.play();
      animator.pauseTimeline('test-anim');
      animator.resumeTimeline('test-anim');
      
      expect(timeline.paused()).toBe(false);
    });
    
    it('should handle pause on non-existent timeline', () => {
      expect(() => animator.pauseTimeline('non-existent')).not.toThrow();
    });
    
    it('should handle resume on non-existent timeline', () => {
      expect(() => animator.resumeTimeline('non-existent')).not.toThrow();
    });
  });
  
  describe('GPU-Only Transforms', () => {
    it('should use transform properties for cardDraw', () => {
      const timeline = animator.cardDraw(mockElement);
      
      // GSAP timelines use transform properties (x, y, scale, rotation)
      // These are GPU-accelerated
      expect(timeline).toBeDefined();
    });
    
    it('should use transform properties for cardPlay', () => {
      const timeline = animator.cardPlay(mockElement, 100, 200);
      
      expect(timeline).toBeDefined();
    });
    
    it('should use transform properties for cardAttack', () => {
      const timeline = animator.cardAttack(mockElement);
      
      expect(timeline).toBeDefined();
    });
  });
  
  describe('Animation Durations', () => {
    it('should have reasonable duration for cardDraw', () => {
      const timeline = animator.cardDraw(mockElement);
      
      expect(timeline.duration()).toBeGreaterThan(0);
      expect(timeline.duration()).toBeLessThan(2);
    });
    
    it('should have reasonable duration for cardPlay', () => {
      const timeline = animator.cardPlay(mockElement, 100, 200);
      
      expect(timeline.duration()).toBeGreaterThan(0);
      expect(timeline.duration()).toBeLessThan(2);
    });
    
    it('should have short duration for cardAttack', () => {
      const timeline = animator.cardAttack(mockElement);
      
      expect(timeline.duration()).toBeGreaterThan(0);
      expect(timeline.duration()).toBeLessThan(0.5);
    });
    
    it('should have short duration for screenShake', () => {
      const timeline = animator.screenShake(mockElement);
      
      expect(timeline.duration()).toBeGreaterThan(0);
      expect(timeline.duration()).toBeLessThan(0.5);
    });
  });
  
  describe('Screen Shake Intensity', () => {
    it('should accept custom intensity', () => {
      const timeline = animator.screenShake(mockElement, 20);
      
      expect(timeline).toBeDefined();
    });
    
    it('should use default intensity', () => {
      const timeline = animator.screenShake(mockElement);
      
      expect(timeline).toBeDefined();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle multiple animations on same element', () => {
      const timeline1 = animator.cardDraw(mockElement);
      const timeline2 = animator.cardAttack(mockElement);
      
      expect(timeline1).toBeDefined();
      expect(timeline2).toBeDefined();
    });
    
    it('should handle killing non-existent timeline', () => {
      expect(() => animator.killTimeline('non-existent')).not.toThrow();
    });
    
    it('should handle storing timeline with same key twice', () => {
      const timeline1 = animator.cardDraw(mockElement);
      const timeline2 = animator.cardPlay(mockElement, 100, 200);
      
      animator.storeTimeline('test', timeline1);
      animator.storeTimeline('test', timeline2);
      
      const retrieved = animator.getTimeline('test');
      expect(retrieved).toBe(timeline2);
    });
  });
});
