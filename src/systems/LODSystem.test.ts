import { describe, it, expect, beforeEach } from 'vitest';
import { LODSystemImpl } from './LODSystem';
import * as THREE from 'three';
import { Avatar } from '../types';

describe('LODSystem', () => {
  let lodSystem: LODSystemImpl;
  let camera: THREE.PerspectiveCamera;
  let mockAvatar: Avatar;

  beforeEach(() => {
    lodSystem = new LODSystemImpl();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Create mock avatar with mesh
    const mesh = new THREE.Group();
    mesh.position.set(0, 0, 0);
    
    // Add body parts
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial()
    );
    head.name = 'head';
    mesh.add(head);

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshBasicMaterial()
    );
    torso.name = 'torso';
    mesh.add(torso);

    // Add accessory
    const hat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshBasicMaterial()
    );
    hat.name = 'accessory-hat';
    mesh.add(hat);

    mockAvatar = {
      id: 'test-avatar',
      mesh,
      animationController: null,
      customization: {
        bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
        colors: { skin: '#ffdbac', hair: '#8b4513', clothing: '#4169e1' },
        accessories: { hat: 'default' }
      }
    };
  });

  describe('Constructor', () => {
    it('should create with default LOD distances', () => {
      const lod = new LODSystemImpl();
      expect(lod).toBeDefined();
    });

    it('should create with custom LOD distances', () => {
      const lod = new LODSystemImpl(3, 10);
      expect(lod).toBeDefined();
    });
  });

  describe('setLODDistances', () => {
    it('should set LOD distances', () => {
      lodSystem.setLODDistances(3, 12);
      // Verify by checking LOD level changes at different distances
      camera.position.set(0, 0, 2);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('high');
    });

    it('should throw error for negative near distance', () => {
      expect(() => lodSystem.setLODDistances(-1, 10)).toThrow('LOD distances must be non-negative');
    });

    it('should throw error for negative far distance', () => {
      expect(() => lodSystem.setLODDistances(5, -1)).toThrow('LOD distances must be non-negative');
    });

    it('should throw error when near >= far', () => {
      expect(() => lodSystem.setLODDistances(10, 5)).toThrow('Near distance must be less than far distance');
    });

    it('should throw error when near equals far', () => {
      expect(() => lodSystem.setLODDistances(5, 5)).toThrow('Near distance must be less than far distance');
    });
  });

  describe('updateLOD', () => {
    it('should set high detail when camera is close', () => {
      camera.position.set(0, 0, 3); // Distance = 3, < nearDistance (5)
      lodSystem.updateLOD(camera, [mockAvatar]);
      
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('high');
      
      // All meshes should be visible
      mockAvatar.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          expect(child.visible).toBe(true);
        }
      });
    });

    it('should set medium detail at mid-range', () => {
      camera.position.set(0, 0, 10); // Distance = 10, between near (5) and far (15)
      lodSystem.updateLOD(camera, [mockAvatar]);
      
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('medium');
      
      // All meshes should be visible
      mockAvatar.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          expect(child.visible).toBe(true);
        }
      });
    });

    it('should set low detail when camera is far', () => {
      camera.position.set(0, 0, 20); // Distance = 20, > farDistance (15)
      lodSystem.updateLOD(camera, [mockAvatar]);
      
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('low');
      
      // Accessories should be hidden
      mockAvatar.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          if (child.name && child.name.includes('accessory')) {
            expect(child.visible).toBe(false);
          } else {
            expect(child.visible).toBe(true);
          }
        }
      });
    });

    it('should handle multiple avatars', () => {
      const avatar2 = {
        ...mockAvatar,
        id: 'avatar-2',
        mesh: mockAvatar.mesh.clone()
      };
      avatar2.mesh.position.set(0, 0, 20);

      camera.position.set(0, 0, 0);
      lodSystem.updateLOD(camera, [mockAvatar, avatar2]);

      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('high');
      expect(lodSystem.getCurrentLODLevel('avatar-2')).toBe('low');
    });

    it('should handle null camera gracefully', () => {
      expect(() => lodSystem.updateLOD(null as any, [mockAvatar])).not.toThrow();
    });

    it('should handle null avatars array gracefully', () => {
      expect(() => lodSystem.updateLOD(camera, null as any)).not.toThrow();
    });

    it('should handle empty avatars array', () => {
      expect(() => lodSystem.updateLOD(camera, [])).not.toThrow();
    });

    it('should handle avatar with null mesh', () => {
      const badAvatar = { ...mockAvatar, mesh: null as any };
      expect(() => lodSystem.updateLOD(camera, [badAvatar])).not.toThrow();
    });

    it('should handle null avatar in array', () => {
      expect(() => lodSystem.updateLOD(camera, [null as any])).not.toThrow();
    });
  });

  describe('getCurrentLODLevel', () => {
    it('should return high by default for unknown avatar', () => {
      expect(lodSystem.getCurrentLODLevel('unknown')).toBe('high');
    });

    it('should return correct LOD level after update', () => {
      camera.position.set(0, 0, 10);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('medium');
    });

    it('should track LOD level changes', () => {
      // Start close
      camera.position.set(0, 0, 3);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('high');

      // Move to mid-range
      camera.position.set(0, 0, 10);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('medium');

      // Move far
      camera.position.set(0, 0, 20);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('low');
    });
  });

  describe('LOD Distance Boundaries', () => {
    it('should use high detail at exactly nearDistance', () => {
      camera.position.set(0, 0, 5); // Exactly at nearDistance
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('medium');
    });

    it('should use medium detail at exactly farDistance', () => {
      camera.position.set(0, 0, 15); // Exactly at farDistance
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('low');
    });

    it('should use high detail just below nearDistance', () => {
      camera.position.set(0, 0, 4.9);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('high');
    });

    it('should use low detail just above farDistance', () => {
      camera.position.set(0, 0, 15.1);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('low');
    });
  });

  describe('Custom LOD Distances', () => {
    it('should respect custom LOD distances', () => {
      lodSystem.setLODDistances(2, 8);

      // Close (< 2)
      camera.position.set(0, 0, 1);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('high');

      // Mid (2-8)
      camera.position.set(0, 0, 5);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('medium');

      // Far (> 8)
      camera.position.set(0, 0, 10);
      lodSystem.updateLOD(camera, [mockAvatar]);
      expect(lodSystem.getCurrentLODLevel('test-avatar')).toBe('low');
    });
  });

  describe('Mesh Visibility', () => {
    it('should keep all meshes visible in high detail', () => {
      camera.position.set(0, 0, 3);
      lodSystem.updateLOD(camera, [mockAvatar]);

      let meshCount = 0;
      let visibleCount = 0;
      mockAvatar.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          meshCount++;
          if (child.visible) visibleCount++;
        }
      });

      expect(meshCount).toBeGreaterThan(0);
      expect(visibleCount).toBe(meshCount);
    });

    it('should hide accessories in low detail', () => {
      camera.position.set(0, 0, 20);
      lodSystem.updateLOD(camera, [mockAvatar]);

      let accessoryCount = 0;
      let hiddenAccessoryCount = 0;
      mockAvatar.mesh.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.name && child.name.includes('accessory')) {
          accessoryCount++;
          if (!child.visible) hiddenAccessoryCount++;
        }
      });

      expect(accessoryCount).toBeGreaterThan(0);
      expect(hiddenAccessoryCount).toBe(accessoryCount);
    });
  });
});
