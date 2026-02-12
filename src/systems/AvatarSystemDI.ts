/**
 * Dependency Injection Interfaces for Avatar System
 * Enables mocking of Three.js objects for testing
 */

import * as THREE from 'three';

export interface ThreeJSDependencies {
  rendererFactory: (canvas: HTMLCanvasElement) => THREE.WebGLRenderer;
  sceneFactory: () => THREE.Scene;
  cameraFactory: (fov: number, aspect: number, near: number, far: number) => THREE.PerspectiveCamera;
}

export const defaultThreeJSDependencies: ThreeJSDependencies = {
  rendererFactory: (canvas: HTMLCanvasElement) => new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  }),
  sceneFactory: () => new THREE.Scene(),
  cameraFactory: (fov: number, aspect: number, near: number, far: number) => 
    new THREE.PerspectiveCamera(fov, aspect, near, far),
};
