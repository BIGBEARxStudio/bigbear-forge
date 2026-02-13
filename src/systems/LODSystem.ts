/**
 * LODSystem - Level of Detail management for avatar rendering
 * Adjusts avatar detail based on camera distance to maintain performance
 */

import * as THREE from 'three';
import { Avatar } from '../types';

export interface LODSystem {
  updateLOD(camera: THREE.Camera, avatars: Avatar[]): void;
  setLODDistances(near: number, far: number): void;
  getCurrentLODLevel(avatarId: string): 'high' | 'medium' | 'low';
}

export class LODSystemImpl implements LODSystem {
  private nearDistance: number = 5;
  private farDistance: number = 15;
  private lodLevels: Map<string, 'high' | 'medium' | 'low'> = new Map();

  constructor(nearDistance: number = 5, farDistance: number = 15) {
    this.nearDistance = nearDistance;
    this.farDistance = farDistance;
  }

  setLODDistances(near: number, far: number): void {
    if (near < 0 || far < 0) {
      throw new Error('LOD distances must be non-negative');
    }
    if (near >= far) {
      throw new Error('Near distance must be less than far distance');
    }
    this.nearDistance = near;
    this.farDistance = far;
  }

  updateLOD(camera: THREE.Camera, avatars: Avatar[]): void {
    if (!camera || !avatars) {
      return;
    }

    avatars.forEach(avatar => {
      if (!avatar || !avatar.mesh) {
        return;
      }

      const distance = camera.position.distanceTo(avatar.mesh.position);

      if (distance < this.nearDistance) {
        this.setHighDetail(avatar);
        this.lodLevels.set(avatar.id, 'high');
      } else if (distance < this.farDistance) {
        this.setMediumDetail(avatar);
        this.lodLevels.set(avatar.id, 'medium');
      } else {
        this.setLowDetail(avatar);
        this.lodLevels.set(avatar.id, 'low');
      }
    });
  }

  getCurrentLODLevel(avatarId: string): 'high' | 'medium' | 'low' {
    return this.lodLevels.get(avatarId) || 'high';
  }

  private setHighDetail(avatar: Avatar): void {
    avatar.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true;
        // High detail: all geometry visible
      }
    });
  }

  private setMediumDetail(avatar: Avatar): void {
    avatar.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.visible = true;
        // Medium detail: all geometry visible but could use simpler materials
      }
    });
  }

  private setLowDetail(avatar: Avatar): void {
    avatar.mesh.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        // Low detail: hide accessories to reduce draw calls
        if (child.name && child.name.includes('accessory')) {
          child.visible = false;
        } else {
          child.visible = true;
        }
      }
    });
  }
}
