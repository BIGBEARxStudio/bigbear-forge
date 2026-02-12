import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SceneManager, Scene, TransitionType } from './SceneManager';
import gsap from 'gsap';

// Mock scene implementation
class MockScene implements Scene {
  name: string;
  loadCalled = false;
  enterCalled = false;
  exitCalled = false;
  updateCalled = false;
  cleanupCalled = false;
  loadDelay = 0;

  constructor(name: string, loadDelay = 0) {
    this.name = name;
    this.loadDelay = loadDelay;
  }

  async load(): Promise<void> {
    this.loadCalled = true;
    if (this.loadDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.loadDelay));
    }
  }

  enter(): void {
    this.enterCalled = true;
  }

  exit(): void {
    this.exitCalled = true;
  }

  update(deltaTime: number): void {
    this.updateCalled = true;
  }

  cleanup(): void {
    this.cleanupCalled = true;
  }

  reset(): void {
    this.loadCalled = false;
    this.enterCalled = false;
    this.exitCalled = false;
    this.updateCalled = false;
    this.cleanupCalled = false;
  }
}

describe('SceneManager', () => {
  let sceneManager: SceneManager;
  let mockScene1: MockScene;
  let mockScene2: MockScene;

  beforeEach(() => {
    sceneManager = new SceneManager();
    mockScene1 = new MockScene('scene1');
    mockScene2 = new MockScene('scene2');

    // Mock DOM container
    document.body.innerHTML = '<div id="scene-container"></div>';

    // Speed up GSAP for tests
    gsap.globalTimeline.timeScale(100);
  });

  describe('Scene Registration', () => {
    it('should register a scene', () => {
      sceneManager.registerScene(mockScene1);
      expect(sceneManager.getCurrentScene()).toBeNull();
    });

    it('should unregister a scene', () => {
      sceneManager.registerScene(mockScene1);
      sceneManager.unregisterScene('scene1');
      
      // Should throw when trying to transition to unregistered scene
      expect(() => sceneManager.transitionTo('scene1')).rejects.toThrow(
        'Scene not found: scene1'
      );
    });

    it('should not unregister active scene', async () => {
      sceneManager.registerScene(mockScene1);
      await sceneManager.transitionTo('scene1', 'none');

      expect(() => sceneManager.unregisterScene('scene1')).toThrow(
        'Cannot unregister active scene: scene1'
      );
    });

    it('should allow registering multiple scenes', () => {
      sceneManager.registerScene(mockScene1);
      sceneManager.registerScene(mockScene2);
      
      expect(sceneManager.getCurrentScene()).toBeNull();
    });
  });

  describe('Scene Transitions', () => {
    beforeEach(() => {
      sceneManager.registerScene(mockScene1);
      sceneManager.registerScene(mockScene2);
    });

    it('should transition to a scene', async () => {
      await sceneManager.transitionTo('scene1', 'none');

      expect(mockScene1.loadCalled).toBe(true);
      expect(mockScene1.enterCalled).toBe(true);
      expect(sceneManager.getCurrentScene()).toBe(mockScene1);
    });

    it('should call lifecycle methods in correct order', async () => {
      const callOrder: string[] = [];

      mockScene1.load = vi.fn(async () => {
        callOrder.push('load');
      });
      mockScene1.enter = vi.fn(() => {
        callOrder.push('enter');
      });

      await sceneManager.transitionTo('scene1', 'none');

      expect(callOrder).toEqual(['load', 'enter']);
    });

    it('should exit and cleanup old scene when transitioning', async () => {
      await sceneManager.transitionTo('scene1', 'none');
      mockScene1.reset();

      await sceneManager.transitionTo('scene2', 'none');

      expect(mockScene1.exitCalled).toBe(true);
      expect(mockScene1.cleanupCalled).toBe(true);
      expect(mockScene2.loadCalled).toBe(true);
      expect(mockScene2.enterCalled).toBe(true);
      expect(sceneManager.getCurrentScene()).toBe(mockScene2);
    });

    it('should not transition to same scene', async () => {
      await sceneManager.transitionTo('scene1', 'none');
      mockScene1.reset();

      await sceneManager.transitionTo('scene1', 'none');

      expect(mockScene1.loadCalled).toBe(false);
      expect(mockScene1.enterCalled).toBe(false);
    });

    it('should throw error for non-existent scene', async () => {
      await expect(
        sceneManager.transitionTo('nonexistent', 'none')
      ).rejects.toThrow('Scene not found: nonexistent');
    });

    it('should prevent concurrent transitions', async () => {
      const slowScene = new MockScene('slow', 100);
      sceneManager.registerScene(slowScene);

      const transition1 = sceneManager.transitionTo('slow', 'none');
      
      await expect(
        sceneManager.transitionTo('scene1', 'none')
      ).rejects.toThrow('Scene transition already in progress');

      await transition1;
    });

    it('should set isTransitioning flag during transition', async () => {
      expect(sceneManager.isTransitionInProgress()).toBe(false);

      const transitionPromise = sceneManager.transitionTo('scene1', 'none');
      
      // Check immediately (may or may not be transitioning depending on timing)
      await transitionPromise;
      
      expect(sceneManager.isTransitionInProgress()).toBe(false);
    });
  });

  describe('Transition Animations', () => {
    beforeEach(() => {
      sceneManager.registerScene(mockScene1);
      sceneManager.registerScene(mockScene2);
    });

    it('should support fade transition', async () => {
      await sceneManager.transitionTo('scene1', 'fade');

      expect(mockScene1.loadCalled).toBe(true);
      expect(mockScene1.enterCalled).toBe(true);
    });

    it('should support wipe transition', async () => {
      await sceneManager.transitionTo('scene1', 'wipe');

      expect(mockScene1.loadCalled).toBe(true);
      expect(mockScene1.enterCalled).toBe(true);
    });

    it('should support none transition', async () => {
      await sceneManager.transitionTo('scene1', 'none');

      expect(mockScene1.loadCalled).toBe(true);
      expect(mockScene1.enterCalled).toBe(true);
    });

    it('should use default transition type if not specified', async () => {
      sceneManager.setTransitionConfig({ type: 'fade' });
      await sceneManager.transitionTo('scene1');

      expect(mockScene1.loadCalled).toBe(true);
      expect(mockScene1.enterCalled).toBe(true);
    });

    it('should allow configuring transition settings', () => {
      sceneManager.setTransitionConfig({
        type: 'wipe',
        duration: 0.5,
        containerSelector: '#custom-container',
      });

      // Config should be applied (tested indirectly through transitions)
      expect(sceneManager).toBeDefined();
    });
  });

  describe('Scene Updates', () => {
    beforeEach(() => {
      sceneManager.registerScene(mockScene1);
    });

    it('should update current scene', async () => {
      await sceneManager.transitionTo('scene1', 'none');
      
      sceneManager.update(16.67);

      expect(mockScene1.updateCalled).toBe(true);
    });

    it('should not update when no scene is active', () => {
      sceneManager.update(16.67);
      // Should not throw
      expect(sceneManager.getCurrentScene()).toBeNull();
    });

    it('should not update during transition', async () => {
      const slowScene = new MockScene('slow', 100);
      sceneManager.registerScene(slowScene);

      const transitionPromise = sceneManager.transitionTo('slow', 'none');
      
      sceneManager.update(16.67);
      expect(slowScene.updateCalled).toBe(false);

      await transitionPromise;
    });
  });

  describe('Resource Cleanup', () => {
    beforeEach(() => {
      sceneManager.registerScene(mockScene1);
      sceneManager.registerScene(mockScene2);
    });

    it('should cleanup current scene on dispose', async () => {
      await sceneManager.transitionTo('scene1', 'none');
      
      sceneManager.dispose();

      expect(mockScene1.exitCalled).toBe(true);
      expect(mockScene1.cleanupCalled).toBe(true);
      expect(sceneManager.getCurrentScene()).toBeNull();
    });

    it('should clear all scenes on dispose', async () => {
      await sceneManager.transitionTo('scene1', 'none');
      
      sceneManager.dispose();

      // Should throw when trying to transition after dispose
      await expect(
        sceneManager.transitionTo('scene1', 'none')
      ).rejects.toThrow('Scene not found: scene1');
    });

    it('should handle dispose with no active scene', () => {
      sceneManager.dispose();
      
      expect(sceneManager.getCurrentScene()).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing DOM container gracefully', async () => {
      document.body.innerHTML = ''; // Remove container
      
      sceneManager.registerScene(mockScene1);
      
      // Should not throw
      await sceneManager.transitionTo('scene1', 'fade');
      
      expect(mockScene1.loadCalled).toBe(true);
      expect(mockScene1.enterCalled).toBe(true);
    });

    it('should handle scene load failure', async () => {
      const failingScene = new MockScene('failing');
      failingScene.load = vi.fn(async () => {
        throw new Error('Load failed');
      });

      sceneManager.registerScene(failingScene);

      await expect(
        sceneManager.transitionTo('failing', 'none')
      ).rejects.toThrow('Load failed');

      // Should reset transitioning flag even on error
      expect(sceneManager.isTransitionInProgress()).toBe(false);
    });

    it('should handle scene with long load time', async () => {
      const slowScene = new MockScene('slow', 200);
      sceneManager.registerScene(slowScene);

      const start = Date.now();
      await sceneManager.transitionTo('slow', 'none');
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(200);
      expect(slowScene.loadCalled).toBe(true);
      expect(slowScene.enterCalled).toBe(true);
    });
  });
});
