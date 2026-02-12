import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { CameraControllerImpl, DEFAULT_CAMERA_CONFIG } from './CameraController';
import type { CameraConfig } from './CameraController';

describe('CameraController', () => {
  let camera: THREE.PerspectiveCamera;
  let controller: CameraControllerImpl;

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    controller = new CameraControllerImpl(camera);
  });

  describe('initialization', () => {
    it('should initialize with default position', () => {
      // Default: distance=5, azimuth=0, polar=PI/4, target=(0,1,0)
      // With azimuth=0, polar=PI/4, camera should be on positive X axis
      expect(camera.position.x).toBeGreaterThan(0);
      expect(camera.position.y).toBeGreaterThan(0);
    });

    it('should look at default target', () => {
      const target = new THREE.Vector3(0, 1, 0);
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      const expectedDirection = new THREE.Vector3()
        .subVectors(target, camera.position)
        .normalize();
      
      expect(direction.x).toBeCloseTo(expectedDirection.x, 1);
      expect(direction.y).toBeCloseTo(expectedDirection.y, 1);
      expect(direction.z).toBeCloseTo(expectedDirection.z, 1);
    });

    it('should accept custom config', () => {
      const customConfig: CameraConfig = {
        minDistance: 1,
        maxDistance: 20,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        dampingFactor: 0.1,
      };
      
      const customController = new CameraControllerImpl(camera, customConfig);
      expect(customController).toBeDefined();
    });
  });

  describe('setTarget', () => {
    it('should update camera to look at new target', () => {
      const newTarget = new THREE.Vector3(5, 2, 3);
      controller.setTarget(newTarget);
      
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      const expectedDirection = new THREE.Vector3()
        .subVectors(newTarget, camera.position)
        .normalize();
      
      expect(direction.x).toBeCloseTo(expectedDirection.x, 1);
      expect(direction.y).toBeCloseTo(expectedDirection.y, 1);
      expect(direction.z).toBeCloseTo(expectedDirection.z, 1);
    });

    it('should maintain distance from new target', () => {
      const newTarget = new THREE.Vector3(10, 5, -3);
      controller.setTarget(newTarget);
      
      const distance = camera.position.distanceTo(newTarget);
      expect(distance).toBeCloseTo(5, 1);
    });
  });

  describe('orbit', () => {
    it('should rotate camera around target horizontally', () => {
      const initialPosition = camera.position.clone();
      
      controller.orbit(100, 0); // Rotate horizontally
      controller.update(1.0); // Apply damping
      
      // Position should have changed
      expect(camera.position.equals(initialPosition)).toBe(false);
      
      // Distance should remain the same
      const target = new THREE.Vector3(0, 1, 0);
      const distance = camera.position.distanceTo(target);
      expect(distance).toBeCloseTo(5, 1);
    });

    it('should rotate camera around target vertically', () => {
      const initialY = camera.position.y;
      
      controller.orbit(0, 50); // Rotate vertically
      controller.update(1.0); // Apply damping
      
      // Y position should have changed
      expect(camera.position.y).not.toBeCloseTo(initialY, 1);
      
      // Distance should remain the same
      const target = new THREE.Vector3(0, 1, 0);
      const distance = camera.position.distanceTo(target);
      expect(distance).toBeCloseTo(5, 1);
    });

    it('should clamp polar angle to min constraint', () => {
      // Try to orbit beyond minimum polar angle
      controller.orbit(0, -1000);
      controller.update(1.0);
      
      // Camera should not go below target
      expect(camera.position.y).toBeGreaterThan(0);
    });

    it('should clamp polar angle to max constraint', () => {
      // Try to orbit beyond maximum polar angle
      controller.orbit(0, 1000);
      controller.update(1.0);
      
      // Camera should not go too high (max is PI/2)
      const target = new THREE.Vector3(0, 1, 0);
      expect(camera.position.y).toBeLessThan(target.y + 6);
    });

    it('should allow full 360 degree horizontal rotation', () => {
      const positions: THREE.Vector3[] = [];
      
      // Rotate 360 degrees with larger steps
      for (let i = 0; i < 4; i++) {
        controller.orbit(Math.PI * 50, 0); // Larger rotation
        controller.update(1.0);
        positions.push(camera.position.clone());
      }
      
      // Should have rotated around - check that positions are different
      const distance01 = positions[0].distanceTo(positions[1]);
      const distance12 = positions[1].distanceTo(positions[2]);
      expect(distance01).toBeGreaterThan(1);
      expect(distance12).toBeGreaterThan(1);
    });
  });

  describe('zoom', () => {
    it('should move camera closer to target', () => {
      const target = new THREE.Vector3(0, 1, 0);
      const initialDistance = camera.position.distanceTo(target);
      
      controller.zoom(-10); // Negative = zoom in
      controller.update(1.0);
      
      const newDistance = camera.position.distanceTo(target);
      expect(newDistance).toBeLessThan(initialDistance);
    });

    it('should move camera farther from target', () => {
      const target = new THREE.Vector3(0, 1, 0);
      const initialDistance = camera.position.distanceTo(target);
      
      controller.zoom(10); // Positive = zoom out
      controller.update(1.0);
      
      const newDistance = camera.position.distanceTo(target);
      expect(newDistance).toBeGreaterThan(initialDistance);
    });

    it('should respect minimum distance constraint', () => {
      const target = new THREE.Vector3(0, 1, 0);
      
      // Try to zoom in beyond minimum
      controller.zoom(-1000);
      controller.update(1.0);
      
      const distance = camera.position.distanceTo(target);
      expect(distance).toBeGreaterThanOrEqual(DEFAULT_CAMERA_CONFIG.minDistance - 0.1);
    });

    it('should respect maximum distance constraint', () => {
      const target = new THREE.Vector3(0, 1, 0);
      
      // Try to zoom out beyond maximum
      controller.zoom(1000);
      controller.update(1.0);
      
      const distance = camera.position.distanceTo(target);
      expect(distance).toBeLessThanOrEqual(DEFAULT_CAMERA_CONFIG.maxDistance + 0.1);
    });

    it('should maintain camera direction while zooming', () => {
      const initialDirection = new THREE.Vector3();
      camera.getWorldDirection(initialDirection);
      
      controller.zoom(2);
      controller.update(1.0);
      
      const newDirection = new THREE.Vector3();
      camera.getWorldDirection(newDirection);
      
      // Direction should remain similar (pointing at target)
      expect(initialDirection.dot(newDirection)).toBeGreaterThan(0.99);
    });
  });

  describe('update', () => {
    it('should smoothly interpolate to target position', () => {
      controller.orbit(100, 0);
      
      const positionAfterSmallUpdate = camera.position.clone();
      controller.update(0.1);
      const position1 = camera.position.clone();
      
      controller.update(0.1);
      const position2 = camera.position.clone();
      
      // Position should change gradually
      expect(position1.equals(positionAfterSmallUpdate)).toBe(false);
      expect(position2.equals(position1)).toBe(false);
    });

    it('should handle zero delta time', () => {
      const initialPosition = camera.position.clone();
      
      controller.orbit(100, 0);
      controller.update(0);
      
      // Position should not change with zero delta time
      expect(camera.position.distanceTo(initialPosition)).toBeLessThan(0.1);
    });

    it('should eventually reach target position', () => {
      controller.zoom(3);
      
      // Update many times
      for (let i = 0; i < 100; i++) {
        controller.update(0.1);
      }
      
      const target = new THREE.Vector3(0, 1, 0);
      const distance = camera.position.distanceTo(target);
      
      // Should be close to target distance (5 + 3*0.1 = 5.3)
      expect(distance).toBeCloseTo(5.3, 0);
    });

    it('should apply damping factor correctly', () => {
      const fastConfig: CameraConfig = {
        ...DEFAULT_CAMERA_CONFIG,
        dampingFactor: 0.01, // Lower = faster damping
      };
      
      const slowConfig: CameraConfig = {
        ...DEFAULT_CAMERA_CONFIG,
        dampingFactor: 0.5, // Higher = slower damping
      };
      
      const fastController = new CameraControllerImpl(camera, fastConfig);
      const slowCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      const slowController = new CameraControllerImpl(slowCamera, slowConfig);
      
      fastController.zoom(2);
      slowController.zoom(2);
      
      fastController.update(0.1);
      slowController.update(0.1);
      
      const target = new THREE.Vector3(0, 1, 0);
      const fastDistance = camera.position.distanceTo(target);
      const slowDistance = slowCamera.position.distanceTo(target);
      
      // Fast controller should have moved more (lower dampingFactor = faster)
      expect(Math.abs(fastDistance - 5)).toBeGreaterThan(Math.abs(slowDistance - 5));
    });
  });

  describe('reset', () => {
    it('should reset camera to default position', () => {
      // Move camera
      controller.orbit(100, 50);
      controller.zoom(3);
      controller.update(1.0);
      
      // Reset
      controller.reset();
      controller.update(1.0);
      
      const target = new THREE.Vector3(0, 1, 0);
      const distance = camera.position.distanceTo(target);
      
      // Should be back to default distance
      expect(distance).toBeCloseTo(5, 0);
    });

    it('should reset to default angles', () => {
      controller.orbit(200, 100);
      controller.update(1.0);
      
      const positionAfterOrbit = camera.position.clone();
      
      controller.reset();
      
      // Update multiple times to reach reset position
      for (let i = 0; i < 100; i++) {
        controller.update(0.1);
      }
      
      // Position should be different from orbited position
      expect(camera.position.distanceTo(positionAfterOrbit)).toBeGreaterThan(1);
    });
  });

  describe('combined operations', () => {
    it('should handle orbit and zoom together', () => {
      const target = new THREE.Vector3(0, 1, 0);
      const initialDistance = camera.position.distanceTo(target);
      const initialPosition = camera.position.clone();
      
      controller.orbit(50, 25);
      controller.zoom(2);
      controller.update(1.0);
      
      const newDistance = camera.position.distanceTo(target);
      
      // Distance should have changed
      expect(newDistance).not.toBeCloseTo(initialDistance, 1);
      
      // Position should have changed
      expect(camera.position.equals(initialPosition)).toBe(false);
    });

    it('should handle rapid input changes', () => {
      for (let i = 0; i < 10; i++) {
        controller.orbit(10, 5);
        controller.zoom(0.5);
        controller.update(0.016); // ~60fps
      }
      
      // Should not crash or produce invalid values
      expect(camera.position.x).not.toBeNaN();
      expect(camera.position.y).not.toBeNaN();
      expect(camera.position.z).not.toBeNaN();
    });

    it('should maintain smooth movement with variable delta time', () => {
      const positions: THREE.Vector3[] = [];
      
      controller.orbit(100, 0);
      
      // Variable delta times
      const deltaTimes = [0.016, 0.033, 0.016, 0.05, 0.016];
      deltaTimes.forEach(dt => {
        controller.update(dt);
        positions.push(camera.position.clone());
      });
      
      // All positions should be valid
      positions.forEach(pos => {
        expect(pos.x).not.toBeNaN();
        expect(pos.y).not.toBeNaN();
        expect(pos.z).not.toBeNaN();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle target at origin', () => {
      controller.setTarget(new THREE.Vector3(0, 0, 0));
      controller.update(0.1);
      
      expect(camera.position.x).not.toBeNaN();
      expect(camera.position.y).not.toBeNaN();
      expect(camera.position.z).not.toBeNaN();
    });

    it('should handle very small orbit deltas', () => {
      const initialPosition = camera.position.clone();
      
      controller.orbit(0.001, 0.001);
      controller.update(1.0);
      
      // Position should change slightly
      const distance = camera.position.distanceTo(initialPosition);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(0.1);
    });

    it('should handle very large orbit deltas', () => {
      controller.orbit(10000, 10000);
      controller.update(1.0);
      
      // Should still produce valid position
      expect(camera.position.x).not.toBeNaN();
      expect(camera.position.y).not.toBeNaN();
      expect(camera.position.z).not.toBeNaN();
      
      // Should respect constraints (camera should stay above ground)
      expect(camera.position.y).toBeGreaterThan(0);
    });

    it('should handle negative zoom values', () => {
      const target = new THREE.Vector3(0, 1, 0);
      const initialDistance = camera.position.distanceTo(target);
      
      controller.zoom(-2);
      controller.update(1.0);
      
      const newDistance = camera.position.distanceTo(target);
      expect(newDistance).toBeLessThan(initialDistance);
    });

    it('should maintain valid camera orientation', () => {
      // Perform various operations
      controller.orbit(100, 50);
      controller.zoom(3);
      controller.update(0.5);
      controller.orbit(-50, -25);
      controller.zoom(-1);
      controller.update(0.5);
      
      // Camera should still look at target
      const target = new THREE.Vector3(0, 1, 0);
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      const expectedDirection = new THREE.Vector3()
        .subVectors(target, camera.position)
        .normalize();
      
      expect(direction.dot(expectedDirection)).toBeGreaterThan(0.99);
    });
  });
});
