import * as THREE from 'three';

export interface CameraConfig {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  dampingFactor: number;
}

export interface CameraController {
  setTarget(target: THREE.Vector3): void;
  orbit(deltaX: number, deltaY: number): void;
  zoom(delta: number): void;
  update(deltaTime: number): void;
  reset(): void;
}

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  minDistance: 2,
  maxDistance: 10,
  minPolarAngle: 0.1,
  maxPolarAngle: Math.PI / 2,
  dampingFactor: 0.05,
};

export class CameraControllerImpl implements CameraController {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  private distance: number = 5;
  private azimuthAngle: number = 0;
  private polarAngle: number = Math.PI / 4;
  private config: CameraConfig;

  // Smooth damping targets
  private targetDistance: number = 5;
  private targetAzimuth: number = 0;
  private targetPolar: number = Math.PI / 4;

  constructor(camera: THREE.PerspectiveCamera, config: CameraConfig = DEFAULT_CAMERA_CONFIG) {
    this.camera = camera;
    this.config = config;
    this.targetDistance = this.distance;
    this.targetAzimuth = this.azimuthAngle;
    this.targetPolar = this.polarAngle;
    this.updateCameraPosition();
  }

  setTarget(target: THREE.Vector3): void {
    this.target.copy(target);
    this.updateCameraPosition();
  }

  orbit(deltaX: number, deltaY: number): void {
    this.targetAzimuth += deltaX * 0.01;
    this.targetPolar = THREE.MathUtils.clamp(
      this.targetPolar + deltaY * 0.01,
      this.config.minPolarAngle,
      this.config.maxPolarAngle
    );
  }

  zoom(delta: number): void {
    this.targetDistance = THREE.MathUtils.clamp(
      this.targetDistance + delta * 0.1,
      this.config.minDistance,
      this.config.maxDistance
    );
  }

  update(deltaTime: number): void {
    if (deltaTime === 0) return;

    // Smooth damping - higher dampingFactor = slower movement
    const dampingFactor = Math.min(1, deltaTime * (1 - this.config.dampingFactor) * 10);

    this.distance = THREE.MathUtils.lerp(
      this.distance,
      this.targetDistance,
      dampingFactor
    );

    this.azimuthAngle = THREE.MathUtils.lerp(
      this.azimuthAngle,
      this.targetAzimuth,
      dampingFactor
    );

    this.polarAngle = THREE.MathUtils.lerp(
      this.polarAngle,
      this.targetPolar,
      dampingFactor
    );

    this.updateCameraPosition();
  }

  reset(): void {
    this.targetDistance = 5;
    this.targetAzimuth = 0;
    this.targetPolar = Math.PI / 4;
  }

  private updateCameraPosition(): void {
    // Calculate camera position from spherical coordinates
    const x = this.distance * Math.sin(this.polarAngle) * Math.cos(this.azimuthAngle);
    const y = this.distance * Math.cos(this.polarAngle);
    const z = this.distance * Math.sin(this.polarAngle) * Math.sin(this.azimuthAngle);

    this.camera.position.set(
      this.target.x + x,
      this.target.y + y,
      this.target.z + z
    );

    this.camera.lookAt(this.target);
  }
}
