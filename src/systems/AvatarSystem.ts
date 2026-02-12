/**
 * Avatar System Core
 * Manages Three.js rendering, avatar lifecycle, and integration with game loop
 */

import * as THREE from 'three';
import type { Avatar, AvatarPreset, AnimationState, CustomizationData } from '@/types';
import type { ThreeJSDependencies } from './AvatarSystemDI';
import { defaultThreeJSDependencies } from './AvatarSystemDI';
import { isWebGLAvailable } from './WebGLDetection';
import { AvatarMeshBuilderImpl } from './AvatarMeshBuilder';
import type { AvatarParts } from './AvatarMeshBuilder';
import { validateCustomizationData } from './CustomizationValidator';

export class AvatarSystemImpl {
  private scene: THREE.Scene | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private avatars: Map<string, Avatar> = new Map();
  private animationFrameId: number | null = null;
  private dependencies: ThreeJSDependencies;
  private canvas: HTMLCanvasElement | null = null;
  private meshBuilder: AvatarMeshBuilderImpl;

  constructor(dependencies: ThreeJSDependencies = defaultThreeJSDependencies) {
    this.dependencies = dependencies;
    this.meshBuilder = new AvatarMeshBuilderImpl();
  }

  isWebGLAvailable(): boolean {
    return isWebGLAvailable();
  }

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (!this.isWebGLAvailable()) {
      throw new Error('WebGL not available');
    }

    this.canvas = canvas;

    // Initialize Three.js components
    this.scene = this.dependencies.sceneFactory();
    this.renderer = this.dependencies.rendererFactory(canvas);

    const aspect = canvas.width / canvas.height;
    this.camera = this.dependencies.cameraFactory(
      45, // FOV
      aspect,
      0.1, // near
      1000 // far
    );
    this.camera.position.set(0, 1.6, 5);

    // Setup lighting
    this.setupLighting();

    // Start render loop
    this.startRenderLoop();

    // Setup resize handler
    this.setupResizeHandler();
  }

  private setupLighting(): void {
    if (!this.scene) return;

    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    ambientLight.name = 'ambient';
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.name = 'directional';
    this.scene.add(directionalLight);

    // Point light for highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
    pointLight.position.set(0, 3, 2);
    pointLight.name = 'point';
    this.scene.add(pointLight);
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private setupResizeHandler(): void {
    if (!this.canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.handleResize(width, height);
      }
    });

    resizeObserver.observe(this.canvas);
  }

  handleResize(width: number, height: number): void {
    if (!this.renderer || !this.camera) return;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  createAvatar(preset: AvatarPreset): Avatar {
    const { customization } = preset;

    // Build avatar parts
    const parts: AvatarParts = {
      head: this.meshBuilder.buildHead(
        customization.bodyParts.head,
        customization.colors.skin
      ),
      torso: this.meshBuilder.buildTorso(
        customization.bodyParts.torso,
        customization.colors.clothing
      ),
      arms: this.meshBuilder.buildArms(
        customization.bodyParts.arms,
        customization.colors.skin
      ),
      legs: this.meshBuilder.buildLegs(
        customization.bodyParts.legs,
        customization.colors.clothing
      ),
      accessories: [],
    };

    // Add accessories if present
    if (customization.accessories.hat) {
      parts.accessories.push(
        this.meshBuilder.buildAccessory(customization.accessories.hat, 'head')
      );
    }
    if (customization.accessories.weapon) {
      parts.accessories.push(
        this.meshBuilder.buildAccessory(customization.accessories.weapon, 'rightHand')
      );
    }
    if (customization.accessories.shield) {
      parts.accessories.push(
        this.meshBuilder.buildAccessory(customization.accessories.shield, 'leftHand')
      );
    }

    // Assemble avatar
    const mesh = this.meshBuilder.assembleAvatar(parts);
    mesh.name = `avatar_${preset.id}`;

    if (this.scene) {
      this.scene.add(mesh);
    }

    const avatar: Avatar = {
      id: preset.id,
      mesh,
      animationController: null,
      customization: preset.customization,
    };

    this.avatars.set(preset.id, avatar);
    return avatar;
  }

  updateAvatar(avatarId: string, customization: CustomizationData): void {
    const avatar = this.avatars.get(avatarId);
    if (!avatar) {
      throw new Error(`Avatar ${avatarId} not found`);
    }

    // Validate customization data
    if (!validateCustomizationData(customization)) {
      throw new Error('Invalid customization data');
    }

    // Remove old mesh from scene
    if (this.scene) {
      this.scene.remove(avatar.mesh);
    }

    // Build new avatar parts with updated customization
    const parts: AvatarParts = {
      head: this.meshBuilder.buildHead(
        customization.bodyParts.head,
        customization.colors.skin
      ),
      torso: this.meshBuilder.buildTorso(
        customization.bodyParts.torso,
        customization.colors.clothing
      ),
      arms: this.meshBuilder.buildArms(
        customization.bodyParts.arms,
        customization.colors.skin
      ),
      legs: this.meshBuilder.buildLegs(
        customization.bodyParts.legs,
        customization.colors.clothing
      ),
      accessories: [],
    };

    // Add accessories if present
    if (customization.accessories.hat) {
      parts.accessories.push(
        this.meshBuilder.buildAccessory(customization.accessories.hat, 'head')
      );
    }
    if (customization.accessories.weapon) {
      parts.accessories.push(
        this.meshBuilder.buildAccessory(customization.accessories.weapon, 'rightHand')
      );
    }
    if (customization.accessories.shield) {
      parts.accessories.push(
        this.meshBuilder.buildAccessory(customization.accessories.shield, 'leftHand')
      );
    }

    // Assemble new avatar mesh
    const newMesh = this.meshBuilder.assembleAvatar(parts);
    newMesh.name = avatar.mesh.name;
    newMesh.position.copy(avatar.mesh.position);
    newMesh.rotation.copy(avatar.mesh.rotation);
    newMesh.scale.copy(avatar.mesh.scale);

    // Update avatar
    avatar.mesh = newMesh;
    avatar.customization = customization;

    // Add new mesh to scene
    if (this.scene) {
      this.scene.add(newMesh);
    }
  }

  playAnimation(avatarId: string, _state: AnimationState): void {
    const avatar = this.avatars.get(avatarId);
    if (!avatar) {
      throw new Error(`Avatar ${avatarId} not found`);
    }

    // Animation playback will be implemented in later tasks
  }

  dispose(): void {
    // Stop render loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Dispose avatars
    this.avatars.forEach((avatar) => {
      if (this.scene) {
        this.scene.remove(avatar.mesh);
      }
    });
    this.avatars.clear();

    // Clear mesh builder cache (disposes geometries and materials)
    this.meshBuilder.clearCache();

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.canvas = null;
  }

  // Getters for testing
  getScene(): THREE.Scene | null {
    return this.scene;
  }

  getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  getAvatar(avatarId: string): Avatar | undefined {
    return this.avatars.get(avatarId);
  }
}
