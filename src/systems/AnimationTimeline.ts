/**
 * Animation Timeline System
 * 
 * Handles all game animations using GSAP with GPU-accelerated transforms.
 * All animations use transform/opacity only for 60fps performance.
 */

import gsap from 'gsap';

export interface AnimationConfig {
  duration?: number;
  ease?: string;
  onComplete?: () => void;
}

/**
 * AnimationTimeline - GSAP-based animation system
 */
export class AnimationTimeline {
  private timelines: Map<string, gsap.core.Timeline>;
  
  constructor() {
    this.timelines = new Map();
  }
  
  /**
   * Card draw animation - slide in with overshoot
   */
  cardDraw(element: HTMLElement, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .set(element, {
        opacity: 0,
        y: 100,
        scale: 0.8,
      })
      .to(element, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: config?.duration ?? 0.5,
        ease: config?.ease ?? 'back.out(1.7)',
      });
    
    return timeline;
  }
  
  /**
   * Card play animation - arc motion to battlefield
   */
  cardPlay(element: HTMLElement, targetX: number, targetY: number, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .to(element, {
        x: targetX / 2,
        y: targetY - 100, // Arc peak
        duration: (config?.duration ?? 0.6) / 2,
        ease: 'power2.out',
      })
      .to(element, {
        x: targetX,
        y: targetY,
        duration: (config?.duration ?? 0.6) / 2,
        ease: 'power2.in',
      }, '-=0.1');
    
    return timeline;
  }
  
  /**
   * Card attack animation - lunge forward
   */
  cardAttack(element: HTMLElement, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .to(element, {
        x: 50,
        scale: 1.1,
        duration: 0.15,
        ease: 'power2.out',
      })
      .to(element, {
        x: 0,
        scale: 1,
        duration: 0.15,
        ease: 'power2.in',
      });
    
    return timeline;
  }
  
  /**
   * Screen shake animation
   */
  screenShake(element: HTMLElement, intensity: number = 10, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .to(element, {
        x: intensity,
        duration: 0.05,
        ease: 'power2.inOut',
      })
      .to(element, {
        x: -intensity,
        duration: 0.05,
        ease: 'power2.inOut',
      })
      .to(element, {
        x: intensity / 2,
        duration: 0.05,
        ease: 'power2.inOut',
      })
      .to(element, {
        x: 0,
        duration: 0.05,
        ease: 'power2.inOut',
      });
    
    return timeline;
  }
  
  /**
   * Damage number animation - pop up and fade
   */
  damageNumber(element: HTMLElement, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .set(element, {
        opacity: 0,
        y: 0,
        scale: 0.5,
      })
      .to(element, {
        opacity: 1,
        y: -50,
        scale: 1.5,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(element, {
        opacity: 0,
        y: -100,
        duration: 0.3,
        ease: 'power2.in',
      });
    
    return timeline;
  }
  
  /**
   * Victory animation - confetti effect
   */
  victory(element: HTMLElement, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .set(element, {
        opacity: 0,
        scale: 0.5,
        rotation: -10,
      })
      .to(element, {
        opacity: 1,
        scale: 1.2,
        rotation: 10,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      })
      .to(element, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    
    return timeline;
  }
  
  /**
   * Defeat animation - desaturate and fade
   */
  defeat(element: HTMLElement, config?: AnimationConfig): gsap.core.Timeline {
    const timeline = gsap.timeline({
      onComplete: config?.onComplete,
    });
    
    timeline
      .to(element, {
        opacity: 0.5,
        scale: 0.9,
        duration: config?.duration ?? 1.0,
        ease: config?.ease ?? 'power2.out',
      });
    
    return timeline;
  }
  
  /**
   * Store a timeline with a key for later reference
   */
  storeTimeline(key: string, timeline: gsap.core.Timeline): void {
    this.timelines.set(key, timeline);
  }
  
  /**
   * Get a stored timeline by key
   */
  getTimeline(key: string): gsap.core.Timeline | undefined {
    return this.timelines.get(key);
  }
  
  /**
   * Kill a timeline by key
   */
  killTimeline(key: string): void {
    const timeline = this.timelines.get(key);
    if (timeline) {
      timeline.kill();
      this.timelines.delete(key);
    }
  }
  
  /**
   * Kill all timelines
   */
  killAll(): void {
    this.timelines.forEach(timeline => timeline.kill());
    this.timelines.clear();
  }
  
  /**
   * Pause a timeline by key
   */
  pauseTimeline(key: string): void {
    const timeline = this.timelines.get(key);
    if (timeline) {
      timeline.pause();
    }
  }
  
  /**
   * Resume a timeline by key
   */
  resumeTimeline(key: string): void {
    const timeline = this.timelines.get(key);
    if (timeline) {
      timeline.resume();
    }
  }
}
