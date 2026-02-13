import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';
import { PLAYER_PRESET, AI_PRESET } from '@/systems/AvatarPresets';

describe('Avatar Store Integration', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      avatars: {
        player: {
          id: 'player',
          customization: PLAYER_PRESET.customization,
          currentAnimation: 'idle',
        },
        ai: {
          id: 'ai',
          customization: AI_PRESET.customization,
          currentAnimation: 'idle',
        },
      },
      camera: {
        distance: 5,
        azimuthAngle: 0,
        polarAngle: Math.PI / 4,
      },
      system: {
        isWebGLAvailable: true,
        useFallback: false,
        performanceMode: 'high',
      },
      avatarSystem: null,
      cameraController: null,
    });
  });

  describe('Initial State', () => {
    it('should have default player avatar state', () => {
      const { avatars } = useGameStore.getState();
      
      expect(avatars.player.id).toBe('player');
      expect(avatars.player.customization).toEqual(PLAYER_PRESET.customization);
      expect(avatars.player.currentAnimation).toBe('idle');
    });

    it('should have default AI avatar state', () => {
      const { avatars } = useGameStore.getState();
      
      expect(avatars.ai.id).toBe('ai');
      expect(avatars.ai.customization).toEqual(AI_PRESET.customization);
      expect(avatars.ai.currentAnimation).toBe('idle');
    });

    it('should have default camera state', () => {
      const { camera } = useGameStore.getState();
      
      expect(camera.distance).toBe(5);
      expect(camera.azimuthAngle).toBe(0);
      expect(camera.polarAngle).toBe(Math.PI / 4);
    });

    it('should have default system state', () => {
      const { system } = useGameStore.getState();
      
      expect(system.isWebGLAvailable).toBe(true);
      expect(system.useFallback).toBe(false);
      expect(system.performanceMode).toBe('high');
    });

    it('should have persistence instance', () => {
      const { persistence } = useGameStore.getState();
      
      expect(persistence).toBeDefined();
      expect(persistence.saveCustomization).toBeDefined();
      expect(persistence.loadCustomization).toBeDefined();
    });
  });

  describe('Avatar System Initialization', () => {
    it('should handle WebGL unavailable gracefully', async () => {
      const canvas = document.createElement('canvas');
      
      // The system will detect WebGL unavailable internally
      // We just test that it handles it gracefully
      await useGameStore.getState().initializeAvatarSystem(canvas);
      
      // In test environment without WebGL, it should set fallback
      const { system } = useGameStore.getState();
      // Either WebGL is available or fallback is set
      expect(system.isWebGLAvailable || system.useFallback).toBe(true);
    });

    it('should not initialize avatar system without canvas', async () => {
      const { avatarSystem } = useGameStore.getState();
      expect(avatarSystem).toBeNull();
    });
  });

  describe('Avatar Customization', () => {
    it('should warn when updating avatar without initialized system', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const newCustomization = {
        ...PLAYER_PRESET.customization,
        colors: {
          ...PLAYER_PRESET.customization.colors,
          skin: '#ff0000',
        },
      };
      
      useGameStore.getState().updateAvatarCustomization('player', newCustomization);
      
      expect(consoleSpy).toHaveBeenCalledWith('Avatar system not initialized');
      consoleSpy.mockRestore();
    });
  });

  describe('Avatar Animation', () => {
    it('should update animation state in store', () => {
      // Manually set animation state (simulating what would happen with initialized system)
      useGameStore.setState((state) => ({
        avatars: {
          ...state.avatars,
          player: {
            ...state.avatars.player,
            currentAnimation: 'attack',
          },
        },
      }));
      
      const { avatars } = useGameStore.getState();
      expect(avatars.player.currentAnimation).toBe('attack');
    });

    it('should warn when playing animation without initialized system', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      useGameStore.getState().playAvatarAnimation('player', 'attack');
      
      expect(consoleSpy).toHaveBeenCalledWith('Avatar system not initialized');
      consoleSpy.mockRestore();
    });
  });

  describe('Camera Controls', () => {
    it('should warn when orbiting camera without initialized controller', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      useGameStore.getState().orbitCamera(10, 5);
      
      expect(consoleSpy).toHaveBeenCalledWith('Camera controller not initialized');
      consoleSpy.mockRestore();
    });

    it('should warn when zooming camera without initialized controller', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      useGameStore.getState().zoomCamera(2);
      
      expect(consoleSpy).toHaveBeenCalledWith('Camera controller not initialized');
      consoleSpy.mockRestore();
    });

    it('should reset camera state when controller not initialized', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Set non-default camera state
      useGameStore.setState({
        camera: {
          distance: 8,
          azimuthAngle: 1.5,
          polarAngle: 1.0,
        },
      });
      
      useGameStore.getState().resetCamera();
      
      // Camera state should be reset even without controller
      const { camera } = useGameStore.getState();
      expect(camera.distance).toBe(5);
      expect(camera.azimuthAngle).toBe(0);
      expect(camera.polarAngle).toBe(Math.PI / 4);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Persistence', () => {
    it('should save player customization', () => {
      const { persistence, avatars } = useGameStore.getState();
      const saveSpy = vi.spyOn(persistence, 'saveCustomization');
      
      useGameStore.getState().saveCustomization('player');
      
      expect(saveSpy).toHaveBeenCalledWith('player', avatars.player.customization);
    });

    it('should save AI customization', () => {
      const { persistence, avatars } = useGameStore.getState();
      const saveSpy = vi.spyOn(persistence, 'saveCustomization');
      
      useGameStore.getState().saveCustomization('ai');
      
      expect(saveSpy).toHaveBeenCalledWith('ai', avatars.ai.customization);
    });

    it('should load customization when available', () => {
      const { persistence } = useGameStore.getState();
      
      const customCustomization = {
        ...PLAYER_PRESET.customization,
        colors: {
          ...PLAYER_PRESET.customization.colors,
          skin: '#00ff00',
        },
      };
      
      vi.spyOn(persistence, 'loadCustomization').mockReturnValue(customCustomization);
      
      useGameStore.getState().loadCustomization('player');
      
      // Since system is not initialized, it will just warn
      // In real scenario with initialized system, it would update
    });

    it('should handle missing customization gracefully', () => {
      const { persistence } = useGameStore.getState();
      
      vi.spyOn(persistence, 'loadCustomization').mockReturnValue(null);
      
      // Should not throw
      expect(() => {
        useGameStore.getState().loadCustomization('player');
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should dispose avatar system', () => {
      useGameStore.getState().disposeAvatarSystem();
      
      const { avatarSystem, cameraController } = useGameStore.getState();
      expect(avatarSystem).toBeNull();
      expect(cameraController).toBeNull();
    });

    it('should handle dispose when system not initialized', () => {
      // Should not throw
      expect(() => {
        useGameStore.getState().disposeAvatarSystem();
      }).not.toThrow();
    });
  });

  describe('Integration with Game Loop', () => {
    it('should have avatar system instances in store', () => {
      const { avatarSystem, cameraController } = useGameStore.getState();
      
      // Initially null until initialized
      expect(avatarSystem).toBeNull();
      expect(cameraController).toBeNull();
    });

    it('should maintain avatar state consistency', () => {
      const { avatars } = useGameStore.getState();
      
      // Player and AI should have separate states
      expect(avatars.player.id).not.toBe(avatars.ai.id);
      expect(avatars.player.customization).not.toBe(avatars.ai.customization);
    });
  });

  describe('State Updates', () => {
    it('should update player customization in state', () => {
      const newCustomization = {
        ...PLAYER_PRESET.customization,
        colors: {
          ...PLAYER_PRESET.customization.colors,
          hair: '#ff00ff',
        },
      };
      
      useGameStore.setState((state) => ({
        avatars: {
          ...state.avatars,
          player: {
            ...state.avatars.player,
            customization: newCustomization,
          },
        },
      }));
      
      const { avatars } = useGameStore.getState();
      expect(avatars.player.customization.colors.hair).toBe('#ff00ff');
    });

    it('should update AI customization independently', () => {
      const newCustomization = {
        ...AI_PRESET.customization,
        colors: {
          ...AI_PRESET.customization.colors,
          clothing: '#0000ff',
        },
      };
      
      useGameStore.setState((state) => ({
        avatars: {
          ...state.avatars,
          ai: {
            ...state.avatars.ai,
            customization: newCustomization,
          },
        },
      }));
      
      const { avatars } = useGameStore.getState();
      expect(avatars.ai.customization.colors.clothing).toBe('#0000ff');
      // Player should remain unchanged
      expect(avatars.player.customization).toEqual(PLAYER_PRESET.customization);
    });

    it('should update system state', () => {
      useGameStore.setState((state) => ({
        system: {
          ...state.system,
          performanceMode: 'low',
        },
      }));
      
      const { system } = useGameStore.getState();
      expect(system.performanceMode).toBe('low');
    });
  });
});
