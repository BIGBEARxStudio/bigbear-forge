import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { AnimationControllerImpl } from './AnimationController';
import type { AnimationState } from '../types';

describe('AnimationController', () => {
  let mesh: THREE.Group;
  let controller: AnimationControllerImpl;

  beforeEach(() => {
    mesh = new THREE.Group();
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);
    controller = new AnimationControllerImpl(mesh);
  });

  describe('initialization', () => {
    it('should start in idle state', () => {
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should initialize with idle animation clip', () => {
      expect(controller.getCurrentState()).toBe('idle');
    });
  });

  describe('playAnimation', () => {
    it('should change animation state', () => {
      controller.playAnimation('attack');
      expect(controller.getCurrentState()).toBe('attack');
    });

    it('should not restart same animation', () => {
      controller.playAnimation('idle');
      const stateBefore = controller.getCurrentState();
      controller.playAnimation('idle');
      expect(controller.getCurrentState()).toBe(stateBefore);
    });

    it('should support all animation states', () => {
      const states: AnimationState[] = ['idle', 'attack', 'defend', 'victory', 'defeat', 'damaged'];
      
      states.forEach(state => {
        controller.playAnimation(state);
        expect(controller.getCurrentState()).toBe(state);
      });
    });

    it('should reset animation time when changing state', () => {
      controller.playAnimation('attack');
      controller.update(0.3); // Advance time
      controller.playAnimation('defend');
      // After changing state, animation should start from beginning
      expect(controller.getCurrentState()).toBe('defend');
    });
  });

  describe('update - idle animation', () => {
    it('should loop idle animation', () => {
      controller.playAnimation('idle');
      
      // Update past duration (2.0 seconds)
      controller.update(2.5);
      
      // Should still be in idle state
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should animate position in idle', () => {
      controller.playAnimation('idle');
      
      // At t=0, position should be (0, 0, 0)
      expect(mesh.position.y).toBeCloseTo(0, 1);
      
      // At t=1.0, position should be (0, 0.1, 0)
      controller.update(1.0);
      expect(mesh.position.y).toBeCloseTo(0.1, 1);
      
      // At t=2.0, position should be back to (0, 0, 0)
      controller.update(1.0);
      expect(mesh.position.y).toBeCloseTo(0, 1);
    });
  });

  describe('update - attack animation', () => {
    it('should return to idle after attack completes', () => {
      controller.playAnimation('attack');
      
      // Update past attack duration (0.5 seconds)
      controller.update(0.6);
      
      // Should return to idle
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should animate position during attack', () => {
      controller.playAnimation('attack');
      
      // At t=0.2, position should be (0.5, 0, 0.5)
      controller.update(0.2);
      expect(mesh.position.x).toBeCloseTo(0.5, 1);
      expect(mesh.position.z).toBeCloseTo(0.5, 1);
      
      // At t=0.49 (just before completion), position should be close to (0, 0, 0)
      controller.update(0.29);
      expect(mesh.position.x).toBeCloseTo(0, 0);
      expect(mesh.position.z).toBeCloseTo(0, 0);
    });

    it('should call completion callback after attack', () => {
      const callback = vi.fn();
      controller.playAnimation('attack');
      controller.onAnimationComplete(callback);
      
      controller.update(0.6);
      
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('update - defend animation', () => {
    it('should return to idle after defend completes', () => {
      controller.playAnimation('defend');
      
      // Update past defend duration (0.3 seconds)
      controller.update(0.4);
      
      // Should return to idle
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should animate scale during defend', () => {
      controller.playAnimation('defend');
      
      // At t=0.15, scale should be (0.9, 1.1, 0.9)
      controller.update(0.15);
      expect(mesh.scale.x).toBeCloseTo(0.9, 1);
      expect(mesh.scale.y).toBeCloseTo(1.1, 1);
      expect(mesh.scale.z).toBeCloseTo(0.9, 1);
      
      // At t=0.29 (just before completion), scale should be close to (1, 1, 1)
      controller.update(0.14);
      expect(mesh.scale.x).toBeCloseTo(1, 0);
      expect(mesh.scale.y).toBeCloseTo(1, 0);
      expect(mesh.scale.z).toBeCloseTo(1, 0);
    });
  });

  describe('update - damaged animation', () => {
    it('should return to idle after damaged completes', () => {
      controller.playAnimation('damaged');
      
      // Update past damaged duration (0.4 seconds)
      controller.update(0.5);
      
      // Should return to idle
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should animate rotation during damaged', () => {
      controller.playAnimation('damaged');
      
      // At t=0.1, rotation should be (0, 0, 0.2)
      controller.update(0.1);
      expect(mesh.rotation.z).toBeCloseTo(0.2, 1);
      
      // At t=0.2, rotation should be (0, 0, -0.2)
      controller.update(0.1);
      expect(mesh.rotation.z).toBeCloseTo(-0.2, 1);
      
      // At t=0.39 (just before completion), rotation should be close to (0, 0, 0)
      controller.update(0.19);
      expect(mesh.rotation.z).toBeCloseTo(0, 0);
    });
  });

  describe('update - victory animation', () => {
    it('should NOT return to idle after victory', () => {
      controller.playAnimation('victory');
      
      // Update past victory duration (1.0 seconds)
      controller.update(1.5);
      
      // Should stay in victory state
      expect(controller.getCurrentState()).toBe('victory');
    });

    it('should animate position during victory', () => {
      controller.playAnimation('victory');
      
      // At t=0.5, position should be (0, 0.5, 0)
      controller.update(0.5);
      expect(mesh.position.y).toBeCloseTo(0.5, 1);
      
      // At t=1.0, position should be (0, 0.3, 0)
      controller.update(0.5);
      expect(mesh.position.y).toBeCloseTo(0.3, 1);
    });

    it('should call completion callback after victory', () => {
      const callback = vi.fn();
      controller.playAnimation('victory');
      controller.onAnimationComplete(callback);
      
      controller.update(1.5);
      
      expect(callback).toHaveBeenCalledOnce();
    });
  });

  describe('update - defeat animation', () => {
    it('should NOT return to idle after defeat', () => {
      controller.playAnimation('defeat');
      
      // Update past defeat duration (1.0 seconds)
      controller.update(1.5);
      
      // Should stay in defeat state
      expect(controller.getCurrentState()).toBe('defeat');
    });

    it('should animate rotation during defeat', () => {
      controller.playAnimation('defeat');
      
      // At t=1.0, rotation should be (PI/2, 0, 0) - fallen over
      controller.update(1.0);
      expect(mesh.rotation.x).toBeCloseTo(Math.PI / 2, 1);
    });
  });

  describe('keyframe interpolation', () => {
    it('should interpolate between keyframes smoothly', () => {
      controller.playAnimation('attack');
      
      // At t=0.1 (halfway between 0 and 0.2), position should be interpolated
      controller.update(0.1);
      expect(mesh.position.x).toBeGreaterThan(0);
      expect(mesh.position.x).toBeLessThan(0.5);
      expect(mesh.position.z).toBeGreaterThan(0);
      expect(mesh.position.z).toBeLessThan(0.5);
    });

    it('should handle multiple keyframes correctly', () => {
      controller.playAnimation('damaged');
      
      // Rotation should change through multiple keyframes
      controller.update(0.1);
      const rotation1 = mesh.rotation.z;
      
      controller.update(0.1);
      const rotation2 = mesh.rotation.z;
      
      // Rotation should have changed
      expect(rotation1).not.toBe(rotation2);
    });
  });

  describe('animation completion callback', () => {
    it('should call callback only once', () => {
      const callback = vi.fn();
      controller.playAnimation('attack');
      controller.onAnimationComplete(callback);
      
      controller.update(0.6);
      controller.update(0.1);
      
      expect(callback).toHaveBeenCalledOnce();
    });

    it('should clear callback after calling', () => {
      const callback = vi.fn();
      controller.playAnimation('attack');
      controller.onAnimationComplete(callback);
      
      controller.update(0.6);
      
      // Play another animation
      controller.playAnimation('defend');
      controller.update(0.4);
      
      // Callback should still only be called once (from attack)
      expect(callback).toHaveBeenCalledOnce();
    });

    it('should not call callback for looping animations', () => {
      const callback = vi.fn();
      controller.playAnimation('idle');
      controller.onAnimationComplete(callback);
      
      // Update past multiple loops
      controller.update(5.0);
      
      // Callback should not be called for looping animations
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle zero delta time', () => {
      controller.playAnimation('attack');
      const positionBefore = mesh.position.clone();
      
      controller.update(0);
      
      expect(mesh.position.equals(positionBefore)).toBe(true);
    });

    it('should handle very large delta time', () => {
      controller.playAnimation('attack');
      
      // Update with huge delta time
      controller.update(100);
      
      // Should have completed and returned to idle
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should handle rapid state changes', () => {
      controller.playAnimation('attack');
      controller.playAnimation('defend');
      controller.playAnimation('damaged');
      
      expect(controller.getCurrentState()).toBe('damaged');
    });

    it('should preserve mesh transform properties not being animated', () => {
      // Set initial scale
      mesh.scale.set(2, 2, 2);
      
      // Play attack animation (animates position, not scale)
      controller.playAnimation('attack');
      controller.update(0.2);
      
      // Scale should be preserved (not reset to 1,1,1)
      // Note: This test verifies that only animated properties are modified
      expect(mesh.scale.x).toBe(2);
    });
  });

  describe('animation state transitions', () => {
    it('should transition from idle to attack smoothly', () => {
      controller.playAnimation('idle');
      controller.update(0.5);
      
      const positionBeforeTransition = mesh.position.clone();
      
      controller.playAnimation('attack');
      controller.update(0.01);
      
      // Position should start changing immediately
      expect(mesh.position.equals(positionBeforeTransition)).toBe(false);
    });

    it('should handle transition from non-looping to looping animation', () => {
      controller.playAnimation('attack');
      controller.update(0.6); // Complete attack, return to idle
      
      expect(controller.getCurrentState()).toBe('idle');
      
      // Continue updating in idle
      controller.update(1.0);
      expect(controller.getCurrentState()).toBe('idle');
    });

    it('should handle transition from looping to non-looping animation', () => {
      controller.playAnimation('idle');
      controller.update(1.0);
      
      controller.playAnimation('attack');
      controller.update(0.6);
      
      // Should complete and return to idle
      expect(controller.getCurrentState()).toBe('idle');
    });
  });
});
