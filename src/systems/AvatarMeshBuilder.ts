/**
 * Avatar Mesh Builder
 * Constructs 3D avatar meshes from modular body parts with geometry/material caching
 */

import * as THREE from 'three';

export interface AvatarParts {
  head: THREE.Mesh;
  torso: THREE.Mesh;
  arms: THREE.Group;
  legs: THREE.Group;
  accessories: THREE.Mesh[];
}

export interface AvatarMeshBuilder {
  buildHead(type: string, color: string): THREE.Mesh;
  buildTorso(type: string, color: string): THREE.Mesh;
  buildArms(type: string, color: string): THREE.Group;
  buildLegs(type: string, color: string): THREE.Group;
  buildAccessory(type: string, attachPoint: string): THREE.Mesh;
  assembleAvatar(parts: AvatarParts): THREE.Group;
  clearCache(): void;
}

export class AvatarMeshBuilderImpl implements AvatarMeshBuilder {
  private geometryCache: Map<string, THREE.BufferGeometry> = new Map();
  private materialCache: Map<string, THREE.Material> = new Map();

  buildHead(type: string, color: string): THREE.Mesh {
    const geometry = this.getOrCreateGeometry(`head_${type}`, () => {
      // Simple sphere for head
      return new THREE.SphereGeometry(0.3, 16, 16);
    });

    const material = this.getOrCreateMaterial(`head_${color}`, () => {
      return new THREE.MeshStandardMaterial({ color });
    });

    const head = new THREE.Mesh(geometry, material);
    head.position.y = 1.5;
    head.name = 'head';
    head.castShadow = true;
    head.receiveShadow = true;

    return head;
  }

  buildTorso(type: string, color: string): THREE.Mesh {
    const geometry = this.getOrCreateGeometry(`torso_${type}`, () => {
      // Box for torso
      return new THREE.BoxGeometry(0.6, 0.8, 0.3);
    });

    const material = this.getOrCreateMaterial(`torso_${color}`, () => {
      return new THREE.MeshStandardMaterial({ color });
    });

    const torso = new THREE.Mesh(geometry, material);
    torso.position.y = 0.9;
    torso.name = 'torso';
    torso.castShadow = true;
    torso.receiveShadow = true;

    return torso;
  }

  buildArms(type: string, color: string): THREE.Group {
    const armsGroup = new THREE.Group();
    armsGroup.name = 'arms';

    const armGeometry = this.getOrCreateGeometry(`arm_${type}`, () => {
      // Cylinder for arms
      return new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
    });

    const material = this.getOrCreateMaterial(`arm_${color}`, () => {
      return new THREE.MeshStandardMaterial({ color });
    });

    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(-0.4, 0.9, 0);
    leftArm.name = 'leftArm';
    leftArm.castShadow = true;
    leftArm.receiveShadow = true;

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(0.4, 0.9, 0);
    rightArm.name = 'rightArm';
    rightArm.castShadow = true;
    rightArm.receiveShadow = true;

    armsGroup.add(leftArm);
    armsGroup.add(rightArm);

    return armsGroup;
  }

  buildLegs(type: string, color: string): THREE.Group {
    const legsGroup = new THREE.Group();
    legsGroup.name = 'legs';

    const legGeometry = this.getOrCreateGeometry(`leg_${type}`, () => {
      // Cylinder for legs
      return new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8);
    });

    const material = this.getOrCreateMaterial(`leg_${color}`, () => {
      return new THREE.MeshStandardMaterial({ color });
    });

    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, material);
    leftLeg.position.set(-0.15, 0.15, 0);
    leftLeg.name = 'leftLeg';
    leftLeg.castShadow = true;
    leftLeg.receiveShadow = true;

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, material);
    rightLeg.position.set(0.15, 0.15, 0);
    rightLeg.name = 'rightLeg';
    rightLeg.castShadow = true;
    rightLeg.receiveShadow = true;

    legsGroup.add(leftLeg);
    legsGroup.add(rightLeg);

    return legsGroup;
  }

  buildAccessory(type: string, attachPoint: string): THREE.Mesh {
    const geometry = this.getOrCreateGeometry(`accessory_${type}`, () => {
      // Different geometries based on accessory type
      switch (type) {
        case 'sword':
        case 'axe':
        case 'staff':
          // Weapon - thin box
          return new THREE.BoxGeometry(0.1, 0.5, 0.1);
        case 'round':
        case 'kite':
        case 'tower':
          // Shield - flat box
          return new THREE.BoxGeometry(0.3, 0.4, 0.05);
        case 'cap':
        case 'helmet':
        case 'crown':
          // Hat - small box on top
          return new THREE.BoxGeometry(0.35, 0.15, 0.35);
        default:
          return new THREE.BoxGeometry(0.2, 0.2, 0.2);
      }
    });

    const material = this.getOrCreateMaterial(`accessory_${type}`, () => {
      // Different colors based on accessory type
      const colorMap: Record<string, number> = {
        sword: 0xc0c0c0, // Silver
        axe: 0x8b4513, // Brown
        staff: 0x8b4513, // Brown
        round: 0x8b4513, // Brown
        kite: 0x4169e1, // Blue
        tower: 0x808080, // Gray
        cap: 0xff0000, // Red
        helmet: 0xc0c0c0, // Silver
        crown: 0xffd700, // Gold
      };
      return new THREE.MeshStandardMaterial({ color: colorMap[type] || 0xffffff });
    });

    const accessory = new THREE.Mesh(geometry, material);
    accessory.name = `accessory_${type}_${attachPoint}`;
    accessory.castShadow = true;
    accessory.receiveShadow = true;

    // Position based on attach point
    switch (attachPoint) {
      case 'head':
        accessory.position.set(0, 1.7, 0);
        break;
      case 'leftHand':
        accessory.position.set(-0.4, 0.6, 0);
        break;
      case 'rightHand':
        accessory.position.set(0.4, 0.6, 0);
        break;
      default:
        accessory.position.set(0, 0, 0);
    }

    return accessory;
  }

  assembleAvatar(parts: AvatarParts): THREE.Group {
    const avatarGroup = new THREE.Group();
    avatarGroup.name = 'avatar';

    // Add body parts in order
    avatarGroup.add(parts.head);
    avatarGroup.add(parts.torso);
    avatarGroup.add(parts.arms);
    avatarGroup.add(parts.legs);

    // Add accessories
    parts.accessories.forEach((accessory) => {
      avatarGroup.add(accessory);
    });

    return avatarGroup;
  }

  clearCache(): void {
    // Dispose geometries
    this.geometryCache.forEach((geometry) => {
      geometry.dispose();
    });
    this.geometryCache.clear();

    // Dispose materials
    this.materialCache.forEach((material) => {
      material.dispose();
    });
    this.materialCache.clear();
  }

  // Cache management
  private getOrCreateGeometry(
    key: string,
    factory: () => THREE.BufferGeometry
  ): THREE.BufferGeometry {
    if (!this.geometryCache.has(key)) {
      this.geometryCache.set(key, factory());
    }
    return this.geometryCache.get(key)!;
  }

  private getOrCreateMaterial(key: string, factory: () => THREE.Material): THREE.Material {
    if (!this.materialCache.has(key)) {
      this.materialCache.set(key, factory());
    }
    return this.materialCache.get(key)!;
  }

  // Getters for testing
  getGeometryCacheSize(): number {
    return this.geometryCache.size;
  }

  getMaterialCacheSize(): number {
    return this.materialCache.size;
  }
}
