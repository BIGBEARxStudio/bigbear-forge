import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AvatarSystemImpl } from './AvatarSystem';
import type { ThreeJSDependencies } from './AvatarSystemDI';
import type { AvatarPreset } from '@/types';

// Mock Three.js objects
class MockWebGLRenderer {
  domElement = document.createElement('canvas');
  setSize = vi.fn();
  render = vi.fn();
  dispose = vi.fn();
}

class MockScene {
  children: any[] = [];
  add = vi.fn((obj: any) => this.children.push(obj));
  remove = vi.fn((obj: any) => {
    const index = this.children.indexOf(obj);
    if (index > -1) this.children.splice(index, 1);
  });
}

class MockPerspectiveCamera {
  position = { x: 0, y: 0, z: 5, set: vi.fn() };
  aspect = 1;
  updateProjectionMatrix = vi.fn();
  lookAt = vi.fn();
}

describe('AvatarSystem', () => {
  let avatarSystem: AvatarSystemImpl;
  let mockDependencies: ThreeJSDependencies;
  let mockCanvas: HTMLCanvasElement;
  let mockRenderer: MockWebGLRenderer;
  let mockScene: MockScene;
  let mockCamera: MockPerspectiveCamera;

  beforeEach(() => {
    mockRenderer = new MockWebGLRenderer();
    mockScene = new MockScene();
    mockCamera = new MockPerspectiveCamera();

    mockDependencies = {
      rendererFactory: vi.fn(() => mockRenderer as any),
      sceneFactory: vi.fn(() => mockScene as any),
      cameraFactory: vi.fn(() => mockCamera as any),
    };

    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    avatarSystem = new AvatarSystemImpl(mockDependencies);

    // Mock WebGL as available by default
    vi.spyOn(avatarSystem, 'isWebGLAvailable').mockReturnValue(true);
  });

  afterEach(() => {
    avatarSystem.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with canvas and create Three.js components', async () => {
      await avatarSystem.initialize(mockCanvas);

      expect(mockDependencies.sceneFactory).toHaveBeenCalled();
      expect(mockDependencies.rendererFactory).toHaveBeenCalledWith(mockCanvas);
      expect(mockDependencies.cameraFactory).toHaveBeenCalledWith(45, 800 / 600, 0.1, 1000);
      expect(mockCamera.position.set).toHaveBeenCalledWith(0, 1.6, 5);
    });

    it('should setup lighting with ambient, directional, and point lights', async () => {
      await avatarSystem.initialize(mockCanvas);

      expect(mockScene.add).toHaveBeenCalledTimes(3); // 3 lights
    });

    it('should throw error when WebGL is not available', async () => {
      // Mock WebGL unavailable
      vi.spyOn(avatarSystem, 'isWebGLAvailable').mockReturnValue(false);

      await expect(avatarSystem.initialize(mockCanvas)).rejects.toThrow('WebGL not available');
    });

    it('should start render loop after initialization', async () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');

      await avatarSystem.initialize(mockCanvas);

      expect(rafSpy).toHaveBeenCalled();

      rafSpy.mockRestore();
    });
  });

  describe('Canvas Resize', () => {
    it('should update renderer size and camera aspect on resize', async () => {
      await avatarSystem.initialize(mockCanvas);

      avatarSystem.handleResize(1024, 768);

      expect(mockRenderer.setSize).toHaveBeenCalledWith(1024, 768);
      expect(mockCamera.aspect).toBe(1024 / 768);
      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalled();
    });

    it('should handle multiple resize events', async () => {
      await avatarSystem.initialize(mockCanvas);

      avatarSystem.handleResize(800, 600);
      avatarSystem.handleResize(1920, 1080);
      avatarSystem.handleResize(1024, 768);

      expect(mockRenderer.setSize).toHaveBeenCalledTimes(3);
      expect(mockCamera.updateProjectionMatrix).toHaveBeenCalledTimes(3);
      expect(mockCamera.aspect).toBe(1024 / 768);
    });

    it('should not crash when resizing before initialization', () => {
      expect(() => avatarSystem.handleResize(800, 600)).not.toThrow();
    });
  });

  describe('Avatar Creation', () => {
    const testPreset: AvatarPreset = {
      id: 'test_avatar',
      name: 'Test Avatar',
      customization: {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      },
    };

    it('should create avatar from preset', async () => {
      await avatarSystem.initialize(mockCanvas);

      const avatar = avatarSystem.createAvatar(testPreset);

      expect(avatar.id).toBe('test_avatar');
      expect(avatar.customization).toEqual(testPreset.customization);
      expect(avatar.mesh).toBeDefined();
    });

    it('should add avatar mesh to scene', async () => {
      await avatarSystem.initialize(mockCanvas);

      avatarSystem.createAvatar(testPreset);

      expect(mockScene.add).toHaveBeenCalled();
    });

    it('should store avatar in internal map', async () => {
      await avatarSystem.initialize(mockCanvas);

      avatarSystem.createAvatar(testPreset);

      const retrievedAvatar = avatarSystem.getAvatar('test_avatar');
      expect(retrievedAvatar).toBeDefined();
      expect(retrievedAvatar?.id).toBe('test_avatar');
    });
  });

  describe('Avatar Update', () => {
    const testPreset: AvatarPreset = {
      id: 'test_avatar',
      name: 'Test Avatar',
      customization: {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      },
    };

    it('should update avatar customization', async () => {
      await avatarSystem.initialize(mockCanvas);
      avatarSystem.createAvatar(testPreset);

      const newCustomization = {
        ...testPreset.customization,
        colors: {
          skin: '#ffffff',
          hair: '#000000',
          clothing: '#ff0000',
        },
      };

      avatarSystem.updateAvatar('test_avatar', newCustomization);

      const avatar = avatarSystem.getAvatar('test_avatar');
      expect(avatar?.customization.colors).toEqual(newCustomization.colors);
    });

    it('should throw error when updating non-existent avatar', async () => {
      await avatarSystem.initialize(mockCanvas);

      expect(() => {
        avatarSystem.updateAvatar('non_existent', testPreset.customization);
      }).toThrow('Avatar non_existent not found');
    });
  });

  describe('Animation', () => {
    const testPreset: AvatarPreset = {
      id: 'test_avatar',
      name: 'Test Avatar',
      customization: {
        bodyParts: {
          head: 'default',
          torso: 'default',
          arms: 'default',
          legs: 'default',
        },
        colors: {
          skin: '#ffdbac',
          hair: '#8b4513',
          clothing: '#4169e1',
        },
        accessories: {},
      },
    };

    it('should not throw when playing animation on existing avatar', async () => {
      await avatarSystem.initialize(mockCanvas);
      avatarSystem.createAvatar(testPreset);

      expect(() => {
        avatarSystem.playAnimation('test_avatar', 'idle');
      }).not.toThrow();
    });

    it('should throw error when playing animation on non-existent avatar', async () => {
      await avatarSystem.initialize(mockCanvas);

      expect(() => {
        avatarSystem.playAnimation('non_existent', 'idle');
      }).toThrow('Avatar non_existent not found');
    });
  });

  describe('Disposal', () => {
    it('should stop render loop on dispose', async () => {
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
      const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');

      await avatarSystem.initialize(mockCanvas);
      avatarSystem.dispose();

      expect(cafSpy).toHaveBeenCalled();

      rafSpy.mockRestore();
      cafSpy.mockRestore();
    });

    it('should dispose renderer', async () => {
      await avatarSystem.initialize(mockCanvas);
      avatarSystem.dispose();

      expect(mockRenderer.dispose).toHaveBeenCalled();
      expect(avatarSystem.getRenderer()).toBeNull();
    });

    it('should remove all avatars from scene', async () => {
      await avatarSystem.initialize(mockCanvas);

      const preset1: AvatarPreset = {
        id: 'avatar1',
        name: 'Avatar 1',
        customization: {
          bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
          colors: { skin: '#ffdbac', hair: '#8b4513', clothing: '#4169e1' },
          accessories: {},
        },
      };

      const preset2: AvatarPreset = {
        id: 'avatar2',
        name: 'Avatar 2',
        customization: {
          bodyParts: { head: 'default', torso: 'default', arms: 'default', legs: 'default' },
          colors: { skin: '#ffdbac', hair: '#8b4513', clothing: '#4169e1' },
          accessories: {},
        },
      };

      avatarSystem.createAvatar(preset1);
      avatarSystem.createAvatar(preset2);

      avatarSystem.dispose();

      expect(mockScene.remove).toHaveBeenCalledTimes(2);
    });

    it('should not crash when disposing before initialization', () => {
      expect(() => avatarSystem.dispose()).not.toThrow();
    });

    it('should not crash when disposing multiple times', async () => {
      await avatarSystem.initialize(mockCanvas);

      expect(() => {
        avatarSystem.dispose();
        avatarSystem.dispose();
      }).not.toThrow();
    });
  });

  describe('WebGL Detection', () => {
    it('should return true when WebGL is available', () => {
      expect(avatarSystem.isWebGLAvailable()).toBe(true);
    });
  });
});
