import * as THREE from 'three';
import type { AnimationState } from '../types';

export interface Keyframe {
  time: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export interface AnimationClip {
  state: AnimationState;
  duration: number;
  loop: boolean;
  keyframes: Keyframe[];
}

export interface AnimationController {
  playAnimation(state: AnimationState): void;
  getCurrentState(): AnimationState;
  update(deltaTime: number): void;
  onAnimationComplete(callback: () => void): void;
}

export class AnimationControllerImpl implements AnimationController {
  private currentState: AnimationState = 'idle';
  private currentTime: number = 0;
  private currentClip: AnimationClip | null = null;
  private mesh: THREE.Group;
  private onCompleteCallback: (() => void) | null = null;

  constructor(mesh: THREE.Group) {
    this.mesh = mesh;
    this.currentClip = this.getAnimationClip('idle');
  }

  playAnimation(state: AnimationState): void {
    if (this.currentState === state) return;

    this.currentState = state;
    this.currentTime = 0;
    this.currentClip = this.getAnimationClip(state);
  }

  getCurrentState(): AnimationState {
    return this.currentState;
  }

  update(deltaTime: number): void {
    if (!this.currentClip) return;

    this.currentTime += deltaTime;

    // Check if animation complete
    if (this.currentTime >= this.currentClip.duration) {
      if (this.currentClip.loop) {
        this.currentTime = 0;
      } else {
        // Call completion callback before transitioning
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
          this.onCompleteCallback = null;
        }

        // Non-looping animations return to idle (except victory/defeat)
        if (
          this.currentState !== 'idle' &&
          this.currentState !== 'victory' &&
          this.currentState !== 'defeat'
        ) {
          this.playAnimation('idle');
          return;
        }
        
        // For victory/defeat, clamp time to duration to hold final frame
        this.currentTime = this.currentClip.duration;
      }
    }

    // Apply keyframe interpolation
    this.applyKeyframes(this.currentTime);
  }

  onAnimationComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  private getAnimationClip(state: AnimationState): AnimationClip {
    switch (state) {
      case 'idle':
        return {
          state: 'idle',
          duration: 2.0,
          loop: true,
          keyframes: [
            { time: 0, position: new THREE.Vector3(0, 0, 0) },
            { time: 1.0, position: new THREE.Vector3(0, 0.1, 0) },
            { time: 2.0, position: new THREE.Vector3(0, 0, 0) },
          ],
        };

      case 'attack':
        return {
          state: 'attack',
          duration: 0.5,
          loop: false,
          keyframes: [
            { time: 0, position: new THREE.Vector3(0, 0, 0) },
            { time: 0.2, position: new THREE.Vector3(0.5, 0, 0.5) },
            { time: 0.5, position: new THREE.Vector3(0, 0, 0) },
          ],
        };

      case 'defend':
        return {
          state: 'defend',
          duration: 0.3,
          loop: false,
          keyframes: [
            { time: 0, scale: new THREE.Vector3(1, 1, 1) },
            { time: 0.15, scale: new THREE.Vector3(0.9, 1.1, 0.9) },
            { time: 0.3, scale: new THREE.Vector3(1, 1, 1) },
          ],
        };

      case 'damaged':
        return {
          state: 'damaged',
          duration: 0.4,
          loop: false,
          keyframes: [
            { time: 0, rotation: new THREE.Euler(0, 0, 0) },
            { time: 0.1, rotation: new THREE.Euler(0, 0, 0.2) },
            { time: 0.2, rotation: new THREE.Euler(0, 0, -0.2) },
            { time: 0.4, rotation: new THREE.Euler(0, 0, 0) },
          ],
        };

      case 'victory':
        return {
          state: 'victory',
          duration: 1.0,
          loop: false,
          keyframes: [
            { time: 0, position: new THREE.Vector3(0, 0, 0) },
            { time: 0.5, position: new THREE.Vector3(0, 0.5, 0) },
            { time: 1.0, position: new THREE.Vector3(0, 0.3, 0) },
          ],
        };

      case 'defeat':
        return {
          state: 'defeat',
          duration: 1.0,
          loop: false,
          keyframes: [
            { time: 0, rotation: new THREE.Euler(0, 0, 0) },
            { time: 1.0, rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
          ],
        };

      default:
        return this.getAnimationClip('idle');
    }
  }

  private applyKeyframes(time: number): void {
    if (!this.currentClip) return;

    // Find surrounding keyframes
    const keyframes = this.currentClip.keyframes;
    let prevFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (time >= keyframes[i].time && time <= keyframes[i + 1].time) {
        prevFrame = keyframes[i];
        nextFrame = keyframes[i + 1];
        break;
      }
    }

    // Interpolate between keyframes
    const t = (time - prevFrame.time) / (nextFrame.time - prevFrame.time);

    if (prevFrame.position && nextFrame.position) {
      this.mesh.position.lerpVectors(prevFrame.position, nextFrame.position, t);
    }

    if (prevFrame.rotation && nextFrame.rotation) {
      this.mesh.rotation.set(
        THREE.MathUtils.lerp(prevFrame.rotation.x, nextFrame.rotation.x, t),
        THREE.MathUtils.lerp(prevFrame.rotation.y, nextFrame.rotation.y, t),
        THREE.MathUtils.lerp(prevFrame.rotation.z, nextFrame.rotation.z, t)
      );
    }

    if (prevFrame.scale && nextFrame.scale) {
      this.mesh.scale.lerpVectors(prevFrame.scale, nextFrame.scale, t);
    }
  }
}
