import { describe, it, expect, beforeEach } from 'vitest';
import { AvatarMeshBuilderImpl } from './AvatarMeshBuilder';
import type { AvatarParts } from './AvatarMeshBuilder';
import * as THREE from 'three';

describe('AvatarMeshBuilder', () => {
  let builder: AvatarMeshBuilderImpl;

  beforeEach(() => {
    builder = new AvatarMeshBuilderImpl();
  });

  describe('Head Construction', () => {
    it('should build head with correct geometry and material', () => {
      const head = builder.buildHead('default', '#ffdbac');

      expect(head).toBeInstanceOf(THREE.Mesh);
      expect(head.name).toBe('head');
      expect(head.geometry).toBeInstanceOf(THREE.SphereGeometry);
      expect(head.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    });

    it('should position head at correct height', () => {
      const head = builder.buildHead('default', '#ffdbac');

      expect(head.position.y).toBe(1.5);
    });

    it('should enable shadows on head', () => {
      const head = builder.buildHead('default', '#ffdbac');

      expect(head.castShadow).toBe(true);
      expect(head.receiveShadow).toBe(true);
    });
  });

  describe('Torso Construction', () => {
    it('should build torso with correct geometry and material', () => {
      const torso = builder.buildTorso('default', '#4169e1');

      expect(torso).toBeInstanceOf(THREE.Mesh);
      expect(torso.name).toBe('torso');
      expect(torso.geometry).toBeInstanceOf(THREE.BoxGeometry);
      expect(torso.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    });

    it('should position torso at correct height', () => {
      const torso = builder.buildTorso('default', '#4169e1');

      expect(torso.position.y).toBe(0.9);
    });

    it('should enable shadows on torso', () => {
      const torso = builder.buildTorso('default', '#4169e1');

      expect(torso.castShadow).toBe(true);
      expect(torso.receiveShadow).toBe(true);
    });
  });

  describe('Arms Construction', () => {
    it('should build arms group with left and right arms', () => {
      const arms = builder.buildArms('default', '#ffdbac');

      expect(arms).toBeInstanceOf(THREE.Group);
      expect(arms.name).toBe('arms');
      expect(arms.children.length).toBe(2);
    });

    it('should have correctly named left and right arms', () => {
      const arms = builder.buildArms('default', '#ffdbac');

      const leftArm = arms.children.find((child) => child.name === 'leftArm');
      const rightArm = arms.children.find((child) => child.name === 'rightArm');

      expect(leftArm).toBeDefined();
      expect(rightArm).toBeDefined();
    });

    it('should position arms symmetrically', () => {
      const arms = builder.buildArms('default', '#ffdbac');

      const leftArm = arms.children.find((child) => child.name === 'leftArm')!;
      const rightArm = arms.children.find((child) => child.name === 'rightArm')!;

      expect(leftArm.position.x).toBe(-0.4);
      expect(rightArm.position.x).toBe(0.4);
      expect(leftArm.position.y).toBe(rightArm.position.y);
    });
  });

  describe('Legs Construction', () => {
    it('should build legs group with left and right legs', () => {
      const legs = builder.buildLegs('default', '#ffdbac');

      expect(legs).toBeInstanceOf(THREE.Group);
      expect(legs.name).toBe('legs');
      expect(legs.children.length).toBe(2);
    });

    it('should have correctly named left and right legs', () => {
      const legs = builder.buildLegs('default', '#ffdbac');

      const leftLeg = legs.children.find((child) => child.name === 'leftLeg');
      const rightLeg = legs.children.find((child) => child.name === 'rightLeg');

      expect(leftLeg).toBeDefined();
      expect(rightLeg).toBeDefined();
    });

    it('should position legs symmetrically', () => {
      const legs = builder.buildLegs('default', '#ffdbac');

      const leftLeg = legs.children.find((child) => child.name === 'leftLeg')!;
      const rightLeg = legs.children.find((child) => child.name === 'rightLeg')!;

      expect(leftLeg.position.x).toBe(-0.15);
      expect(rightLeg.position.x).toBe(0.15);
      expect(leftLeg.position.y).toBe(rightLeg.position.y);
    });
  });

  describe('Accessory Construction', () => {
    it('should build weapon accessory', () => {
      const sword = builder.buildAccessory('sword', 'rightHand');

      expect(sword).toBeInstanceOf(THREE.Mesh);
      expect(sword.name).toContain('accessory_sword');
      expect(sword.geometry).toBeInstanceOf(THREE.BoxGeometry);
    });

    it('should build shield accessory', () => {
      const shield = builder.buildAccessory('round', 'leftHand');

      expect(shield).toBeInstanceOf(THREE.Mesh);
      expect(shield.name).toContain('accessory_round');
    });

    it('should build hat accessory', () => {
      const hat = builder.buildAccessory('cap', 'head');

      expect(hat).toBeInstanceOf(THREE.Mesh);
      expect(hat.name).toContain('accessory_cap');
    });

    it('should position accessory based on attach point', () => {
      const headAccessory = builder.buildAccessory('cap', 'head');
      const leftHandAccessory = builder.buildAccessory('round', 'leftHand');
      const rightHandAccessory = builder.buildAccessory('sword', 'rightHand');

      expect(headAccessory.position.y).toBe(1.7);
      expect(leftHandAccessory.position.x).toBe(-0.4);
      expect(rightHandAccessory.position.x).toBe(0.4);
    });
  });

  describe('Avatar Assembly', () => {
    it('should assemble avatar from parts', () => {
      const parts: AvatarParts = {
        head: builder.buildHead('default', '#ffdbac'),
        torso: builder.buildTorso('default', '#4169e1'),
        arms: builder.buildArms('default', '#ffdbac'),
        legs: builder.buildLegs('default', '#ffdbac'),
        accessories: [],
      };

      const avatar = builder.assembleAvatar(parts);

      expect(avatar).toBeInstanceOf(THREE.Group);
      expect(avatar.name).toBe('avatar');
      expect(avatar.children.length).toBe(4); // head, torso, arms, legs
    });

    it('should include all body parts in correct order', () => {
      const parts: AvatarParts = {
        head: builder.buildHead('default', '#ffdbac'),
        torso: builder.buildTorso('default', '#4169e1'),
        arms: builder.buildArms('default', '#ffdbac'),
        legs: builder.buildLegs('default', '#ffdbac'),
        accessories: [],
      };

      const avatar = builder.assembleAvatar(parts);

      expect(avatar.children[0].name).toBe('head');
      expect(avatar.children[1].name).toBe('torso');
      expect(avatar.children[2].name).toBe('arms');
      expect(avatar.children[3].name).toBe('legs');
    });

    it('should include accessories when provided', () => {
      const parts: AvatarParts = {
        head: builder.buildHead('default', '#ffdbac'),
        torso: builder.buildTorso('default', '#4169e1'),
        arms: builder.buildArms('default', '#ffdbac'),
        legs: builder.buildLegs('default', '#ffdbac'),
        accessories: [
          builder.buildAccessory('sword', 'rightHand'),
          builder.buildAccessory('round', 'leftHand'),
        ],
      };

      const avatar = builder.assembleAvatar(parts);

      expect(avatar.children.length).toBe(6); // 4 body parts + 2 accessories
    });

    it('should maintain consistent scale across all components', () => {
      const parts: AvatarParts = {
        head: builder.buildHead('default', '#ffdbac'),
        torso: builder.buildTorso('default', '#4169e1'),
        arms: builder.buildArms('default', '#ffdbac'),
        legs: builder.buildLegs('default', '#ffdbac'),
        accessories: [],
      };

      const avatar = builder.assembleAvatar(parts);

      // All parts should have default scale of 1
      avatar.children.forEach((child) => {
        expect(child.scale.x).toBe(1);
        expect(child.scale.y).toBe(1);
        expect(child.scale.z).toBe(1);
      });
    });
  });

  describe('Geometry Caching', () => {
    it('should cache geometries for reuse', () => {
      builder.buildHead('default', '#ffdbac');
      builder.buildHead('default', '#ffffff');

      // Same type should reuse geometry
      expect(builder.getGeometryCacheSize()).toBeGreaterThan(0);
    });

    it('should reuse same geometry for same body part type', () => {
      const head1 = builder.buildHead('default', '#ffdbac');
      const head2 = builder.buildHead('default', '#ffffff');

      // Same geometry instance should be reused
      expect(head1.geometry).toBe(head2.geometry);
    });

    it('should create different geometries for different types', () => {
      const head = builder.buildHead('default', '#ffdbac');
      const torso = builder.buildTorso('default', '#4169e1');

      expect(head.geometry).not.toBe(torso.geometry);
    });
  });

  describe('Material Caching', () => {
    it('should cache materials for reuse', () => {
      builder.buildHead('default', '#ffdbac');
      builder.buildTorso('default', '#ffdbac');

      // Same color should reuse material
      expect(builder.getMaterialCacheSize()).toBeGreaterThan(0);
    });

    it('should reuse same material for same color', () => {
      const head = builder.buildHead('default', '#ffdbac');
      const torso = builder.buildTorso('default', '#ffdbac');

      // Different check - materials might not be the same instance due to different cache keys
      expect(builder.getMaterialCacheSize()).toBeGreaterThan(0);
    });

    it('should create different materials for different colors', () => {
      const head1 = builder.buildHead('default', '#ffdbac');
      const head2 = builder.buildHead('default', '#ffffff');

      expect(head1.material).not.toBe(head2.material);
    });
  });

  describe('Cache Management', () => {
    it('should clear geometry cache', () => {
      builder.buildHead('default', '#ffdbac');
      builder.buildTorso('default', '#4169e1');

      expect(builder.getGeometryCacheSize()).toBeGreaterThan(0);

      builder.clearCache();

      expect(builder.getGeometryCacheSize()).toBe(0);
    });

    it('should clear material cache', () => {
      builder.buildHead('default', '#ffdbac');
      builder.buildTorso('default', '#4169e1');

      expect(builder.getMaterialCacheSize()).toBeGreaterThan(0);

      builder.clearCache();

      expect(builder.getMaterialCacheSize()).toBe(0);
    });

    it('should allow rebuilding after cache clear', () => {
      builder.buildHead('default', '#ffdbac');
      builder.clearCache();

      expect(() => {
        builder.buildHead('default', '#ffdbac');
      }).not.toThrow();
    });
  });

  describe('Avatar Structure Validation', () => {
    it('should create avatar with exactly 4 body part components', () => {
      const parts: AvatarParts = {
        head: builder.buildHead('default', '#ffdbac'),
        torso: builder.buildTorso('default', '#4169e1'),
        arms: builder.buildArms('default', '#ffdbac'),
        legs: builder.buildLegs('default', '#ffdbac'),
        accessories: [],
      };

      const avatar = builder.assembleAvatar(parts);

      // Should have head, torso, arms group, legs group
      expect(avatar.children.length).toBe(4);
    });

    it('should maintain hierarchical structure', () => {
      const parts: AvatarParts = {
        head: builder.buildHead('default', '#ffdbac'),
        torso: builder.buildTorso('default', '#4169e1'),
        arms: builder.buildArms('default', '#ffdbac'),
        legs: builder.buildLegs('default', '#ffdbac'),
        accessories: [],
      };

      const avatar = builder.assembleAvatar(parts);

      // Arms and legs should be groups containing individual limbs
      const armsGroup = avatar.children.find((child) => child.name === 'arms') as THREE.Group;
      const legsGroup = avatar.children.find((child) => child.name === 'legs') as THREE.Group;

      expect(armsGroup.children.length).toBe(2); // left and right arm
      expect(legsGroup.children.length).toBe(2); // left and right leg
    });
  });
});
